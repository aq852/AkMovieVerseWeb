import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { Play, Download, ArrowLeft, Film, Layers, Bot, Radio } from "lucide-react";

export const revalidate = 60;

export default async function PostDetailPage({ params }) {
  const item = await getItemBySlug(params.slug);
  if (!item) {
    notFound();
  }

  const botUsername = process.env.BOT_USERNAME || "TheFlixifyBot";
  const firstFile = item.files[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
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

      {/* Hero Media Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
        {/* Poster */}
        <div className="w-48 sm:w-60 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden poster-glow border border-white/10 bg-slate-900">
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs">
              {item.isSeries ? "📺 TV Series" : "🎬 Movie"}
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
              ⚡ {item.formattedSize}
            </span>
            <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold text-xs">
              📦 {item.fileCount} {item.fileCount > 1 ? "Files" : "File"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {item.title}
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Stream online directly in high-definition or open in external video players (VLC / MX Player) with multi-audio support and fast seeking.
          </p>

          {/* Quick Play Primary */}
          {firstFile && (
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                href={`/watch/${firstFile.file_unique_id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Now ({firstFile.meta?.quality || "HD"})</span>
              </Link>

              <a
                href={`https://t.me/${botUsername}?start=file_${firstFile.file_unique_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl glass-panel text-slate-200 hover:text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              >
                <Bot className="w-4 h-4 text-sky-400" />
                <span>Get in Telegram Bot</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Files / Quality / Episodes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Available Files & Qualities ({item.fileCount})</span>
          </h2>
        </div>

        <div className="grid gap-3">
          {item.files.map((file, idx) => {
            const meta = file.meta || {};
            const watchUrl = `/watch/${file.file_unique_id}`;

            return (
              <div
                key={file.file_unique_id}
                className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-sky-500/40 transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white break-words line-clamp-2">
                    {file.file_name}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                      📦 {file.size_str}
                    </span>
                    {meta.quality && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                        🎬 {meta.quality}
                      </span>
                    )}
                    {meta.badges?.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <Link
                    href={watchUrl}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Online</span>
                  </Link>

                  <a
                    href={`https://t.me/${botUsername}?start=file_${file.file_unique_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white transition-all active:scale-95"
                    title="Download in Telegram"
                  >
                    <Bot className="w-4 h-4 text-sky-400" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
