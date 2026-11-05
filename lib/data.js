import { getAllDatabases } from "./mongodb";
import { parseMediaMetadata, slugify, formatSize } from "./helpers";

let catalogCache = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache
const TMDB_API_KEY = process.env.TMDB_API_KEY || "56b50689afe7438a51aab0d653679865";

async function fetchFilesFromDb(db) {
  const collectionNames = ["telegram_files", "files"];
  for (const name of collectionNames) {
    try {
      const docs = await db
        .collection(name)
        .find({})
        .sort({ _id: -1 })
        .limit(5000)
        .toArray();
      if (docs && docs.length > 0) {
        return docs;
      }
    } catch (e) {}
  }
  return [];
}

async function fetchLiveTmdb(query, isSeries = false, primaryDb = null, cacheKey = "") {
  const endpoints = [
    `https://tmdbapi.the-zake.workers.dev/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
    `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      const results = data.results || [];
      if (results.length === 0) continue;

      let chosen = results[0];
      for (const r of results) {
        if (isSeries && r.media_type === "tv") {
          chosen = r;
          break;
        } else if (!isSeries && r.media_type === "movie") {
          chosen = r;
          break;
        }
      }

      const posterPath = chosen.poster_path;
      const backdropPath = chosen.backdrop_path;

      const metadata = {
        title: chosen.title || chosen.name || query,
        rating: chosen.vote_average ? Math.round(chosen.vote_average * 10) / 10 : 0.0,
        overview: chosen.overview || "",
        poster_url: posterPath ? `https://image.tmdb.org/t/p/w780${posterPath}` : "",
        backdrop_url: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : "",
      };

      // Upsert to primary MongoDB cache if available
      if (primaryDb && cacheKey && metadata.poster_url) {
        primaryDb
          .collection("tmdb_post_cache")
          .updateOne(
            { key: cacheKey },
            { $set: { data: metadata, updated_at: new Date() } },
            { upsert: true }
          )
          .catch(() => {});
      }

      return metadata;
    } catch (err) {
      // Try next endpoint
    }
  }

  return null;
}

export async function getGroupedCatalog() {
  const now = Date.now();
  if (catalogCache.data && now - catalogCache.timestamp < CACHE_TTL_MS) {
    return catalogCache.data;
  }

  const dbs = await getAllDatabases();
  if (!dbs || dbs.length === 0) return [];

  // 1. Fetch files across all connected MongoDB databases (Primary + Secondary)
  let allDocs = [];
  for (const db of dbs) {
    try {
      const docs = await fetchFilesFromDb(db);
      allDocs = allDocs.concat(docs);
    } catch (err) {
      console.error("Error fetching files from database cluster:", err);
    }
  }

  // 2. Fetch rich metadata & posters from tmdb_post_cache
  const metaMap = new Map();
  for (const db of dbs) {
    try {
      const cacheDocs = await db.collection("tmdb_post_cache").find({}).toArray();
      for (const cd of cacheDocs) {
        if (cd.key && cd.data) {
          metaMap.set(cd.key.toLowerCase().trim(), cd.data);
        }
      }
    } catch (e) {}
  }

  const groups = {};

  for (const doc of allDocs) {
    const fileName = doc.file_name || "video.mp4";
    const meta = parseMediaMetadata(fileName);
    const title = meta.title || "Untitled";
    const groupKey = meta.isSeries && meta.season ? `${title} (Season ${meta.season})` : title;
    const baseSlug = slugify(groupKey);

    if (!groups[baseSlug]) {
      const cleanLower = (meta.cleanTitle || title).toLowerCase().trim();
      const year = meta.year || "";
      const isSeries = meta.isSeries;

      // Smart lookup candidates matching Python bot cache_key structure:
      // Python bot format: f"{clean_q.lower()}:{year or ''}:{1 if is_series else 0}"
      const candidates = [
        `${cleanLower}:${year}:${isSeries ? 1 : 0}`,
        `${cleanLower}::${isSeries ? 1 : 0}`,
        `${cleanLower}:${year}:0`,
        `${cleanLower}::1`,
        `${cleanLower}::0`,
        cleanLower,
      ];

      let tmdb = null;
      for (const cand of candidates) {
        if (metaMap.has(cand)) {
          tmdb = metaMap.get(cand);
          break;
        }
      }

      // Fuzzy lookup if exact key not found
      if (!tmdb) {
        for (const [k, v] of metaMap.entries()) {
          const kTitle = k.split(":")[0];
          if (
            kTitle === cleanLower ||
            (kTitle.length > 3 && cleanLower.includes(kTitle)) ||
            (cleanLower.length > 3 && kTitle.includes(cleanLower))
          ) {
            tmdb = v;
            break;
          }
        }
      }

      // If still missing or has no poster, fetch from TMDB live
      let posterUrl = tmdb?.poster_url || "";
      let backdropUrl = tmdb?.backdrop_url || null;
      let rating = tmdb?.rating || null;
      let overview = tmdb?.overview || null;
      let genres = tmdb?.genres || [];

      if (!posterUrl) {
        const primaryDb = dbs[0] || null;
        const mainCacheKey = `${cleanLower}:${year}:${isSeries ? 1 : 0}`;
        const liveTmdb = await fetchLiveTmdb(meta.cleanTitle || title, isSeries, primaryDb, mainCacheKey);
        if (liveTmdb) {
          if (liveTmdb.poster_url) posterUrl = liveTmdb.poster_url;
          if (liveTmdb.backdrop_url) backdropUrl = liveTmdb.backdrop_url;
          if (liveTmdb.rating) rating = liveTmdb.rating;
          if (liveTmdb.overview) overview = liveTmdb.overview;
          metaMap.set(mainCacheKey, liveTmdb);
        }
      }

      // Final fallback if TMDB has no poster
      if (!posterUrl) {
        posterUrl = `https://via.placeholder.com/500x750/0f172a/38bdf8?text=${encodeURIComponent(title)}`;
      }

      groups[baseSlug] = {
        title: groupKey,
        rawTitle: title,
        slug: baseSlug,
        isSeries: meta.isSeries,
        season: meta.season,
        year: meta.year,
        posterUrl,
        backdropUrl,
        rating,
        overview,
        genres,
        files: [],
        totalSize: 0,
        qualities: new Set(),
      };
    }

    const item = groups[baseSlug];
    const size = parseInt(doc.file_size || 0, 10);
    item.totalSize += size;
    if (meta.quality) item.qualities.add(meta.quality);

    item.files.push({
      _id: String(doc._id),
      file_unique_id: doc.file_unique_id || String(doc._id),
      file_name: fileName,
      file_size: size,
      size_str: formatSize(size),
      meta,
    });
  }

  const catalog = Object.values(groups).map((item) => ({
    ...item,
    fileCount: item.files.length,
    formattedSize: formatSize(item.totalSize),
    qualities: Array.from(item.qualities),
  }));

  catalogCache = {
    data: catalog,
    timestamp: now,
  };

  return catalog;
}

export async function getItemBySlug(slug) {
  const catalog = await getGroupedCatalog();
  return catalog.find((c) => c.slug === slug) || null;
}

export async function getFileDoc(fileUniqueId) {
  const dbs = await getAllDatabases();
  if (!dbs || dbs.length === 0) return null;

  const collections = ["telegram_files", "files", "temp_stream_files"];

  for (const db of dbs) {
    for (const col of collections) {
      try {
        const doc = await db.collection(col).findOne({ file_unique_id: fileUniqueId });
        if (doc) return doc;
      } catch (err) {}
    }
  }

  return null;
}
