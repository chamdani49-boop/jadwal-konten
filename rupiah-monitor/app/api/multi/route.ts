import { NextRequest, NextResponse } from "next/server";
import { getMultiQuotes } from "@/lib/sources";
import { CACHE_TTL, getCache, setCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_QUOTES = ["IDR", "SGD", "MYR", "JPY", "EUR", "CNY", "AUD", "GBP", "KRW", "THB"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const quotesParam = searchParams.get("quotes");
  const quotes = quotesParam
    ? quotesParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
    : DEFAULT_QUOTES;

  const cacheKey = `multi:${base}:${quotes.join(",")}`;
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
    const data = await getMultiQuotes(base, quotes);
    setCache(cacheKey, data, CACHE_TTL);
    return NextResponse.json(
      { ...data, cached: false },
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
