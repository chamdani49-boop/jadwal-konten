export function formatIDR(n: number, opts?: { compact?: boolean }) {
  if (!Number.isFinite(n)) return "—";
  if (opts?.compact) {
    return new Intl.NumberFormat("id-ID", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  }
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: n >= 100 ? 0 : 4,
  }).format(n);
}

export function formatNumber(n: number, digits = 4) {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
  }).format(n);
}

export function pct(prev: number, curr: number) {
  if (!Number.isFinite(prev) || prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

export function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 1000) return "baru saja";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} detik lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}
