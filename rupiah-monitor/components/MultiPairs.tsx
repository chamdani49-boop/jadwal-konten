"use client";

import { formatIDR, formatNumber } from "@/lib/format";

const FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  SGD: "🇸🇬",
  MYR: "🇲🇾",
  CNY: "🇨🇳",
  AUD: "🇦🇺",
  KRW: "🇰🇷",
  THB: "🇹🇭",
  HKD: "🇭🇰",
  CHF: "🇨🇭",
  IDR: "🇮🇩",
  SAR: "🇸🇦",
};

export default function MultiPairs({
  base,
  quotes,
  active,
  onPick,
}: {
  base: string;
  quotes: Record<string, number>;
  active: string;
  onPick: (q: string) => void;
}) {
  const entries = Object.entries(quotes).filter(([k]) => k !== base);
  return (
    <div className="card p-4 sm:p-5 md:p-6">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-ink-400 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
            Mata Uang Lain
          </div>
          <div className="text-ink-100 text-sm sm:text-base font-semibold mt-0.5">
            1 {base} = …
          </div>
        </div>
        <span className="chip shrink-0">Klik untuk fokus</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2">
        {entries.map(([code, val]) => {
          const isActive = code === active;
          return (
            <button
              key={code}
              onClick={() => onPick(code)}
              className={`text-left rounded-xl border px-2.5 sm:px-3 py-2.5 sm:py-3 transition min-w-0 ${
                isActive
                  ? "border-accent-gold/40 bg-accent-gold/5"
                  : "border-line bg-bg-800/40 hover:border-line-strong"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base shrink-0">{FLAGS[code] ?? "🏳️"}</span>
                <span
                  className={`text-xs font-semibold truncate ${
                    isActive ? "text-accent-gold" : "text-ink-300"
                  }`}
                >
                  {code}
                </span>
              </div>
              <div className="num text-ink-100 text-xs sm:text-sm mt-1 sm:mt-1.5 truncate">
                {code === "IDR"
                  ? `Rp ${formatIDR(val)}`
                  : formatNumber(val, 4)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
