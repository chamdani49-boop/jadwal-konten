"use client";

import { formatIDR, formatNumber } from "@/lib/format";

type Item =
  | { ok: true; symbol: string; idr: number; usd: number; source: string; fetchedAt: string }
  | { ok: false; symbol: string; error: string };

const COIN: Record<string, { color: string; name: string }> = {
  BTC: { color: "#F7931A", name: "Bitcoin" },
  ETH: { color: "#627EEA", name: "Ethereum" },
  BNB: { color: "#F3BA2F", name: "BNB" },
  SOL: { color: "#9945FF", name: "Solana" },
  USDT: { color: "#26A17B", name: "Tether" },
  XRP: { color: "#0084D1", name: "XRP" },
  ADA: { color: "#0033AD", name: "Cardano" },
};

export default function CryptoStrip({ items }: { items: Item[] }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="eyebrow mb-1.5">Crypto · IDR</div>
          <h2 className="text-fg text-lg sm:text-xl font-medium tracking-tight">
            Live spot prices
          </h2>
        </div>
        <span className="chip text-fg-dim hidden sm:inline-flex">jsDelivr · no-key</span>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="-mx-4 sm:mx-0 sm:hidden">
        <div className="no-scrollbar overflow-x-auto px-4">
          <div className="flex gap-2 min-w-max pb-1">
            {items.map((it, i) => <CoinCard key={i} it={it} />)}
          </div>
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-5 gap-2">
        {items.map((it, i) => <CoinCard key={i} it={it} />)}
      </div>
    </section>
  );
}

function CoinCard({ it }: { it: Item }) {
  const meta = COIN[it.symbol] ?? { color: "#9BA1AC", name: it.symbol };
  return (
    <div className="rounded-lg border border-line bg-bg-900/50 hover:border-line-strong hover:bg-bg-850 transition-colors px-3 py-3 min-w-[150px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="w-5 h-5 rounded-full grid place-items-center text-[9px] font-bold text-white shrink-0"
          style={{ background: meta.color }}
        >
          {it.symbol[0]}
        </span>
        <div className="min-w-0">
          <div className="text-fg text-xs font-semibold leading-tight">
            {it.symbol}
          </div>
          <div className="text-fg-dim text-[10px] truncate leading-tight">
            {meta.name}
          </div>
        </div>
      </div>
      {it.ok ? (
        <>
          <div className="num text-fg text-sm truncate">
            Rp {formatIDR(it.idr)}
          </div>
          <div className="num text-fg-dim text-[11px] truncate">
            ${formatNumber(it.usd, 2)}
          </div>
        </>
      ) : (
        <div className="text-down text-xs num">— ERR</div>
      )}
    </div>
  );
}
