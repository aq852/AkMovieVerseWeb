import { getGroupedCatalog } from "@/lib/data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  if (!q || q.length < 2) {
    return Response.json({ results: [] });
  }

  const catalog = await getGroupedCatalog();
  const matched = catalog
    .filter((item) => item.title.toLowerCase().includes(q) || item.slug.includes(q))
    .slice(0, 10)
    .map((item) => ({
      title: item.title,
      slug: item.slug,
      posterUrl: item.posterUrl,
      isSeries: item.isSeries,
      fileCount: item.fileCount,
      size: item.formattedSize,
    }));

  return Response.json({ results: matched });
}
