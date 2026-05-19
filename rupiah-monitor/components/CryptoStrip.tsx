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
    <div className="card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-ink-400 text-[11px] tracking-[0.18em] uppercase">
            Kripto → IDR
          </div>
          <div className="text-ink-100 font-semibold mt-0.5">Harga live</div>
        </div>
        <span className="chip">Sumber: jsDelivr (no-key)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-xl border border-line bg-bg-800/40 px-3 py-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: COIN_COLOR[it.symbol] ?? "#A3AFC5" }}
              />
              <span className="text-ink-300 text-xs font-semibold">
                {it.symbol}
              </span>
            </div>
            {it.ok ? (
              <>
                <div className="num text-ink-100 text-sm mt-1.5">
                  Rp {formatIDR(it.idr)}
                </div>
                <div className="num text-ink-500 text-[11px] mt-0.5">
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
