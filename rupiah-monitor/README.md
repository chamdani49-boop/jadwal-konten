# Rupiah Monitor — Realtime Market Tracker (Dark Theme)

Dashboard kurs Rupiah realtime yang **anti-blokir** & **anti-rate-limit**.
Frontend + Backend jadi satu proyek Next.js, gratis di-deploy ke Vercel.

> Inspirasi: [rupiah-monitor.vercel.app](https://rupiah-monitor.vercel.app/) — di-rebuild dengan tema dark, multi-source aggregator, crypto strip, dan converter.

---

## ✨ Fitur

- **Kurs realtime** (USD/IDR, EUR/IDR, SGD/IDR, MYR/IDR, JPY/IDR, dll.) auto-refresh tiap 30 detik
- **Multi-source aggregator** — 5 sumber gratis di-poll paralel, hasil akhir = **median** (tahan outlier)
- **Grafik historis** 7H / 30H / 90H / 1 tahun
- **Konverter cepat** dua arah
- **Strip kripto → IDR** (BTC, ETH, BNB, SOL, USDT)
- **Panel transparansi sumber** — kelihatan provider mana yang ok/down dan deviasinya
- **Dark theme penuh**, responsive, tanpa flash

---

## 🛡️ Strategi Anti-Blokir & Anti-Limit

Ini bagian terpenting. Banyak monitor kurs DIY gampang kena rate-limit atau diblokir karena memanggil API langsung dari browser user. Di sini berbeda:

| Layer | Kenapa anti-blokir / anti-limit |
|---|---|
| 1. Server-side proxy | Browser user nggak pernah memanggil API kurs langsung. Yang manggil adalah Vercel function. IP residential kamu nggak akan kena ban. |
| 2. Multi-source paralel | 5 sumber dipanggil bersamaan. Kalau 1 down/blokir, 4 lainnya tetap jalan. Median tetap valid. |
| 3. CDN-backed primary | Sumber utama (`fawazahmed0/currency-api`) di-host di **jsDelivr CDN** + mirror Cloudflare Pages → praktis tanpa rate limit, latency rendah global. |
| 4. Server cache 30s | Data di-cache di Vercel function (in-memory). 100 user yang refresh barengan = cuma 1 hit ke origin. |
| 5. Edge cache (`s-maxage`) | Vercel CDN ikut nge-cache respons API kita → traffic burst = ditangani edge. |
| 6. Stale-while-revalidate | Kalau cache expired tapi origin lambat, user tetap dapat data lama instan, fresh data di-refresh background. |

### Sumber data yang dipakai (semua **tanpa API key**)

1. **fawazahmed0 currency-api** via jsDelivr — `cdn.jsdelivr.net/npm/@fawazahmed0/currency-api`
2. **fawazahmed0 currency-api** via Cloudflare Pages mirror — `latest.currency-api.pages.dev`
3. **open.er-api.com** — `open.er-api.com/v6/latest/{base}`
4. **exchangerate-api.com (open access)** — `api.exchangerate-api.com/v4/latest/{base}`
5. **frankfurter.dev (ECB data)** — `api.frankfurter.dev/v1/latest`

Untuk historis: `frankfurter.dev` (utama) → fallback fawazahmed per-tanggal.
Untuk crypto: fawazahmed mendukung BTC/ETH/BNB/SOL/USDT sebagai base.

---

## 🚀 Cara Pakai (Tutorial Step-by-Step)

### 0) Yang perlu disiapkan

- **Node.js 18+** (cek: `node -v`)
- **npm** (sudah ikut Node)
- **Akun GitHub** (gratis)
- **Akun Vercel** (gratis, login pakai GitHub)

> Buat yang belum install Node: [https://nodejs.org/](https://nodejs.org/) → ambil versi LTS.

### 1) Jalankan di lokal

```bash
# masuk ke folder proyek
cd rupiah-monitor

# install dependencies (sekali aja)
npm install

# jalankan dev server
npm run dev
```

Buka browser: **http://localhost:3000**

Detik pertama biasanya ada loader sebentar karena fetch ke 5 sumber. Setelah itu nilai akan auto-refresh tiap 30 detik.

### 2) Cara cek API langsung (opsional)

```bash
# kurs USD ke IDR (median dari semua sumber)
curl "http://localhost:3000/api/rate?base=USD&quote=IDR"

# multi-pair (1 USD = berapa IDR, SGD, MYR, …)
curl "http://localhost:3000/api/multi?base=USD"

# historical 30 hari
curl "http://localhost:3000/api/history?base=USD&quote=IDR&days=30"

# crypto ke IDR
curl "http://localhost:3000/api/crypto?symbols=BTC,ETH,SOL"
```

Kamu bisa pasang API ini di proyek lain (mobile app, Telegram bot, Google Sheet, dsb.) — gratis dan tetap kena cache.

### 3) Deploy ke Vercel (gratis, 5 menit)

**Opsi A — via UI (paling gampang):**

1. Push folder `rupiah-monitor/` ke repo GitHub kamu sendiri
2. Buka **vercel.com** → **Add New** → **Project**
3. Pilih repo tersebut → klik **Import**
4. Framework Preset = **Next.js** (auto-detect)
5. Klik **Deploy**
6. Tunggu ~1 menit. Selesai. Kamu dapat URL `xxx.vercel.app`

> Nggak perlu set environment variable apa pun. Semua sumber yang dipakai tanpa key.

**Opsi B — via CLI:**

```bash
npm i -g vercel
vercel       # pertama kali, ikuti prompt
vercel --prod # deploy ke production
```

### 4) Pakai domain sendiri (opsional)

Di dashboard Vercel → project kamu → **Settings → Domains** → tambahkan domain. Ikuti instruksi DNS-nya. Sertifikat SSL otomatis.

---

## 📂 Struktur Proyek

```
rupiah-monitor/
├── app/
│   ├── api/
│   │   ├── rate/route.ts        # USD/IDR (atau pasangan apa pun) — agregat median
│   │   ├── multi/route.ts       # 1 base vs banyak quote (1 request)
│   │   ├── history/route.ts     # historis 7-365 hari
│   │   └── crypto/route.ts      # BTC/ETH/BNB/SOL/USDT → IDR + USD
│   ├── globals.css              # styling dark theme + custom
│   ├── layout.tsx               # root layout, font Outfit + Space Mono
│   └── page.tsx                 # dashboard utama
├── components/
│   ├── Header.tsx               # logo + status LIVE + ago
│   ├── RateCard.tsx             # kartu kurs besar + perubahan %
│   ├── Converter.tsx            # konverter dua arah
│   ├── RateChart.tsx            # grafik area dengan recharts
│   ├── MultiPairs.tsx           # grid mata uang lain
│   ├── CryptoStrip.tsx          # strip BTC/ETH/SOL/dll
│   └── SourcesGrid.tsx          # transparansi sumber + deviasi
├── lib/
│   ├── sources.ts               # 5 sumber + agregator + median
│   ├── cache.ts                 # in-memory cache + TTL
│   └── format.ts                # IDR/number/time helpers
├── public/favicon.svg
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚙️ Konfigurasi (opsional)

`.env.local` (copy dari `.env.example`):

```
CACHE_TTL_SECONDS=30
```

- `30` = sumber dipanggil maksimal sekali per 30 detik per pasangan kurs
- naikkan ke `60` atau `120` kalau traffic kamu super tinggi dan mau hemat

---

## 🧠 Cara Kerja Singkat (Diagram)

```
            ┌─────────────────┐
 Browser ──►│  Next.js Page   │  (SWR poll tiap 30 detik)
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐  cache 30s
            │ /api/rate       │ ────────► (hit) return cached
            └────────┬────────┘
                     │ (miss)
        ┌────────────┼────────────┬────────────┬───────────┐
        ▼            ▼            ▼            ▼           ▼
   jsDelivr     Cloudflare    open.er-api  exchangerate  frankfurter
   fawazahmed   fawazahmed    .com         -api.com      .dev
                                                          (ECB)

   ──► hasil di-collect ──► median = nilai akhir + min/max + transparansi
```

Karena agregasi paralel, **walaupun 4 dari 5 sumber down, dashboard tetap berfungsi**.

---

## 🎨 Kustomisasi

- **Ganti warna aksen**: edit `tailwind.config.ts` → `colors.accent.gold`
- **Tambah mata uang**: edit array `["USD","EUR",...]` di `app/page.tsx`
- **Tambah crypto**: edit `DEFAULT_SYMBOLS` di `app/api/crypto/route.ts`
- **Pasang KV/Redis** untuk cache lintas instance: ganti isi `lib/cache.ts` pakai Vercel KV / Upstash

---

## 🧪 Testing manual

```bash
# kurs aneh-aneh juga jalan (cuma butuh ada di sumber)
curl "http://localhost:3000/api/rate?base=USD&quote=IDR"
curl "http://localhost:3000/api/rate?base=SGD&quote=IDR"
curl "http://localhost:3000/api/rate?base=USD&quote=THB"
curl "http://localhost:3000/api/multi?base=USD&quotes=IDR,SGD,MYR,JPY"
```

Cek field `okCount` di response. Kalau bernilai 5, semua sumber sehat. Kalau 3-4 itu masih hijau (median tetap valid). Kalau 0 berarti jaringan kamu sedang aneh.

---

## ❓ FAQ

**Q: Ini benar gratis?**
A: Iya, sumber data semuanya public no-key. Vercel hobby plan juga gratis (100 GB bandwidth/bulan — cukup untuk ribuan user).

**Q: Akurasi setara Bank Indonesia?**
A: Sumber-sumber ini ambil mid-market rate (ECB/aggregator). Untuk kurs jual-beli teller bank, beda. Tapi untuk monitoring tren dan konversi cepat — sangat akurat. Kalau perlu kurs JISDOR resmi BI, kamu bisa tambahin satu fetcher lagi di `lib/sources.ts` ke `https://www.bi.go.id/.../JISDOR.aspx` (HTML scrape) — strukturnya sudah modular.

**Q: Aman buat dipakai komersial?**
A: Cek terms tiap sumber. Kebanyakan public no-key membolehkan pemakaian non-redistribusi. Kalau mau aman 100%, daftar API berbayar (mis. `exchangerate-api.com` plan, atau `currencylayer`) lalu tambahin sebagai sumber ke-6.

**Q: Browser user kena CORS?**
A: Nggak, karena yang manggil adalah API route Next.js (server). Browser user cuma manggil endpoint kamu sendiri.

**Q: Bandwidth Vercel hobby cukup?**
A: Berkat cache 30s + edge cache `s-maxage`, kalaupun ada 10.000 visit/hari, hit ke origin total < 3.000 dan respons tiap kali < 5KB. Hemat banget.

---

## 📝 License

MIT — bebas dipakai, dimodif, dipublish ulang.
