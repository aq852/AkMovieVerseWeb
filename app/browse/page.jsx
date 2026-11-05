import Link from "next/link";
import { getGroupedCatalog } from "@/lib/data";
import { Search, Flame, Tv, Film, Sparkles, Layers, ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 60; // Cache on edge for 60 seconds

const ITEMS_PER_PAGE = 12;

function getPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default async function BrowsePage({ searchParams }) {
  const query = (searchParams?.q || "").toLowerCase().trim();
  const filter = (searchParams?.filter || "all").toLowerCase().trim();
  const qualityFilter = (searchParams?.quality || "").toLowerCase().trim();
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));

  const allItems = await getGroupedCatalog();

  // Filter items
  const filtered = allItems.filter((item) => {
    // Search match
    if (query && !item.title.toLowerCase().includes(query) && !item.slug.includes(query)) {
      return false;
    }

    // Category filter
    if (filter === "series" && !item.isSeries) return false;
    if (filter === "movies" && item.isSeries) return false;

    // Quality filter
    if (qualityFilter) {
      const hasQ = item.qualities.some((q) => q.toLowerCase() === qualityFilter);
      if (!hasQ) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  function buildPageUrl(pageNum) {
    const params = new URLSearchParams();
    if (searchParams?.q) params.set("q", searchParams.q);
    if (filter && filter !== "all") params.set("filter", filter);
    if (qualityFilter) params.set("quality", qualityFilter);
    if (pageNum > 1) params.set("page", String(pageNum));
    const qs = params.toString();
    return `/browse${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <form action="/browse" method="GET" className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q || ""}
              placeholder="Search movies, web series, anime..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-panel text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/25 transition-all hover:scale-105 active:scale-95"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm">
        <Link
          href="/browse"
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium shrink-0 transition-all ${
            filter === "all" && !qualityFilter
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
              : "glass-panel text-slate-300 hover:text-white"
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>All Titles</span>
        </Link>

        <Link
          href="/browse?filter=series"
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium shrink-0 transition-all ${
            filter === "series"
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
              : "glass-panel text-slate-300 hover:text-white"
          }`}
        >
          <Tv className="w-4 h-4 text-sky-400" />
          <span>Web Series</span>
        </Link>

        <Link
          href="/browse?filter=movies"
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium shrink-0 transition-all ${
            filter === "movies"
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
              : "glass-panel text-slate-300 hover:text-white"
          }`}
        >
          <Film className="w-4 h-4 text-indigo-400" />
          <span>Movies</span>
        </Link>

        <Link
          href="/browse?quality=1080p"
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium shrink-0 transition-all ${
            qualityFilter === "1080p"
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
              : "glass-panel text-slate-300 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>1080p FHD</span>
        </Link>

        <Link
          href="/browse?quality=4k"
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium shrink-0 transition-all ${
            qualityFilter === "4k"
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
              : "glass-panel text-slate-300 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>4K UHD</span>
        </Link>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>
          Showing <b className="text-white">{filtered.length > 0 ? startIndex + 1 : 0}</b> -{" "}
          <b className="text-white">{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}</b> of{" "}
          <b className="text-white">{filtered.length}</b> titles
          {query ? ` for "${query}"` : ""}
        </span>
        {totalPages > 1 && (
          <span className="font-semibold text-slate-400">
            Page <b className="text-white">{currentPage}</b> of {totalPages}
          </span>
        )}
      </div>

      {/* Movie Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl p-8">
          <Film className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No movies or series found</h3>
          <p className="text-slate-400 text-sm mb-4">Try searching with a different title or keyword.</p>
          <Link
            href="/browse"
            className="inline-block px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
          >
            View All Titles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {paginated.map((item) => {
            const detailUrl = `/post/${item.slug}`;

            return (
              <div
                key={item.slug}
                className="group flex flex-col justify-between rounded-2xl overflow-hidden glass-panel hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-500/10 min-w-0"
              >
                <div>
                  {/* Poster Thumbnail */}
                  <Link href={detailUrl} className="block relative aspect-[2/3] overflow-hidden bg-slate-900">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      {item.isSeries ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow">
                          🔥 SERIES
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/90 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow">
                          🎬 MOVIE
                        </span>
                      )}
                    </div>

                    {/* Bottom Info Pill */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-semibold text-white/90 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-sky-400" />
                        {item.fileCount} {item.fileCount > 1 ? "Files" : "File"}
                      </span>
                      <span>{item.formattedSize}</span>
                    </div>
                  </Link>

                  {/* Title */}
                  <div className="p-2.5 sm:p-3">
                    <Link
                      href={detailUrl}
                      className="block text-xs sm:text-sm font-bold text-white hover:text-sky-400 line-clamp-2 transition-colors break-words"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-2.5 sm:p-3 pt-0">
                  <Link
                    href={detailUrl}
                    className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-red-600/20 transition-all active:scale-95"
                  >
                    {item.isSeries ? "📦 View Series" : "▶ Watch & Download"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
          <div className="text-xs text-slate-400">
            Page <b className="text-white">{currentPage}</b> of <b className="text-white">{totalPages}</b>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* Previous Page */}
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-sky-500/40 text-xs font-semibold transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl glass-panel text-slate-600 text-xs font-semibold cursor-not-allowed opacity-50">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </span>
            )}

            {/* Page Numbers */}
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-500 text-xs">
                    ...
                  </span>
                );
              }
              const isCurrent = p === currentPage;
              return (
                <Link
                  key={p}
                  href={buildPageUrl(p)}
                  className={`min-w-[36px] h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isCurrent
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                      : "glass-panel text-slate-300 hover:text-white hover:border-sky-500/40"
                  }`}
                >
                  {p}
                </Link>
              );
            })}

            {/* Next Page */}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-sky-500/40 text-xs font-semibold transition-all active:scale-95"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl glass-panel text-slate-600 text-xs font-semibold cursor-not-allowed opacity-50">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
