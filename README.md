# SIUL — Pengenal Avifauna Bioakustik

Antarmuka web untuk klasifikasi suara burung open-set (Bondol Jawa, Cendrawasih, Kutilang, Unknown),
berbasis pipeline Tim IRIS Darsana. Next.js 16 · React 19 · Tailwind CSS v4.

## Jalankan
    npm install
    cp .env.example .env.local
    npm run dev   # http://localhost:3000

## Halaman
- `/` Beranda dan alur pipeline
- `/analyze` Analisis audio, dua mode: **Klip tunggal** dan **Batch per sumber**
- `/clusters` Katalog 22 cluster uji (`lib/data.ts`)
- `/rules` Simulator aturan open-set 1–6 (`lib/rules.ts`)

## Kontrak backend
`POST /api/analyze` memvalidasi unggahan lalu meneruskan `multipart/form-data` ke `${SIUL_BACKEND_URL}/analyze`:

| Field   | Nilai                                          |
|---------|------------------------------------------------|
| `mode`  | `single` (tepat 1 berkas) atau `batch` (≥ 6)   |
| `files` | berkas audio (FLAC/WAV/MP3/OGG/M4A, ≤ 40 MB)   |

Respons yang diharapkan: `{"clusters": [{cluster, n, files, evidence, label, rule, reason}]}` (lihat `lib/types.ts`).
- `single`: satu elemen `clusters` dengan `n = 1`; `evidence.fK/fC/fB` bernilai 0 atau 1 (detektor aktif atau tidak).
- `batch`: WCCN → graf SNN → Leiden (voting 18 setelan) → bukti agregat per cluster.

Tanpa `SIUL_BACKEND_URL`, API mengembalikan simulasi deterministik (`mode: "demo"`) dan UI menampilkan peringatan.
Backend (`backend/main.py`) masih berupa kerangka yang membalas 501.
