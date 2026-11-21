# Panduan menjalankan SIUL (audio baru bisa diklasifikasi)

Ekstraktor audio (`backend/siul_core/live/`) sekarang ada: file suara → Perch v2 + BirdNET v2.4 + 750 fitur hf → `npc_open_set_pipeline.pkl` → label.
Kodenya port langsung dari notebook `unduh-npc` (jendela, resample, kuantisasi int8 mengikuti notebook).

> **Status pengujian jujur.** Di lingkungan penyusunan tidak ada internet, torch, TensorFlow, maupun audio mentah. Yang SUDAH diuji: jendela audio,
> kuantisasi, orkestrasi, integrasi ke `SiulService` (dengan model palsu), dan dimensi fitur hf (750, dihitung dari kode).
> Yang BELUM diuji: keluaran Perch/BirdNET/hf pada audio nyata. Jalankan `scripts/verify_live.py` (langkah 4) sebelum mempercayai hasil.

## A. Lokal dengan VS Code (Windows)
Prasyarat: Node.js 20+, Python **3.12** (TensorFlow 2.20 belum tentu ada untuk versi lain), ±6 GB disk, internet untuk unduhan awal.

1. Buka folder proyek di VS Code (`File → Open Folder`). Pasang ekstensi *Python* dan *ESLint*.
2. Buka terminal VS Code (menu Terminal → New Terminal):
   ```
   setup.bat            # venv backend, dependensi dasar, npm install, build frontend
   setup-live.bat       # torch CPU, tensorflow, librosa, ai-edge-litert, lalu unduh BirdNET + Perch v2
   ```
3. Pastikan `backend/models/npc_open_set_pipeline.pkl` ada, dan `.env.local` berisi `SIUL_API_URL=http://127.0.0.1:8000`.
4. **Verifikasi (wajib, sekali):**
   ```
   backend\.venv\Scripts\python backend\scripts\verify_live.py --pack D:\npc_extract_all --audio D:\schematics-2026\train\audio -n 6
   ```
   Harus berakhir "SEMUA COCOK" (cosine pe/bn/hf > 0,99, selisih logit kecil, label sama dengan jalur pack).
   Bila BEDA: periksa sample rate, jendela, versi model (paket dibuat dengan Perch **GPU**; unduhan skrip ini varian **CPU**).
5. Jalankan: `Ctrl+Shift+P → Tasks: Run Task → SIUL: jalankan semua` (atau `start-backend.bat` dan `start-frontend.bat`).
   Buka http://localhost:3000/analyze. Banner harus hijau "Backend terhubung". Pemuatan model saat start ±10–30 dtk.
6. Debug backend: *Run and Debug → Backend (debug)*. Tes: `backend\.venv\Scripts\python -m pytest backend/tests -q`.

macOS/Linux: pakai `python3.12 -m venv backend/.venv`, `source backend/.venv/bin/activate`, lalu perintah pip/python yang sama dengan isi `.bat`.
Tanpa unduh model, mode `pack` tetap bisa dicoba: `set SIUL_PACK_DIR=D:\npc_extract_all` lalu `start-backend.bat` (hanya klip kompetisi).

## B. Vercel (frontend) + backend di server terpisah
Vercel **tidak bisa** menjalankan backend ini (fungsi serverless: batas ukuran paket ±250 MB, tanpa RAM/CPU untuk TensorFlow + torch).
Vercel hanya untuk frontend Next.js; backend dijalankan di layanan yang mendukung Docker dengan RAM ≥ 4 GB (disarankan 8 GB).

### B1. Backend (contoh: Hugging Face Spaces, SDK Docker)
1. Buat Space baru, SDK **Docker**. Unggah isi proyek ini (minimal `Dockerfile` dan folder `backend/`), termasuk
   `backend/models/npc_open_set_pipeline.pkl` (18 MB; aktifkan Git LFS bila diminta; `.gitignore` proyek mengecualikan `*.pkl`, jadi tambahkan dengan `git add -f`).
