import "./globals.css";
import Link from "next/link";
import { Film, Send, Bot } from "lucide-react";

export const metadata = {
  title: "AkMovieVerse — Fast Online Cinema & Streaming",
  description: "Browse, watch, and download high-quality movies and web series with instant fast streaming.",
};

export default function RootLayout({ children }) {
  const channelUrl = process.env.CHANNEL_URL || "https://t.me/Akmovieverse";
  const botUsername = process.env.BOT_USERNAME || "TheFlixifyBot";

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between">
        {/* Navbar */}
        <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 py-3 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <Link href="/browse" className="flex items-center gap-2.5 group">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5" />
              </span>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-white to-sky-200 bg-clip-text text-transparent">
                AkMovieVerse
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Channel</span>
              </a>

              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Bot</span>
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AkMovieVerse Cinema. Powered by high-speed Edge CDN.</p>
        </footer>
      </body>
    </html>
  );
}
