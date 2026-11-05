import { getAllDatabases } from "./mongodb";
import { parseMediaMetadata, slugify, formatSize } from "./helpers";

let catalogCache = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

async function fetchFilesFromDb(db) {
  const collectionNames = ["telegram_files", "files"];
  for (const name of collectionNames) {
    try {
      const docs = await db
        .collection(name)
        .find({})
        .sort({ _id: -1 })
        .limit(1000)
        .toArray();
      if (docs && docs.length > 0) {
        return docs;
      }
    } catch (e) {}
  }
  return [];
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
  const metaMap = {};
  for (const db of dbs) {
    try {
      const cacheDocs = await db.collection("tmdb_post_cache").find({}).toArray();
      for (const cd of cacheDocs) {
        if (cd.key && cd.data) {
          const keyNorm = cd.key.toLowerCase().trim();
          metaMap[keyNorm] = cd.data;
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
      // Find matching TMDB cached poster/backdrop
      const titleKey = title.toLowerCase().trim();
      const seasonKey = meta.isSeries && meta.season ? `${titleKey}::${meta.season}` : titleKey;
      const tmdb = metaMap[seasonKey] || metaMap[titleKey] || {};

      const posterUrl =
        tmdb.poster_url ||
        `https://via.placeholder.com/500x750/1e293b/38bdf8?text=${encodeURIComponent(title)}`;

      groups[baseSlug] = {
        title: groupKey,
        rawTitle: title,
        slug: baseSlug,
        isSeries: meta.isSeries,
        season: meta.season,
        posterUrl,
        backdropUrl: tmdb.backdrop_url || null,
        rating: tmdb.rating || null,
        overview: tmdb.overview || null,
        genres: tmdb.genres || [],
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
