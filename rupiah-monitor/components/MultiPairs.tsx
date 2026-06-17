"use client";

import { formatIDR, formatNumber } from "@/lib/format";

const FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", SGD: "🇸🇬",
  MYR: "🇲🇾", CNY: "🇨🇳", AUD: "🇦🇺", KRW: "🇰🇷", THB: "🇹🇭",
  HKD: "🇭🇰", CHF: "🇨🇭", IDR: "🇮🇩", SAR: "🇸🇦",
};

const NAMES: Record<string, string> = {
  USD: "US Dollar", EUR: "Euro", GBP: "British Pound", JPY: "Japanese Yen",
  SGD: "Singapore Dollar", MYR: "Malaysian Ringgit", CNY: "Chinese Yuan",
  AUD: "Australian Dollar", KRW: "Korean Won", THB: "Thai Baht",
  HKD: "Hong Kong Dollar", CHF: "Swiss Franc", IDR: "Indonesian Rupiah",
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
    <section>
      <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="eyebrow mb-1.5">Other currencies</div>
          <h2 className="text-fg text-lg sm:text-xl font-medium tracking-tight">
            1 {base} converts to
          </h2>
        </div>
        <span className="chip hidden sm:inline-flex text-fg-dim">Tap to focus</span>
      </div>

      {/* Horizontal scroll ticker on mobile, grid on desktop */}
      <div className="-mx-4 sm:mx-0 sm:hidden">
        <div className="no-scrollbar overflow-x-auto px-4">
          <div className="flex gap-2 min-w-max pb-1">
            {entries.map(([code, val]) => (
              <PairButton
                key={code}
                code={code}
                val={val}
                active={code === active}
                onPick={onPick}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {entries.map(([code, val]) => (
          <PairButton
            key={code}
            code={code}
            val={val}
            active={code === active}
            onPick={onPick}
          />
        ))}
      </div>
    </section>
  );
}

function PairButton({
  code,
  val,
  active,
  onPick,
}: {
  code: string;
  val: number;
  active: boolean;
  onPick: (q: string) => void;
}) {
  return (
    <button
      onClick={() => onPick(code)}
      className={`text-left rounded-lg border px-3 py-3 transition-colors min-w-[140px] ${
        active
          ? "border-gold/40 bg-gold/[0.04]"
          : "border-line bg-bg-900/50 hover:border-line-strong hover:bg-bg-850"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base shrink-0">{FLAGS[code] ?? "🏳️"}</span>
        <span
          className={`text-xs font-semibold ${
            active ? "text-gold" : "text-fg-muted"
          }`}
        >
          {code}
        </span>
        <span className="text-fg-dim text-[10px] truncate hidden sm:inline">
          {NAMES[code] ?? ""}
        </span>
      </div>
      <div className="num text-fg text-sm truncate">
        {code === "IDR" ? formatIDR(val) : formatNumber(val, 4)}
      </div>
    </button>
  );
}
