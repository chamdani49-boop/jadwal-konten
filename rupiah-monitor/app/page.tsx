"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Header from "@/components/Header";
import RateCard from "@/components/RateCard";
import MultiPairs from "@/components/MultiPairs";
import RateChart from "@/components/RateChart";
import CryptoStrip from "@/components/CryptoStrip";
import SourcesGrid from "@/components/SourcesGrid";
import Converter from "@/components/Converter";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const RANGES = [
  { d: 7, label: "7H" },
  { d: 30, label: "30H" },
  { d: 90, label: "90H" },
  { d: 365, label: "1T" },
];

export default function Home() {
  const [base, setBase] = useState("USD");
  const [quote, setQuote] = useState("IDR");
  const [days, setDays] = useState(30);

  // Live aggregated rate (refresh every 30s)
  const { data: rate } = useSWR(
    `/api/rate?base=${base}&quote=${quote}`,
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: false }
  );

  // Multi-pair (USD vs all)
  const { data: multi } = useSWR(`/api/multi?base=${base}`, fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  // Historical chart
  const { data: history, isLoading: histLoading } = useSWR(
    `/api/history?base=${base}&quote=${quote}&days=${days}`,
    fetcher
  );

  // Crypto strip
  const { data: crypto } = useSWR("/api/crypto", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  // Local previous-day reference for change %
  const prev = useMemo(() => {
    const pts = history?.points ?? [];
    if (pts.length < 2) return undefined;
    return pts[pts.length - 2]?.rate;
  }, [history]);

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-8 md:py-12">
      <Header
        fetchedAt={rate?.fetchedAt}
        okCount={rate?.okCount}
        totalSources={rate?.sources?.length}
      />

      {/* Selector base */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-ink-400 text-[11px] tracking-[0.18em] uppercase mr-1">
          Base
        </span>
        {["USD", "EUR", "SGD", "JPY", "CNY", "MYR", "GBP"].map((b) => (
          <button
            key={b}
            onClick={() => setBase(b)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              base === b
                ? "border-accent-gold/40 bg-accent-gold/10 text-accent-gold"
                : "border-line bg-bg-800/40 text-ink-300 hover:border-line-strong"
            }`}
          >
            {b}
          </button>
        ))}
        <span className="mx-2 text-ink-500">/</span>
        <span className="text-ink-400 text-[11px] tracking-[0.18em] uppercase mr-1">
          Quote
        </span>
        {["IDR", "USD", "SGD", "MYR"].map((q) => (
          <button
            key={q}
            onClick={() => setQuote(q)}
            disabled={q === base}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              quote === q
                ? "border-accent-gold/40 bg-accent-gold/10 text-accent-gold"
                : "border-line bg-bg-800/40 text-ink-300 hover:border-line-strong disabled:opacity-30"
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {rate?.error ? (
        <div className="card border-accent-red/30 bg-accent-red/5 p-4 mb-6 text-accent-red text-sm">
          Gagal mengambil data: {rate.error}
        </div>
      ) : null}

      {/* Top: Rate + Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 md:gap-5 mb-5">
        <RateCard
          base={base}
          quote={quote}
          current={rate?.median}
          prev={prev}
          min={rate?.min}
          max={rate?.max}
          loading={!rate}
        />
        <Converter base={base} quote={quote} rate={rate?.median} />
      </div>

      {/* Chart with range tabs */}
      <div className="mb-5">
        <div className="flex justify-end mb-2 gap-1">
          {RANGES.map((r) => (
            <button
              key={r.d}
              onClick={() => setDays(r.d)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                days === r.d
                  ? "border-accent-gold/40 bg-accent-gold/10 text-accent-gold"
                  : "border-line bg-bg-800/40 text-ink-300 hover:border-line-strong"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <RateChart
          data={history?.points ?? []}
          base={base}
          quote={quote}
        />
      </div>

      {/* Multi pairs + Crypto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-5">
        <MultiPairs
          base={base}
          quotes={multi?.quotes ?? {}}
          active={quote}
          onPick={(q) => setQuote(q)}
        />
        <CryptoStrip items={crypto?.items ?? []} />
      </div>

      {/* Sources transparency */}
      <SourcesGrid
        items={rate?.sources ?? []}
        median={rate?.median}
        quote={quote}
      />

      <Footer />
    </div>
  );
}

function Footer() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toLocaleString("id-ID")), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <footer className="mt-10 pt-6 border-t border-line text-ink-500 text-xs flex flex-wrap items-center justify-between gap-2">
      <div>
        Data agregat dari beberapa public API gratis. Hanya untuk informasi —
        bukan saran investasi.
      </div>
      <div className="num">{now}</div>
    </footer>
  );
}
