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
  const okCount = items.filter((i) => i.ok).length;
  return (
    <section>
      <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="eyebrow mb-1.5">Source comparison</div>
          <h2 className="text-fg text-lg sm:text-xl font-medium tracking-tight">
            Multi-aggregator transparency
          </h2>
        </div>
        <span className="chip shrink-0">
          <span className="dot bg-up" />
          {okCount}/{items.length} live
        </span>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-fg-subtle text-[11px] uppercase tracking-[0.14em] border-b border-line">
              <th className="text-left font-medium py-2.5 pl-4 sm:pl-3 pr-3">Source</th>
              <th className="text-left font-medium py-2.5 px-3 hidden sm:table-cell">As of</th>
              <th className="text-right font-medium py-2.5 px-3">Rate</th>
              <th className="text-right font-medium py-2.5 pr-4 sm:pr-3 pl-3 w-24">vs. Median</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const ok = it.ok;
              const diff = ok && median ? ((it.rate - median) / median) * 100 : null;
              const diffSign = diff === null ? null : Math.abs(diff) < 0.005 ? "neutral" : diff > 0 ? "up" : "down";
              return (
                <tr
                  key={i}
                  className="border-b border-line/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pl-4 sm:pl-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          ok ? "bg-up" : "bg-down"
                        }`}
                      />
                      <span className="text-fg font-medium text-[13px] truncate">
                        {it.source}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <span className="text-fg-subtle text-xs num truncate block max-w-[200px]">
                      {ok ? it.asOf ?? "live" : (it as any).error}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="num text-fg text-[13px]">
                      {ok
                        ? quote === "IDR"
                          ? formatIDR(it.rate)
                          : formatNumber(it.rate)
                        : "—"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 sm:pr-3 pl-3 text-right">
                    {diff !== null ? (
                      <span
                        className={`num text-xs ${
                          diffSign === "up"
                            ? "text-up"
                            : diffSign === "down"
                            ? "text-down"
                            : "text-fg-dim"
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(3)}%
                      </span>
                    ) : (
                      <span className="text-fg-dim text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-fg-dim text-[11px]">
        Final value uses the <span className="text-gold">median</span> across all
        responding sources to neutralize outliers.
      </div>
    </section>
  );
}
