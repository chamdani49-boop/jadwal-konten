import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/sources";
import { getCache, setCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HISTORY_TTL = 60 * 30; // 30 menit, cukup untuk grafik harian

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const quote = (searchParams.get("quote") ?? "IDR").toUpperCase();
  const days = Math.min(Math.max(Number(searchParams.get("days") ?? 30), 7), 365);

  const cacheKey = `history:${base}:${quote}:${days}`;
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json(
      { ...cached, cached: true },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${HISTORY_TTL}, stale-while-revalidate=300`,
        },
      }
    );
  }

  try {
    const data = await getHistory(base, quote, days);
    const payload = { base, quote, days, ...data };
    setCache(cacheKey, payload, HISTORY_TTL);
    return NextResponse.json(
      { ...payload, cached: false },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${HISTORY_TTL}, stale-while-revalidate=300`,
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
