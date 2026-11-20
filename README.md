# SIUL — Bioacoustic Avifauna Classifier

Antarmuka web (Next.js 16, React 19, Tailwind CSS v4) untuk mengenali suara Bondol Jawa, Cendrawasih, dan Kutilang
dengan pendekatan open-set (label Unknown bila bukti tidak cukup).

    npm install
    npm run dev        # http://localhost:3000

## Halaman
| Rute | Isi |
|---|---|
| `/` | Ikhtisar sistem dan pipeline |
| `/analyze` | Unggah audio: tab **Klip Tunggal** (evaluasi per klip) dan **Batch Sumber** (SNN + Leiden) |
| `/clusters` | Katalog cluster referensi beserta bukti |
| `/rules` | Simulator aturan penolakan open-set |

## Menyambungkan backend
Browser tidak memanggil backend langsung. Alurnya: **browser → route handler Next.js → backend FastAPI**.

1. Salin `.env.example` menjadi `.env.local`, isi `SIUL_API_URL` (mis. `http://localhost:8000`), opsional `SIUL_API_KEY`.
2. Jalankan backend: `cd backend && pip install -r requirements.txt && uvicorn main:app --port 8000`.
3. Mulai ulang `npm run dev`. Banner di `/analyze` berubah dari "Mode demonstrasi" menjadi "Backend terhubung".

Kontrak:
- `GET /v1/health` → `{"ok": true}`
- `POST /v1/analyze/single` (multipart, field `files`, 1 berkas) → `{"result": ClipResult}`
- `POST /v1/analyze/batch` (multipart, field `files`, ≥ 2 berkas) → `{"clips": BatchClip[], "clusters": BatchCluster[]}`

Tipe lengkap ada di `lib/types.ts`; proxy di `lib/backend.ts` dan `app/api/analyze/*`. `backend/main.py` baru kerangka:
model Perch/BirdNET dan pipeline notebook belum di-port. Tanpa `SIUL_API_URL`, aplikasi memakai `lib/demo.ts`
(hasil dibangkitkan dari nama berkas, bukan prediksi model, dan diberi banner).

Untuk deploy di Vercel, backend harus dihosting terpisah (butuh Python dan model); isi `SIUL_API_URL` di Environment Variables.
Batas ukuran body fungsi serverless Vercel kecil, jadi untuk unggahan audio besar pertimbangkan hosting Next.js di server sendiri
atau unggah langsung ke backend.

## Catatan lisensi
Bobot BirdNET berlisensi CC BY-NC-SA 4.0 (nonkomersial); Perch v2 berlisensi Apache 2.0.
