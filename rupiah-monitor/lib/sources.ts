// Multi-source aggregator untuk data kurs.
// Strategi anti-blokir & anti-limit:
//   1. Panggil banyak sumber paralel di server (bukan client browser user).
//   2. Sumber utama (fawazahmed) di-host di jsDelivr CDN -> efektif tanpa rate limit.
//   3. Kalau salah satu sumber gagal, sumber lain tetap jalan.
//   4. Hasil di-cache di server (default 30 detik) supaya hit ke origin tetap rendah.
//   5. Nilai final = MEDIAN dari semua sumber yang berhasil -> tahan outlier.

export type SourceQuote = {
  source: string;
  url: string;
  rate: number;        // 1 dari "from" = X "to"
  fetchedAt: string;   // ISO
  asOf?: string;       // tanggal data dari provider (kalau ada)
  ok: true;
};

export type SourceError = {
  source: string;
  url: string;
  error: string;
  ok: false;
};

export type SourceResult = SourceQuote | SourceError;

const ua = {
  "User-Agent":
    "Mozilla/5.0 (compatible; RupiahMonitor/1.0; +https://github.com/)",
  Accept: "application/json",
};

async function fetchJSON(url: string, timeoutMs = 6000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: ua,
      // Kita kelola cache sendiri di server -> matikan cache fetch.
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// =============== Definisi sumber ===============
// Setiap fungsi return SourceQuote (sukses) atau SourceError (gagal).
// `from` & `to` selalu uppercase 3-letter, mis "USD", "IDR".

type Fetcher = (from: string, to: string) => Promise<SourceResult>;

const fawazJsdelivr: Fetcher = async (from, to) => {
  const f = from.toLowerCase();
  const t = to.toLowerCase();
  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${f}.json`;
  try {
    const d = await fetchJSON(url);
    const rate = d?.[f]?.[t];
    if (typeof rate !== "number") throw new Error("rate missing");
    return {
      source: "fawazahmed (jsDelivr)",
      url,
      rate,
      fetchedAt: new Date().toISOString(),
      asOf: d?.date,
      ok: true,
    };
  } catch (e: any) {
    return { source: "fawazahmed (jsDelivr)", url, error: String(e?.message ?? e), ok: false };
  }
};

const fawazCloudflare: Fetcher = async (from, to) => {
  const f = from.toLowerCase();
  const t = to.toLowerCase();
  // Mirror Cloudflare Pages untuk ketahanan ekstra (kalau jsDelivr down).
  const url = `https://latest.currency-api.pages.dev/v1/currencies/${f}.json`;
  try {
    const d = await fetchJSON(url);
    const rate = d?.[f]?.[t];
    if (typeof rate !== "number") throw new Error("rate missing");
    return {
      source: "fawazahmed (Cloudflare)",
      url,
      rate,
      fetchedAt: new Date().toISOString(),
      asOf: d?.date,
      ok: true,
    };
  } catch (e: any) {
    return { source: "fawazahmed (Cloudflare)", url, error: String(e?.message ?? e), ok: false };
  }
};

const erApi: Fetcher = async (from, to) => {
  const url = `https://open.er-api.com/v6/latest/${from}`;
  try {
    const d = await fetchJSON(url);
    const rate = d?.rates?.[to];
    if (typeof rate !== "number") throw new Error("rate missing");
    return {
      source: "open.er-api.com",
      url,
      rate,
      fetchedAt: new Date().toISOString(),
      asOf: d?.time_last_update_utc,
      ok: true,
    };
  } catch (e: any) {
    return { source: "open.er-api.com", url, error: String(e?.message ?? e), ok: false };
  }
};

const exchangerateApiOpen: Fetcher = async (from, to) => {
  // Open access endpoint exchangerate-api.com
  const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
  try {
    const d = await fetchJSON(url);
    const rate = d?.rates?.[to];
    if (typeof rate !== "number") throw new Error("rate missing");
    return {
      source: "exchangerate-api.com",
      url,
      rate,
      fetchedAt: new Date().toISOString(),
      asOf: d?.date,
      ok: true,
    };
  } catch (e: any) {
    return { source: "exchangerate-api.com", url, error: String(e?.message ?? e), ok: false };
  }
};

const frankfurter: Fetcher = async (from, to) => {
  const url = `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`;
  try {
    const d = await fetchJSON(url);
    const rate = d?.rates?.[to];
    if (typeof rate !== "number") throw new Error("rate missing");
    return {
      source: "frankfurter.dev (ECB)",
      url,
      rate,
      fetchedAt: new Date().toISOString(),
      asOf: d?.date,
      ok: true,
    };
  } catch (e: any) {
    return { source: "frankfurter.dev (ECB)", url, error: String(e?.message ?? e), ok: false };
  }
};

const FETCHERS: Fetcher[] = [
  fawazJsdelivr,
  fawazCloudflare,
  erApi,
  exchangerateApiOpen,
  frankfurter,
];

// =============== Aggregator ===============

export type AggregatedQuote = {
  base: string;
  quote: string;
  median: number;
  mean: number;
  min: number;
  max: number;
  fetchedAt: string;
  sources: SourceResult[];
  okCount: number;
};

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  if (n === 0) return NaN;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

export async function getAggregatedRate(
  base: string,
  quote: string
): Promise<AggregatedQuote> {
  const results = await Promise.all(FETCHERS.map((f) => f(base, quote)));
  const okValues = results.filter((r): r is SourceQuote => r.ok).map((r) => r.rate);

  if (okValues.length === 0) {
    throw new Error(
      "Semua sumber gagal merespons. Coba lagi sebentar. Detail: " +
        results
          .filter((r) => !r.ok)
          .map((r) => `${r.source}=${(r as SourceError).error}`)
          .join(" | ")
    );
  }

  return {
    base,
    quote,
    median: median(okValues),
    mean: okValues.reduce((a, b) => a + b, 0) / okValues.length,
    min: Math.min(...okValues),
    max: Math.max(...okValues),
    fetchedAt: new Date().toISOString(),
    sources: results,
    okCount: okValues.length,
  };
}

// =============== Multi pair (1 base, banyak quote) ===============

export type MultiQuote = {
  base: string;
  quotes: Record<string, number>;
  fetchedAt: string;
  source: string;
};

export async function getMultiQuotes(
  base: string,
  quotes: string[]
): Promise<MultiQuote> {
  // Pakai sumber primer (fawazahmed jsDelivr) karena 1x request mengandung semua kurs.
  const f = base.toLowerCase();
  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${f}.json`;
  try {
    const d = await fetchJSON(url);
    const all = d?.[f] ?? {};
    const out: Record<string, number> = {};
    for (const q of quotes) {
      const v = all[q.toLowerCase()];
      if (typeof v === "number") out[q.toUpperCase()] = v;
    }
    return {
      base: base.toUpperCase(),
      quotes: out,
      fetchedAt: new Date().toISOString(),
      source: "fawazahmed (jsDelivr)",
    };
  } catch {
    // Fallback ke open.er-api.com
    const url2 = `https://open.er-api.com/v6/latest/${base}`;
    const d = await fetchJSON(url2);
    const out: Record<string, number> = {};
    for (const q of quotes) {
      const v = d?.rates?.[q.toUpperCase()];
      if (typeof v === "number") out[q.toUpperCase()] = v;
    }
    return {
      base: base.toUpperCase(),
      quotes: out,
      fetchedAt: new Date().toISOString(),
      source: "open.er-api.com",
    };
  }
}

