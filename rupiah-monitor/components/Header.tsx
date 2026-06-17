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
    <header className="flex items-center justify-between gap-3 py-5 sm:py-6">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/30 grid place-items-center shrink-0">
          <span className="num text-gold font-semibold text-[11px] leading-none">Rp</span>
        </div>
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-fg font-medium text-[15px] tracking-tight">
            Rupiah Monitor
          </span>
          <span className="hidden sm:inline text-fg-dim text-xs">/</span>
          <span className="hidden sm:inline text-fg-subtle text-xs">
            Realtime FX
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className={`chip ${live ? "chip-live" : "chip-warn"}`}>
          <span className={`dot ${live ? "animate-pulseDot" : ""}`} />
          {live ? "Live" : "Connecting"}
        </span>
        {typeof okCount === "number" && (
          <span className="chip hidden sm:inline-flex">
            {okCount}/{totalSources ?? 0} sources
          </span>
        )}
        {fetchedAt && (
          <span className="chip">
            <span className="text-fg-dim">Updated</span>
            <span className="num">{timeAgo(fetchedAt)}</span>
          </span>
        )}
      </div>
    </header>
  );
}
