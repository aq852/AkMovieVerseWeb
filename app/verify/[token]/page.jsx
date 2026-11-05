import { getAllDatabases } from "@/lib/mongodb";
import { ShieldCheck, Lock, ArrowRight, Bot } from "lucide-react";
import VerifyRedirectClient from "./VerifyRedirectClient";

export const revalidate = 0; // Dynamic token lookup

export default async function VerifyGatewayPage({ params }) {
  const token = params.token;
  const dbs = await getAllDatabases();
  let targetUrl = null;
  const botUsername = process.env.BOT_USERNAME || "TheFlixifyBot";

  if (dbs && token) {
    for (const db of dbs) {
      for (const col of ["verifications", "verify"]) {
        try {
          const doc = await db.collection(col).findOne({ token });
          if (doc && doc.short_link) {
            targetUrl = doc.short_link;
            break;
          }
        } catch (err) {}
      }
      if (targetUrl) break;
    }
  }

  // Fallback to bot start
  if (!targetUrl) {
    targetUrl = `https://t.me/${botUsername}?start=verify_${token}`;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center space-y-6 poster-glow">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Anti-Bot Verification</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Unlocking 24-Hour Access
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm">
            Hold on! We are preparing your secure link. You will be redirected in just a few seconds...
          </p>
        </div>

        {/* Client-side Animated Countdown & Auto Redirect */}
        <VerifyRedirectClient targetUrl={targetUrl} />

        <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500">
          Instant unlimited access to all movie & series files for 24 hours.
        </div>
      </div>
    </div>
  );
}
