import Link from "next/link";
import { notFound } from "next/navigation";
import { getFileDoc, getGroupedCatalog } from "@/lib/data";
import { parseMediaMetadata, formatSize, getStreamUrl } from "@/lib/helpers";
import VideoPlayer from "@/components/VideoPlayer";
import CopyStreamButton from "@/components/CopyStreamButton";
import { ArrowLeft, Bot, Tv, Smartphone, Download, Film } from "lucide-react";

export const revalidate = 0; // Dynamic streaming watch page

export default async function WatchPage({ params }) {
  const fileId = params.fileId;
  const doc = await getFileDoc(fileId);

  if (!doc) {
    notFound();
  }

  const fileName = doc.file_name || "video.mp4";
  const fileSize = parseInt(doc.file_size || 0, 10);
  const sizeStr = formatSize(fileSize);
  const meta = parseMediaMetadata(fileName);

  const streamUrl = getStreamUrl(fileId, fileName);
  const botUsername = process.env.BOT_USERNAME || "TheFlixifyBot";

  // Intent links for Android & Desktop
  const cleanUrl = streamUrl.replace(/^https?:\/\//, "");
  const protocol = streamUrl.startsWith("https") ? "https" : "http";
  const safeTitle = encodeURIComponent(fileName);

  const vlcIntent = `intent://${cleanUrl}#Intent;action=android.intent.action.VIEW;scheme=${protocol};type=video/*;package=org.videolan.vlc;S.title=${safeTitle};end`;
  const mxIntent = `intent://${cleanUrl}#Intent;action=android.intent.action.VIEW;scheme=${protocol};type=video/*;package=com.mxtech.videoplayer.ad;S.title=${safeTitle};end`;
  const chooserIntent = `intent://${cleanUrl}#Intent;action=android.intent.action.VIEW;scheme=${protocol};type=video/*;S.title=${safeTitle};end`;
  const m3uUrl = `/api/playlist/${fileId}`;

  // Get related movies
  const catalog = await getGroupedCatalog();
  const related = catalog.slice(0, 6);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl w-full mx-auto min-w-0">
      {/* Back button */}
      <div>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
      </div>

      {/* Video Player */}
      <VideoPlayer streamUrl={streamUrl} title={fileName} />

      {/* Under Player Media Info */}
      <div className="glass-panel rounded-3xl p-4 sm:p-7 space-y-4 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs">
            📦 {sizeStr}
          </span>
          {meta.quality && (
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold text-xs">
              🎬 {meta.quality}
            </span>
          )}
          {meta.badges?.map((b) => (
            <span key={b} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs border border-white/5">
              {b}
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
            ⚡ Direct Stream
          </span>
        </div>

        <h1 className="text-base sm:text-2xl font-bold text-white break-all sm:break-words">
          {fileName.replace(/_/g, " ")}
        </h1>

        {/* External Player Buttons */}
        <div className="pt-2 border-t border-white/5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            🚀 Open In External Player (Fast Hardware Decoding)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
            <a
              href={vlcIntent}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all active:scale-95"
            >
              <span>🧡 VLC Player</span>
            </a>

            <a
              href={mxIntent}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>🍿 MX Player</span>
            </a>

            <a
              href={chooserIntent}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Any App</span>
            </a>

            <a
              href={m3uUrl}
              download
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-bold text-xs transition-all active:scale-95 border border-white/10"
              title="Download M3U Playlist file for PC / VLC / Smart TV"
            >
              <Tv className="w-3.5 h-3.5 text-purple-400" />
              <span>M3U Playlist</span>
            </a>

            <CopyStreamButton streamUrl={streamUrl} />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-2.5">
            <a
              href={`https://t.me/${botUsername}?start=file_${fileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 font-semibold text-xs transition-all active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>Download In Telegram Bot</span>
            </a>

            <a
              href={`${streamUrl}?download=1`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white font-semibold text-xs transition-all active:scale-95 border border-white/10"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Direct Browser Download</span>
            </a>
          </div>
        </div>
      </div>

      {/* Related Movies */}
      <div className="space-y-3 pt-3">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Film className="w-4 h-4 text-sky-400" />
          <span>More Movies & Series</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
          {related.map((rel) => (
            <Link
              key={rel.slug}
              href={`/post/${rel.slug}`}
              className="group block rounded-xl overflow-hidden glass-panel hover:border-sky-500/50 transition-all"
            >
              <div className="aspect-[2/3] overflow-hidden bg-slate-900">
                <img
                  src={rel.posterUrl}
                  alt={rel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2">
                <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-sky-400 transition-colors">
                  {rel.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
