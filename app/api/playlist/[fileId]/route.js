import { getFileDoc } from "@/lib/data";
import { getStreamUrl } from "@/lib/helpers";

export async function GET(request, { params }) {
  const fileId = params.fileId;
  const doc = await getFileDoc(fileId);

  if (!doc) {
    return new Response("File not found", { status: 404 });
  }

  const fileName = doc.file_name || "video.mp4";
  const streamUrl = getStreamUrl(fileId, fileName);

  const cleanTitle = fileName.replace(/[^\w\-_\. ]/g, "_").trim();
  const m3uContent = `#EXTM3U\n#EXTINF:-1,${fileName}\n${streamUrl}\n`;

  return new Response(m3uContent, {
    status: 200,
    headers: {
      "Content-Type": "audio/x-mpegurl",
      "Content-Disposition": `attachment; filename="${cleanTitle}.m3u"`,
      "Access-Control-Allow-Origin": "*",
    },
  });
}