// =============== Historical (untuk chart) ===============

export type HistoryPoint = { date: string; rate: number };

export async function getHistory(
  base: string,
  quote: string,
  days: number
): Promise<{ points: HistoryPoint[]; source: string }> {
  // frankfurter mendukung historical, tetapi data hari ini bisa belum terbit jika weekend.
  // Kita pakai endpoint /v1/{startDate}..{endDate}.
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url = `https://api.frankfurter.dev/v1/${fmt(start)}..${fmt(
    end
  )}?base=${base}&symbols=${quote}`;

  try {
    const d = await fetchJSON(url);
    const rates = d?.rates ?? {};
    const points: HistoryPoint[] = Object.keys(rates)
      .sort()
      .map((date) => ({ date, rate: Number(rates[date]?.[quote]) }))
      .filter((p) => Number.isFinite(p.rate));
    if (points.length === 0) throw new Error("empty history");
    return { points, source: "frankfurter.dev (ECB)" };
  } catch {
    // Fallback: bangun history dari fawazahmed per-tanggal (lebih banyak request).
    const points: HistoryPoint[] = [];
    const requests: Promise<void>[] = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(end.getDate() - i);
      const dateStr = fmt(d);
      const f = base.toLowerCase();
      const t = quote.toLowerCase();
      const u = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/${f}.json`;
      requests.push(
        fetchJSON(u)
          .then((res) => {
            const v = res?.[f]?.[t];
            if (typeof v === "number") points.push({ date: dateStr, rate: v });
          })
          .catch(() => undefined)
      );
    }
    await Promise.all(requests);
    points.sort((a, b) => (a.date < b.date ? -1 : 1));
    return { points, source: "fawazahmed (jsDelivr) historical" };
  }
}

// =============== Crypto (BTC/ETH ke IDR) ===============

export type CryptoQuote = {
  symbol: string;       // BTC, ETH, ...
  idr: number;
  usd: number;
  source: string;
  fetchedAt: string;
};

export async function getCryptoIDR(symbol: string): Promise<CryptoQuote> {
  const s = symbol.toLowerCase();
  // Fawazahmed mendukung kripto sebagai base juga.
  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${s}.json`;
  const d = await fetchJSON(url);
  const idr = d?.[s]?.idr;
  const usd = d?.[s]?.usd;
  if (typeof idr !== "number" || typeof usd !== "number")
    throw new Error("crypto rate missing");
  return {
    symbol: symbol.toUpperCase(),
    idr,
    usd,
    source: "fawazahmed (jsDelivr)",
    fetchedAt: new Date().toISOString(),
  };
}
