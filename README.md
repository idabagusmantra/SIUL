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

## Mulai cepat (Windows)
Prasyarat: Node.js 20+ dan Python 3.11 atau 3.12.

1. Jalankan `setup.bat` sekali (membuat venv backend, memasang dependensi, dan membangun frontend).
2. Jendela 1: `start-backend.bat` (http://127.0.0.1:8000). Jendela 2: `start-frontend.bat` (http://localhost:3000).
3. Buka `/analyze`. Banner harus berbunyi "Backend terhubung".

**Audio baru** memerlukan `setup-live.bat` (lihat `PANDUAN_JALANKAN.md`). Tanpa itu, banner berwarna kuning dan analisis ditolak dengan pesan 503. Untuk mencoba dengan klip kompetisi, set `SIUL_PACK_DIR`
ke folder `npc_extract_all` sebelum menjalankan `start-backend.bat`. Untuk hanya melihat antarmuka, kosongkan `SIUL_API_URL` di `.env.local` (mode demonstrasi).

## Menyambungkan backend (manual)
Alurnya: **browser → route handler Next.js → backend FastAPI (`backend/`)**. Browser tidak memanggil backend langsung.

1. Letakkan **`npc_open_set_pipeline.pkl`** di `backend/models/` (tidak ikut di-commit; lihat `.gitignore`).
   `model_closedset_lr.pkl` tidak diperlukan (isinya identik dengan `clf_models` di bundle) dan `npc_predictions_final.pkl` hanya dipakai tes.
2. Siapkan backend (versi dikunci sesuai pelatihan: scikit-learn 1.6.1, numpy 2.1.3):

        cd backend
        python -m venv .venv && source .venv/bin/activate
        pip install -r requirements.txt
        SIUL_EXTRACTOR=pack SIUL_PACK_DIR=/jalur/ke/npc_extract_all uvicorn main:app --port 8000

3. Salin `.env.example` ke `.env.local`, isi `SIUL_API_URL=http://127.0.0.1:8000` (pakai 127.0.0.1, bukan localhost, agar tidak salah ke IPv6) (opsional `SIUL_API_KEY`, samakan dengan backend), lalu `npm run dev`.
   Banner di `/analyze` berubah dari "Mode demonstrasi" menjadi "Backend terhubung".

Endpoint: `GET /v1/health`, `POST /v1/analyze/single` (1 berkas), `POST /v1/analyze/batch` (2-200 berkas); multipart, field `files`.
Bentuk respons ada di `lib/types.ts`.

### Yang sudah terpasang di backend (`backend/siul_core`)
Port dari notebook final: view `pe/bn/prof/hf`, fitur zero-shot, ensemble LogReg (prof+hf+pe), ruang WCCN + centroid group,
graf SNN + Leiden dengan voting 18 setelan, bukti per cluster, dan aturan open-set. Mode **Klip Tunggal** memakai aturan yang sama pada satu klip;
mode **Batch** menjalankan clustering. Koreksi manual c04 dari leaderboard sengaja **tidak** disertakan.

### Ekstraktor audio (live)
`backend/siul_core/live/` mengubah audio mentah menjadi representasi model (Perch v2, BirdNET v2.4, 750 fitur hf), port dari notebook ekstraksi.
Pasang dengan `setup-live.bat`, lalu **verifikasi** dengan `backend/scripts/verify_live.py` sebelum dipercaya. Langkah lengkap lokal (VS Code) dan
deploy (Vercel + backend Docker) ada di **`PANDUAN_JALANKAN.md`**. Mode `SIUL_EXTRACTOR=pack` tetap tersedia untuk klip kompetisi tanpa model.

### Pengujian
    cd backend && pip install -r requirements-dev.txt
    SIUL_MODEL_DIR=/jalur/ke/folder/pkl pytest -q
Tes dengan data asli: aturan backend menghasilkan keputusan yang sama dengan notebook untuk 22 cluster acuan, dan flag zero-shot cocok untuk
2.640 klip. Tes perpipaan memakai representasi sintetis (bukan suara): bentuk, skema, determinisme. Akurasi pada audio baru belum teruji
sampai ekstraktor terpasang.

### Keamanan dan versi
Pickle dapat mengeksekusi kode, maka `siul_core/bundle.py` memakai unpickler dengan daftar putih eksak (delapan kelas yang dibutuhkan bundle). Tetap hanya muat berkas tepercaya.
Pickle scikit-learn tidak aman lintas-versi; model dilatih dengan Python 3.13, scikit-learn 1.6.1, numpy 2.1.3.

Untuk deploy di Vercel, backend harus dihosting terpisah (Python + model). Batas ukuran body fungsi serverless kecil, jadi untuk audio besar
pertimbangkan server sendiri atau unggah langsung ke backend.

## Catatan lisensi
Bobot BirdNET berlisensi CC BY-NC-SA 4.0 (nonkomersial); Perch v2 berlisensi Apache 2.0.
