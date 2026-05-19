"use client";

import { useEffect, useState } from "react";
import { formatIDR, formatNumber } from "@/lib/format";

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

  useEffect(() => {
    setAmount("100");
  }, [base, quote]);

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
    <div className="card p-5 md:p-6">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-ink-400 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
            Konverter
          </div>
          <div className="text-ink-100 text-sm sm:text-base font-semibold mt-0.5">
            Hitung cepat
          </div>
        </div>
        <button
          onClick={() =>
            setDirection((d) => (d === "forward" ? "reverse" : "forward"))
          }
          className="chip hover:text-ink-100 shrink-0"
        >
          ⇅ Balik arah
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-stretch sm:items-center">
        <div className="rounded-xl border border-line bg-bg-800/40 px-3 sm:px-4 py-2.5 sm:py-3 min-w-0">
          <div className="text-ink-400 text-[10px] tracking-[0.16em] uppercase">
            Dari
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="num bg-transparent outline-none text-ink-100 text-xl sm:text-2xl w-full min-w-0"
              placeholder="0"
            />
            <span className="text-ink-400 text-sm shrink-0">{fromCcy}</span>
          </div>
        </div>

        <div className="text-ink-400 text-center hidden sm:block">→</div>
        <div className="text-ink-400 text-center sm:hidden -my-0.5">↓</div>

        <div className="rounded-xl border border-accent-gold/25 bg-accent-gold/5 px-3 sm:px-4 py-2.5 sm:py-3 min-w-0">
          <div className="text-accent-gold text-[10px] tracking-[0.16em] uppercase">
            Hasil
          </div>
          <div className="num mt-1 text-xl sm:text-2xl text-ink-100 truncate">
            {Number.isFinite(result)
              ? toCcy === "IDR"
                ? `Rp ${formatIDR(result)}`
                : formatNumber(result)
              : "—"}
            <span className="text-ink-400 text-sm ml-2">{toCcy}</span>
          </div>
        </div>
      </div>

      {rate !== undefined && (
        <div className="text-ink-500 text-[11px] mt-3 num truncate">
          1 {base} = {quote === "IDR" ? `Rp ${formatIDR(rate)}` : formatNumber(rate)}{" "}
          {quote}
        </div>
      )}
    </div>
  );
}
