export function formatSize(bytes) {
  if (!bytes || bytes <= 0) return "0 MB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i >= 3 ? 2 : 1)} ${units[i]}`;
}

export function slugify(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseMediaMetadata(filename = "") {
  if (!filename) {
    return {
      title: "Movie Video",
      quality: "HD",
      badges: [],
      isSeries: false,
      isCombined: false,
      cleanName: "Movie Video",
    };
  }

  const rawNoExt = filename.replace(/\.(mkv|mp4|avi|webm|flv|mov|zip|rar)$/i, "").trim();
  const norm = rawNoExt.replace(/[\._]/g, " ");

  // 1. Quality
  const qualMatch = norm.match(/\b(2160p|4k|1080p|720p|540p|480p|360p)\b/i);
  let quality = qualMatch ? qualMatch[1].toUpperCase() : null;
  if (quality === "2160P") quality = "4K";

  // 2. Codec
  const codecMatch = norm.match(/\b(HEVC|H\.?265|x265|H\.?264|x264|AV1|10bit)\b/i);
  const codec = codecMatch ? codecMatch[1].toUpperCase() : null;

  // 3. Source
  const srcMatch = norm.match(/\b(WEB-?DL|WEBRip|BluRay|BRRip|HDRip|HDTV|CAMRip|PreDVD)\b/i);
  const source = srcMatch ? srcMatch[1].toUpperCase() : null;

  // 4. Audio
  const isDual = /\b(Dual\s*Audio|Hindi\s*[\+\-]\s*English|Multi\s*Audio)\b/i.test(norm);
  const isHindi = /\b(Hindi)\b/i.test(norm);
  const isEnglish = /\b(English|Eng)\b/i.test(norm);

  // 5. Series & Episodes
  const epMatch = norm.match(/\bS(\d{1,2})\s*E(\d{1,3})\b/i);
  const seasonMatch = norm.match(/\bSeason\s*(\d{1,2})\b/i) || norm.match(/\bS(\d{1,2})\b/i);
  const isCombined = /\b(COMBiNED|Complete|Pack|Zip|Batch)\b/i.test(norm);

  let cleanTitle = norm
    .replace(/\b(2160p|4k|1080p|720p|540p|480p|360p)\b.*$/i, "")
    .replace(/\bS\d{1,2}.*$/i, "")
    .replace(/\b(WEB-?DL|WEBRip|BluRay|BRRip|HDRip|HDTV|CAMRip|PreDVD).*$/i, "")
    .replace(/\[.*?\]|\(.*?\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = rawNoExt;
  }

  const badges = [];
  if (quality) badges.push(quality);
  if (source) badges.push(source);
  if (codec) badges.push(codec);
  if (isDual) badges.push("Dual Audio");
  else if (isHindi) badges.push("Hindi");
  else if (isEnglish) badges.push("English");

  return {
    title: cleanTitle,
    quality: quality || "HD",
    codec,
    source,
    badges,
    isDual,
    isSeries: Boolean(seasonMatch || epMatch || isCombined),
    isCombined,
    season: seasonMatch ? parseInt(seasonMatch[1], 10) : null,
    episode: epMatch ? parseInt(epMatch[2], 10) : null,
    cleanName: cleanTitle,
  };
}

export function getStreamUrl(fileUniqueId, fileName = "") {
  const base = (process.env.STREAM_URL || process.env.NEXT_PUBLIC_STREAM_URL || "").replace(/\/+$/, "");
  const cleanName = (fileName || "video.mp4").replace(/[^\w\-_\. ]/g, "_").trim();
  return `${base}/stream/${fileUniqueId}/${encodeURIComponent(cleanName)}`;
}
