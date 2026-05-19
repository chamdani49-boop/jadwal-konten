import { NextRequest, NextResponse } from "next/server";
import { getAggregatedRate } from "@/lib/sources";
import { CACHE_TTL, getCache, setCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const quote = (searchParams.get("quote") ?? "IDR").toUpperCase();
  const cacheKey = `rate:${base}:${quote}`;

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
    const data = await getAggregatedRate(base, quote);
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
