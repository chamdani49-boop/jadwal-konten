"use client";

import { useEffect, useState } from "react";
import { formatIDR, formatNumber } from "@/lib/format";

const FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", SGD: "🇸🇬",
  MYR: "🇲🇾", CNY: "🇨🇳", AUD: "🇦🇺", IDR: "🇮🇩", KRW: "🇰🇷", THB: "🇹🇭",
};

export default function Converter({
  base,
  quote,
  rate,
}: {
  base: string;
  quote: string;
  rate?: number;
}) {
  const [amount, setAmount] = useState<string>("100");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");

  useEffect(() => setAmount("100"), [base, quote]);

  const num = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
  const result =
    rate === undefined
      ? NaN
      : direction === "forward"
      ? num * rate
      : num / rate;

  const fromCcy = direction === "forward" ? base : quote;
  const toCcy = direction === "forward" ? quote : base;

  return (
    <section>
      <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="eyebrow mb-1.5">Convert</div>
          <h2 className="text-fg text-lg sm:text-xl font-medium tracking-tight">
            Calculator
          </h2>
        </div>
        <span className="chip text-fg-dim hidden sm:inline-flex">Mid-market rate</span>
      </div>

      <div className="surface p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          {/* From */}
          <label className="block min-w-0">
            <div className="eyebrow mb-2">You send</div>
            <div className="flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg bg-bg-900 border border-line hover:border-line-strong focus-within:border-fg-subtle transition-colors">
              <span className="text-lg shrink-0">{FLAG[fromCcy] ?? "🏳️"}</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="num bg-transparent outline-none text-fg text-lg sm:text-xl w-full min-w-0 font-medium"
                placeholder="0"
                aria-label={`Amount in ${fromCcy}`}
              />
              <span className="text-fg-muted num text-sm font-medium shrink-0">
                {fromCcy}
              </span>
            </div>
          </label>

          {/* Swap button */}
          <button
            onClick={() =>
              setDirection((d) => (d === "forward" ? "reverse" : "forward"))
            }
            className="self-center justify-self-center sm:self-end sm:mb-1 w-9 h-9 rounded-full border border-line hover:border-fg-subtle bg-bg-900 grid place-items-center text-fg-muted hover:text-fg transition-colors group"
            aria-label="Swap currencies"
            title="Swap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:rotate-0 rotate-90 transition-transform group-hover:scale-110">
              <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
            </svg>
          </button>

          {/* To */}
          <label className="block min-w-0">
            <div className="eyebrow mb-2 text-gold">You get</div>
            <div className="flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg bg-gold/[0.04] border border-gold/20">
              <span className="text-lg shrink-0">{FLAG[toCcy] ?? "🏳️"}</span>
              <span className="num text-fg text-lg sm:text-xl w-full min-w-0 font-medium truncate">
                {Number.isFinite(result)
                  ? toCcy === "IDR"
                    ? formatIDR(result)
                    : formatNumber(result)
                  : "—"}
              </span>
              <span className="text-fg-muted num text-sm font-medium shrink-0">
                {toCcy}
              </span>
            </div>
          </label>
        </div>

        {rate !== undefined && (
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-fg-dim text-xs num">
              1 {base} ={" "}
              <span className="text-fg-muted">
                {quote === "IDR" ? formatIDR(rate) : formatNumber(rate)}
              </span>{" "}
              {quote}
            </span>
            <span className="text-fg-dim text-[11px]">
              No fees · No spread · Indicative
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
