import { getDb } from "./mongodb";
import { parseMediaMetadata, slugify, formatSize } from "./helpers";

let catalogCache = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export async function getGroupedCatalog() {
  const now = Date.now();
  if (catalogCache.data && now - catalogCache.timestamp < CACHE_TTL_MS) {
    return catalogCache.data;
  }

  const db = await getDb();
  if (!db) return [];

  let docs = [];
  try {
    docs = await db
      .collection("files")
      .find({})
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();
  } catch (err) {
    console.error("Error fetching files from MongoDB:", err);
    return [];
  }

  // Pre-fetch cached posters
  let posterMap = {};
  try {
    const posterDocs = await db.collection("posters").find({}).toArray();
    for (const p of posterDocs) {
      if (p.clean_title && p.poster_url) {
        posterMap[p.clean_title.toLowerCase().trim()] = p.poster_url;
      }
    }
  } catch (err) {
    // posters collection optional
  }

  const groups = {};

  for (const doc of docs) {
    const fileName = doc.file_name || "video.mp4";
    const meta = parseMediaMetadata(fileName);
    const title = meta.title || "Untitled";
    const groupKey = meta.isSeries && meta.season ? `${title} (Season ${meta.season})` : title;
    const baseSlug = slugify(groupKey);

    if (!groups[baseSlug]) {
      const posterKey = title.toLowerCase().trim();
      const posterUrl =
        posterMap[posterKey] ||
        `https://via.placeholder.com/500x750/1e293b/38bdf8?text=${encodeURIComponent(title)}`;

      groups[baseSlug] = {
        title: groupKey,
        rawTitle: title,
        slug: baseSlug,
        isSeries: meta.isSeries,
        season: meta.season,
        posterUrl,
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
  const db = await getDb();
  if (!db) return null;

  try {
    const doc = await db.collection("files").findOne({ file_unique_id: fileUniqueId });
    if (doc) return doc;
  } catch (err) {}

  // Fallback to secondary if configured
  try {
    const doc2 = await db.collection("files_secondary").findOne({ file_unique_id: fileUniqueId });
    if (doc2) return doc2;
  } catch (err) {}

  return null;
}
