"use client";

import { formatIDR, formatNumber } from "@/lib/format";

type Item =
  | { ok: true; symbol: string; idr: number; usd: number; source: string; fetchedAt: string }
  | { ok: false; symbol: string; error: string };

const COIN_COLOR: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  BNB: "#F3BA2F",
  SOL: "#9945FF",
  USDT: "#22C55E",
  XRP: "#0084D1",
  ADA: "#0033AD",
};

export default function CryptoStrip({ items }: { items: Item[] }) {
  return (
    <div className="card p-4 sm:p-5 md:p-6">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-ink-400 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
            Kripto → IDR
          </div>
          <div className="text-ink-100 text-sm sm:text-base font-semibold mt-0.5">Harga live</div>
        </div>
        <span className="chip shrink-0">jsDelivr (no-key)</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-xl border border-line bg-bg-800/40 px-2.5 sm:px-3 py-2.5 sm:py-3 min-w-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COIN_COLOR[it.symbol] ?? "#A3AFC5" }}
              />
              <span className="text-ink-300 text-xs font-semibold truncate">
                {it.symbol}
              </span>
            </div>
            {it.ok ? (
              <>
                <div className="num text-ink-100 text-xs sm:text-sm mt-1 sm:mt-1.5 truncate">
                  Rp {formatIDR(it.idr)}
                </div>
                <div className="num text-ink-500 text-[10px] sm:text-[11px] mt-0.5 truncate">
                  ${formatNumber(it.usd, 2)}
                </div>
              </>
            ) : (
              <div className="text-accent-red text-xs mt-1.5">ERR</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
