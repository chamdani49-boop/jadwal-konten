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

const BASES = ["USD", "EUR", "SGD", "JPY", "CNY", "MYR", "GBP", "AUD"];
const QUOTES = ["IDR", "USD", "SGD", "MYR"];

export default function Home() {
  const [base, setBase] = useState("USD");
  const [quote, setQuote] = useState("IDR");
  const [days, setDays] = useState(30);

  const { data: rate } = useSWR(
    `/api/rate?base=${base}&quote=${quote}`,
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: false }
  );

  const { data: multi } = useSWR(`/api/multi?base=${base}`, fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  const { data: history } = useSWR(
    `/api/history?base=${base}&quote=${quote}&days=${days}`,
    fetcher
  );

  const { data: crypto } = useSWR("/api/crypto", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  const prev = useMemo(() => {
    const pts = history?.points ?? [];
    if (pts.length < 2) return undefined;
    return pts[pts.length - 2]?.rate;
  }, [history]);

  // Use the same history for the hero ghost sparkline (last 30 points max)
  const sparkData = useMemo(() => {
    const pts = history?.points ?? [];
    return pts.slice(-30);
  }, [history]);

  return (
    <div
      className="min-h-screen"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 border-b border-line bg-bg-950/85 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <Header
            fetchedAt={rate?.fetchedAt}
            okCount={rate?.okCount}
            totalSources={rate?.sources?.length}
          />
        </div>
      </div>

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16 sm:pb-24">
        {/* Currency selector — segmented + scrollable on mobile */}
        <div className="-mx-4 sm:mx-0 mb-2 sm:mb-4">
          <div className="no-scrollbar overflow-x-auto px-4 sm:px-0">
            <div className="flex items-center gap-2 min-w-max">
              <span className="eyebrow mr-1">Base</span>
              <div className="seg">
                {BASES.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBase(b)}
                    data-active={base === b}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <span className="text-fg-dim mx-1 select-none">→</span>
              <span className="eyebrow mr-1">Quote</span>
              <div className="seg">
                {QUOTES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuote(q)}
                    data-active={quote === q}
                    disabled={q === base}
                    className={q === base ? "opacity-30 cursor-not-allowed" : ""}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {rate?.error && (
          <div className="surface border-down/40 bg-down/5 p-4 my-4 text-down text-sm">
            Failed to fetch: {rate.error}
          </div>
        )}

        {/* HERO RATE */}
        <RateCard
          base={base}
          quote={quote}
          current={rate?.median}
          prev={prev}
          min={rate?.min}
          max={rate?.max}
          loading={!rate}
          spark={sparkData}
        />

        <Divider />

        {/* CHART */}
        <RateChart
          data={history?.points ?? []}
          base={base}
          quote={quote}
          days={days}
          onDaysChange={setDays}
        />

        <Divider />

        {/* CONVERTER */}
        <Converter base={base} quote={quote} rate={rate?.median} />

        <Divider />

        {/* MULTI PAIRS */}
        <MultiPairs
          base={base}
          quotes={multi?.quotes ?? {}}
          active={quote}
          onPick={(q) => setQuote(q)}
        />

        <Divider />

        {/* CRYPTO */}
        <CryptoStrip items={crypto?.items ?? []} />

        <Divider />

        {/* SOURCES */}
        <SourcesGrid
          items={rate?.sources ?? []}
          median={rate?.median}
          quote={quote}
        />

        <Footer />
      </main>
    </div>
  );
}

function Divider() {
  return <div className="section-rule my-10 sm:my-14" aria-hidden />;
}

function Footer() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleString("id-ID"));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <footer className="mt-16 sm:mt-20 pt-8 border-t border-line">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-md">
          <div className="text-fg text-sm font-medium mb-1">Rupiah Monitor</div>
          <div className="text-fg-dim text-xs leading-relaxed">
            Aggregated mid-market rates from multiple public sources.
            Indicative only — not investment or trading advice.
          </div>
        </div>
        <div className="text-right">
          <div className="eyebrow mb-1">Server time</div>
          <div className="num text-fg-muted text-xs">{now}</div>
        </div>
      </div>
    </footer>
  );
}
