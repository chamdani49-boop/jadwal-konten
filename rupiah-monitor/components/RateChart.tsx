"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIDR } from "@/lib/format";

export default function RateChart({
  data,
  base,
  quote,
}: {
  data: { date: string; rate: number }[];
  base: string;
  quote: string;
}) {
  const stats = useMemo(() => {
    if (!data?.length) return { min: 0, max: 0, first: 0, last: 0 };
    const rates = data.map((d) => d.rate);
    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
      first: rates[0],
      last: rates[rates.length - 1],
    };
  }, [data]);

  const change = stats.first ? ((stats.last - stats.first) / stats.first) * 100 : 0;
  const up = change >= 0;

  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-ink-400 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
            Pergerakan Historis
          </div>
          <div className="text-ink-100 text-sm sm:text-base font-semibold mt-0.5">
            {base}/{quote} —{" "}
            <span className="text-ink-400">{data?.length ?? 0} hari</span>
          </div>
        </div>
        <div className={`chip shrink-0 ${up ? "chip-live" : "chip-bad"}`}>
          {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
        </div>
      </div>

      <div className="h-[200px] sm:h-[240px] md:h-[260px] -ml-2 -mr-2 sm:mr-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#F2A007" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#F2A007" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6E7B95", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
            />
            <YAxis
              tick={{ fill: "#6E7B95", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              width={56}
              tickFormatter={(v) =>
                quote === "IDR"
                  ? new Intl.NumberFormat("id-ID", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(v)
                  : v.toFixed(2)
              }
            />
            <Tooltip
              contentStyle={{
                background: "#11151F",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 10,
                fontSize: 12,
                color: "#D7DEEA",
              }}
              labelStyle={{ color: "#A3AFC5", marginBottom: 4 }}
              formatter={(v: number) => [
                quote === "IDR" ? `Rp ${formatIDR(v)}` : v.toFixed(4),
                `${base}/${quote}`,
              ]}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#F2A007"
              strokeWidth={2}
              fill="url(#g)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
