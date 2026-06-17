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

const RANGES = [
  { d: 7, label: "7D" },
  { d: 30, label: "30D" },
  { d: 90, label: "3M" },
  { d: 365, label: "1Y" },
];

export default function RateChart({
  data,
  base,
  quote,
  days,
  onDaysChange,
}: {
  data: { date: string; rate: number }[];
  base: string;
  quote: string;
  days: number;
  onDaysChange: (d: number) => void;
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
  const stroke = up ? "#3FCF8E" : "#FF5C5C";

  return (
    <section>
      <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
        <div className="min-w-0">
          <div className="eyebrow mb-1.5">Historical</div>
          <h2 className="text-fg text-lg sm:text-xl font-medium tracking-tight">
            {base}/{quote} performance
          </h2>
        </div>
        <div className="seg shrink-0">
          {RANGES.map((r) => (
            <button
              key={r.d}
              onClick={() => onDaysChange(r.d)}
              data-active={days === r.d}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="surface px-1 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3">
        <div className="flex items-baseline gap-3 px-3 sm:px-2 mb-2">
          <span
            className={`num text-sm font-medium ${
              up ? "text-up" : "text-down"
            }`}
          >
            {up ? "↑" : "↓"} {Math.abs(change).toFixed(2)}%
          </span>
          <span className="text-fg-dim text-xs">over {data?.length ?? 0} days</span>
        </div>
        <div className="h-[220px] sm:h-[300px] md:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.30} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6E7480", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={32}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis
                tick={{ fill: "#6E7480", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                width={56}
                tickFormatter={(v) =>
                  quote === "IDR"
                    ? new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(v)
                    : v.toFixed(2)
                }
                orientation="right"
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.18)", strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "#0E0F11",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#EDEEF0",
                  padding: "8px 10px",
                }}
                labelStyle={{ color: "#9BA1AC", marginBottom: 4, fontSize: 11 }}
                formatter={(v: number) => [
                  quote === "IDR" ? `Rp ${formatIDR(v)}` : v.toFixed(4),
                  `${base}/${quote}`,
                ]}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={stroke}
                strokeWidth={1.75}
                fill="url(#chartGrad)"
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
