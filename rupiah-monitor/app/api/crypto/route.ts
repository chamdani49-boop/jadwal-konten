import { NextRequest, NextResponse } from "next/server";
import { getCryptoIDR } from "@/lib/sources";
import { CACHE_TTL, getCache, setCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SYMBOLS = ["BTC", "ETH", "BNB", "SOL", "USDT"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");
  const symbols = symbolsParam
    ? symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
    : DEFAULT_SYMBOLS;

  const cacheKey = `crypto:${symbols.join(",")}`;
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json(
      { ...cached, cached: true },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=60`,
        },
      }
    );
  }

  try {
    const results = await Promise.all(
      symbols.map((s) =>
        getCryptoIDR(s)
          .then((q) => ({ ok: true as const, ...q }))
          .catch((e) => ({ ok: false as const, symbol: s, error: String(e?.message ?? e) }))
      )
    );
    const payload = { items: results, fetchedAt: new Date().toISOString() };
    setCache(cacheKey, payload, CACHE_TTL);
    return NextResponse.json(
      { ...payload, cached: false },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=60`,
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 502 }
    );
  }
}
