"use client";

import { timeAgo } from "@/lib/format";
import { useEffect, useState } from "react";

export default function Header({
  fetchedAt,
  okCount,
  totalSources,
}: {
  fetchedAt?: string;
  okCount?: number;
  totalSources?: number;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const live = (okCount ?? 0) > 0;

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-bg-800 border border-line grid place-items-center">
          <span className="num text-accent-gold font-bold text-lg">Rp</span>
        </div>
        <div>
          <div className="text-ink-100 font-bold text-lg leading-tight">
            Rupiah <span className="text-accent-gold">Monitor</span>
          </div>
          <div className="text-ink-400 text-[11px] tracking-[0.18em] uppercase mt-0.5">
            Realtime Market Dashboard
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`chip ${live ? "chip-live" : "chip-warn"}`}>
          <span className={`dot ${live ? "animate-pulseDot" : ""}`} />
          {live ? "LIVE" : "MENGHUBUNGKAN"}
        </span>
        {typeof okCount === "number" && (
          <span className="chip">
            {okCount}/{totalSources ?? 0} sumber
          </span>
        )}
        {fetchedAt && (
          <span className="chip text-ink-400">{timeAgo(fetchedAt)}</span>
        )}
      </div>
    </header>
  );
}
