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
  spark?: { date: string; rate: number }[];
};

const FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", SGD: "🇸🇬",
  MYR: "🇲🇾", CNY: "🇨🇳", AUD: "🇦🇺", IDR: "🇮🇩", KRW: "🇰🇷", THB: "🇹🇭",
};

export default function RateCard({
  base, quote, current, prev, min, max, loading, spark,
}: Props) {
  const change = current && prev ? pct(prev, current) : 0;
  const up = change >= 0;
  const diff = current && prev ? current - prev : 0;

  // ghost sparkline
  const sparkPath = (() => {
    if (!spark || spark.length < 2) return "";
    const w = 600, h = 100, pad = 4;
    const xs = spark.map((_, i) => (i / (spark.length - 1)) * (w - pad * 2) + pad);
    const ys = spark.map((p) => p.rate);
    const lo = Math.min(...ys), hi = Math.max(...ys);
    const range = hi - lo || 1;
    const yScale = (v: number) => h - pad - ((v - lo) / range) * (h - pad * 2);
    return spark
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xs[i].toFixed(2)} ${yScale(p.rate).toFixed(2)}`)
      .join(" ");
  })();

  return (
    <section className="relative overflow-hidden">
      {/* Ghost sparkline backdrop */}
      {sparkPath && (
        <svg
          viewBox="0 0 600 100"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 w-full h-32 sm:h-40 pointer-events-none opacity-[0.18]"
          aria-hidden
        >
          <defs>
            <linearGradient id="ghostFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={up ? "#3FCF8E" : "#FF5C5C"} stopOpacity="0.55" />
              <stop offset="100%" stopColor={up ? "#3FCF8E" : "#FF5C5C"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${sparkPath} L 600 100 L 0 100 Z`} fill="url(#ghostFill)" />
          <path d={sparkPath} fill="none" stroke={up ? "#3FCF8E" : "#FF5C5C"} strokeWidth="1.5" />
        </svg>
      )}

      <div className="relative pt-4 sm:pt-8 pb-8 sm:pb-12 animate-fadeUp">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="text-base sm:text-lg leading-none">{FLAG[base] ?? "🏳️"}</span>
          <span className="eyebrow">{base}/{quote} · Spot Rate</span>
        </div>

        <div className="flex items-baseline flex-wrap gap-x-3 sm:gap-x-5 gap-y-2">
          <span className="text-fg-subtle num text-base sm:text-xl">
            1 {base} =
          </span>
          <h1 className="hero-number text-fg text-[clamp(3rem,12vw,8rem)] break-all">
            {loading
              ? "—"
              : quote === "IDR"
              ? formatIDR(current ?? NaN)
              : formatNumber(current ?? NaN, 4)}
          </h1>
          <span className="text-fg-muted num text-base sm:text-2xl">{quote}</span>
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 sm:mt-5">
          <span
            className={`inline-flex items-center gap-1.5 num text-sm sm:text-base font-medium ${
              up ? "text-up" : "text-down"
            }`}
          >
            <span className="text-base">{up ? "↑" : "↓"}</span>
            {quote === "IDR" ? formatIDR(Math.abs(diff)) : formatNumber(Math.abs(diff), 4)}
            <span className="text-fg-subtle font-normal text-xs sm:text-sm">
              ({up ? "+" : "−"}{Math.abs(change).toFixed(2)}%)
            </span>
          </span>
          <span className="text-fg-dim text-xs">vs. previous close</span>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-3 max-w-md gap-x-6 sm:gap-x-8">
          <Stat label="High" value={max} quote={quote} />
          <Stat label="Median" value={current} quote={quote} accent />
          <Stat label="Low" value={min} quote={quote} />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label, value, quote, accent,
}: {
  label: string;
  value?: number;
  quote: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="eyebrow mb-1">{label}</div>
      <div className={`num text-sm sm:text-base truncate ${accent ? "text-gold" : "text-fg-muted"}`}>
        {value === undefined
          ? "—"
          : quote === "IDR"
          ? formatIDR(value)
          : formatNumber(value)}
      </div>
    </div>
  );
}
