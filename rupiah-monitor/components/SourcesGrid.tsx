"use client";

import { formatIDR, formatNumber } from "@/lib/format";

type Item =
  | { ok: true; source: string; url: string; rate: number; asOf?: string }
  | { ok: false; source: string; url: string; error: string };

export default function SourcesGrid({
  items,
  median,
  quote,
}: {
  items: Item[];
  median?: number;
  quote: string;
}) {
  return (
    <div className="card p-4 sm:p-5 md:p-6">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-ink-400 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
            Sumber Data (Multi-Aggregator)
          </div>
          <div className="text-ink-100 text-sm sm:text-base font-semibold mt-0.5">
            {items.filter((i) => i.ok).length}/{items.length} sumber merespons
          </div>
        </div>
        <span className="chip shrink-0 hidden sm:inline-flex">Median dipakai sebagai nilai akhir</span>
        <span className="chip shrink-0 sm:hidden">Median = nilai akhir</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
        {items.map((it, i) => {
          const ok = it.ok;
          const diff =
            ok && median ? ((it.rate - median) / median) * 100 : null;
          return (
            <div
              key={i}
              className={`flex items-center justify-between rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 gap-2 ${
                ok
                  ? "border-line bg-bg-800/40"
                  : "border-accent-red/20 bg-accent-red/5"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-ink-200 text-xs sm:text-sm font-medium truncate">
                  {it.source}
                </div>
                <div className="text-ink-500 text-[10px] sm:text-[11px] truncate">
                  {ok ? it.asOf ?? "live" : (it as any).error}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="num text-ink-100 text-xs sm:text-sm">
                  {ok
                    ? quote === "IDR"
                      ? `Rp ${formatIDR(it.rate)}`
                      : formatNumber(it.rate)
                    : "ERR"}
                </div>
                {diff !== null && (
                  <div
                    className={`text-[10px] ${
                      Math.abs(diff) < 0.05
                        ? "text-ink-400"
                        : diff > 0
                        ? "text-accent-green"
                        : "text-accent-red"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff.toFixed(3)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
