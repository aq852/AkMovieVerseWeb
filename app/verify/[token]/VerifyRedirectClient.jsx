"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function VerifyRedirectClient({ targetUrl }) {
  const [countdown, setCountdown] = useState(3);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!targetUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setReady(true);
          window.location.href = targetUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetUrl]);

  return (
    <div className="space-y-4">
      {/* Animated Counter Circle */}
      <div className="w-20 h-20 rounded-full border-4 border-sky-500/20 border-t-sky-400 flex items-center justify-center mx-auto animate-spin">
        <span className="text-2xl font-black text-white not-italic" style={{ transform: "rotate(0deg)" }}>
          {countdown > 0 ? countdown : "✓"}
        </span>
      </div>

      <div className="text-xs text-slate-400">
        {countdown > 0
          ? `Redirecting in ${countdown} seconds...`
          : "Redirecting you now..."}
      </div>

      {/* Manual Button */}
      <a
        href={targetUrl}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all hover:scale-105 active:scale-95"
      >
        <span>Click Here If Not Redirected</span>
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