2. Tambahkan `README.md` Space dengan header: `sdk: docker` dan `app_port: 7860`.
3. *Settings → Variables*: `SIUL_CORS_ORIGINS=https://NAMA-PROYEK.vercel.app` (isi setelah langkah B2), opsional `SIUL_API_KEY`.
4. Tunggu build (mengunduh bobot model). URL backend: `https://USER-NAMA.hf.space`. Uji: buka `/v1/health` → `extractor_ready: true`.
Alternatif: Render / Railway / Fly.io / VPS dengan `docker build -t siul-backend .` lalu `docker run -p 8000:7860 siul-backend`.

### B2. Frontend di Vercel
1. Push proyek ke GitHub (tanpa `.pkl`, `node_modules`, `.next`), lalu *Vercel → Add New → Project → Import*. Framework Next.js terdeteksi otomatis.
2. *Settings → Environment Variables*:
   | Nama | Nilai |
   |---|---|
   | `SIUL_API_URL` | `https://USER-NAMA.hf.space` (dipakai halaman status dan jalur proxy) |
   | `NEXT_PUBLIC_SIUL_DIRECT_URL` | URL yang sama. **Wajib** agar unggahan audio > 4,5 MB tidak ditolak Vercel |
   | `SIUL_API_KEY` | kosongkan bila memakai unggah langsung (kunci tidak bisa disembunyikan dari browser) |
3. Deploy, lalu isi `SIUL_CORS_ORIGINS` di backend dengan domain Vercel dan restart backend.
Catatan: dengan unggah langsung, siapa pun yang tahu URL backend dapat memanggilnya. Batasi lewat CORS, dan pertimbangkan pembatas laju di proxy/host bila dipublikasikan.
Tanpa `NEXT_PUBLIC_SIUL_DIRECT_URL`, unggahan lewat proxy Vercel hanya aman untuk satu klip kecil (< 4,5 MB total).

## C. Variabel lingkungan backend
| Variabel | Fungsi |
|---|---|
| `SIUL_EXTRACTOR` | `live` (audio apa pun) atau `pack` (hanya klip di paket; butuh `SIUL_PACK_DIR`) |
| `SIUL_PRELOAD=1` | muat model saat start (bukan saat klip pertama) |
| `SIUL_PERCH_DIR`, `SIUL_BIRDNET_MODEL` | lokasi model bila tidak di `backend/models/` |
| `SIUL_PERCH_HOP` | geser jendela Perch, bawaan 2,5 dtk (sama dengan paket latih) |
| `SIUL_TORCH_THREADS`, `SIUL_TFLITE_THREADS` | jumlah thread CPU (bawaan 2) |
| `SIUL_CORS_ORIGINS`, `SIUL_API_KEY` | CORS dan kunci API |
| `SIUL_MAX_UPLOAD_MB`, `SIUL_MAX_FILES`, `SIUL_MAX_TOTAL_MB` | batas unggahan |

## D. Hal yang perlu diwaspadai
- **Kecepatan**: belum diukur. Ekstraksi memakai CPU dan klip diproses satu per satu; batch ratusan klip bisa memakan menit (batas proxy 280 dtk).
- **Perbedaan GPU/CPU**: paket latih dibuat dengan Perch varian GPU; server ini memakai varian CPU dengan jendela yang sama (2,5 dtk). Selisih kecil wajar, tetapi `verify_live.py` yang memutuskan.
- **Mode klip tunggal** sengaja lebih lemah dari batch (laporan Bagian V-D dan VI-A). Mode batch (puluhan klip dari beberapa sumber) adalah mode yang divalidasi.
- **Versi**: pickle model dilatih dengan scikit-learn 1.6.1 dan numpy 2.1.3; jangan ubah pin di `requirements.txt`. Kecocokan pin ini dengan TensorFlow 2.20 dan ai-edge-litert belum diuji (tidak ada internet); bila `pip` mengeluh, laporkan pesan lengkapnya.
- **Lisensi**: bobot BirdNET CC BY-NC-SA 4.0 (nonkomersial); Perch v2 Apache 2.0. URL unduhan Perch berasal dari notebook ekstraksi dan bisa berubah.
- **Koreksi c04** dari leaderboard tidak diterapkan di backend (khusus data uji).
