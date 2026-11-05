"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyStreamButton({ streamUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(streamUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = streamUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-bold text-xs transition-all active:scale-95 border border-white/10"
      title="Copy raw stream link (Desktop VLC: Ctrl+N -> Paste)"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">Link Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-sky-400" />
          <span>Copy Stream URL</span>
        </>
      )}
    </button>
  );
}
