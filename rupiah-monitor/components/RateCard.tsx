"use client";

import { formatIDR, formatNumber, pct } from "@/lib/format";

type Props = {
  base: string;
  quote: string;
  current?: number;
  prev?: number;
  min?: number;
  max?: number;
  loading?: boolean;
};

export default function RateCard({
  base,
  quote,
  current,
  prev,
  min,
  max,
  loading,
}: Props) {
  const change = current && prev ? pct(prev, current) : 0;
  const up = change >= 0;

  return (
    <div className="card p-6 md:p-7 animate-fadeUp shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-ink-400 text-[11px] tracking-[0.18em] uppercase">
            Kurs Acuan
          </div>
          <div className="text-ink-100 text-base font-semibold mt-0.5">
            1 {base} <span className="text-ink-400">→</span> {quote}
          </div>
        </div>
        <div
          className={`chip ${up ? "chip-live" : "chip-bad"}`}
          title="Perubahan vs penutupan kemarin"
        >
          {up ? "▲" : "▼"} {formatNumber(Math.abs(change), 2)}%
        </div>
      </div>

      <div className="num text-ink-100 text-5xl md:text-6xl leading-none mt-2">
        {loading
          ? "—"
          : quote === "IDR"
          ? `Rp ${formatIDR(current ?? NaN)}`
          : formatNumber(current ?? NaN, 4)}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        <Stat label="Tertinggi (sumber)" value={max} quote={quote} />
        <Stat label="Median agregat" value={current} quote={quote} highlight />
        <Stat label="Terendah (sumber)" value={min} quote={quote} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  quote,
  highlight,
}: {
  label: string;
  value?: number;
  quote: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 ${
        highlight
          ? "border-accent-gold/30 bg-accent-gold/5"
          : "border-line bg-bg-800/40"
      }`}
    >
      <div className="text-ink-400 text-[10px] tracking-[0.16em] uppercase">
        {label}
      </div>
      <div
        className={`num mt-1 text-base ${
          highlight ? "text-accent-gold" : "text-ink-200"
        }`}
      >
        {value === undefined
          ? "—"
          : quote === "IDR"
          ? `Rp ${formatIDR(value)}`
          : formatNumber(value)}
      </div>
    </div>
  );
}
