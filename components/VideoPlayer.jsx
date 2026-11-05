"use client";

import { useEffect, useRef } from "react";

export default function VideoPlayer({ streamUrl, title, posterUrl }) {
  const artRef = useRef(null);

  useEffect(() => {
    let art = null;

    const loadArtPlayer = async () => {
      // Load Artplayer script dynamically
      if (!window.Artplayer) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (artRef.current && window.Artplayer) {
        art = new window.Artplayer({
          container: artRef.current,
          url: streamUrl,
          title: title,
          poster: posterUrl || "",
          volume: 0.9,
          isLive: false,
          muted: false,
          autoplay: false,
          pip: true,
          autoSize: true,
          autoMini: true,
          screenshot: true,
          setting: true,
          loop: false,
          flip: true,
          playbackRate: true,
          aspectRatio: true,
          fullscreen: true,
          fullscreenWeb: true,
          subtitleOffset: true,
          miniProgressBar: true,
          mutex: true,
          backdrop: true,
          playsInline: true,
          autoPlayback: true,
          airplay: true,
          theme: "#0284c7",
          lang: "en",
          moreVideoAttr: {
            crossOrigin: "anonymous",
            playsInline: true,
          },
        });
      }
    };

    loadArtPlayer();

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [streamUrl, title, posterUrl]);

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
      <div ref={artRef} className="w-full h-full" />
    </div>
  );
}
