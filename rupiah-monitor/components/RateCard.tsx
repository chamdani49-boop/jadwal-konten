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
    <div className="card p-5 sm:p-6 md:p-7 animate-fadeUp shadow-card">
      <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-ink-400 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
            Kurs Acuan
          </div>
          <div className="text-ink-100 text-sm sm:text-base font-semibold mt-0.5">
            1 {base} <span className="text-ink-400">→</span> {quote}
          </div>
        </div>
        <div
          className={`chip shrink-0 ${up ? "chip-live" : "chip-bad"}`}
          title="Perubahan vs penutupan kemarin"
        >
          {up ? "▲" : "▼"} {formatNumber(Math.abs(change), 2)}%
        </div>
      </div>

      <div className="num text-ink-100 leading-none mt-2 break-all text-[clamp(2rem,9vw,4rem)] sm:text-[clamp(2.25rem,6vw,4.25rem)]">
        {loading
          ? "—"
          : quote === "IDR"
          ? `Rp ${formatIDR(current ?? NaN)}`
          : formatNumber(current ?? NaN, 4)}
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-5 sm:mt-6">
        <Stat label="Tertinggi" labelLg="Tertinggi (sumber)" value={max} quote={quote} />
        <Stat label="Median" labelLg="Median agregat" value={current} quote={quote} highlight />
        <Stat label="Terendah" labelLg="Terendah (sumber)" value={min} quote={quote} />
      </div>
    </div>
  );
}

function Stat({
  label,
  labelLg,
  value,
  quote,
  highlight,
}: {
  label: string;
  labelLg: string;
  value?: number;
  quote: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-2.5 sm:px-3 py-2.5 sm:py-3 min-w-0 ${
        highlight
          ? "border-accent-gold/30 bg-accent-gold/5"
          : "border-line bg-bg-800/40"
      }`}
    >
      <div className="text-ink-400 text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.16em] uppercase truncate">
        <span className="sm:hidden">{label}</span>
        <span className="hidden sm:inline">{labelLg}</span>
      </div>
      <div
        className={`num mt-1 text-xs sm:text-sm md:text-base truncate ${
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
