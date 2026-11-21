> **Pembaruan:** Langkah 1 dan 2 sudah dikerjakan (`backend/siul_core/live/`, dari notebook `unduh-npc`). Yang tersisa untuk Anda: pasang (`setup-live.bat`),
> **Langkah 3 (`scripts/verify_live.py`, belum pernah dijalankan pada audio nyata)**, lalu Langkah 4-6. Panduan lengkap: `PANDUAN_JALANKAN.md`.

# Langkah selanjutnya: agar suara baru bisa diklasifikasi

## Kondisi sekarang
- `backend/models/npc_open_set_pipeline.pkl` sudah terpasang dan teruji. Ia hanya penyortir akhir: menerima **angka**, bukan file suara.
- Yang belum ada adalah **ekstraktor**: kode yang mengubah file audio menjadi angka yang dimakan model. Tanpanya, `LiveExtractor` menjawab 503 dan hanya klip yang sudah ada di paket ekstraksi (mode `pack`) yang bisa dianalisis.

```
file suara -> [EKSTRAKTOR: belum ada] -> pe(1536) + bn(1024) + hf(750) + logit Perch + logit BirdNET -> [.pkl: sudah ada] -> label
```

## Langkah 1. Minta bahan dari pembuat notebook ekstraksi
Notebook bernama `npc_extract_all` (yang menghasilkan `01_meta_tech_hf.npz`, `02_birdnet.npz`, `03_perch.npz`). Minta:

- [ ] Notebook/skrip ekstraksinya (`.ipynb` atau `.py`).
- [ ] Versi persis model: **Perch v2** dan **BirdNET v2.4** (nama, sumber unduhan, dan file bobotnya bila dilampirkan terpisah).
- [ ] Definisi **750 fitur hf** (bagian ini hanya ada di notebook; tidak bisa ditebak).
- [ ] Parameter pra-pemrosesan: sample rate, panjang dan geser jendela, cara merata-ratakan jendela, nilai `logit_scale`, dan kolom logit yang dipakai (`perch_logit_cols`, `birdnet_logit_cols`).
- [ ] Daftar versi library (TensorFlow, librosa, numpy, dan lain-lain) dan versi Python.
- [ ] Paket ekstraksi asli `npc_extract_all/` (tiga file `.npz` di atas) **beserta audio sumbernya** untuk beberapa klip. Ini dipakai untuk memverifikasi hasil.

## Langkah 2. Port ke `LiveExtractor`
Lokasi: `backend/siul_core/extract.py`, metode `LiveExtractor.extract(filename, audio_path) -> ClipRep`.

Bentuk keluaran yang diminta model (lihat `backend/siul_core/rep.py`):

| Field | Bentuk | Isi |
|---|---|---|
| `pe` | (1536,) | rata-rata embedding Perch antarjendela |
| `bn` | (1024,) | rata-rata embedding BirdNET antarjendela |
| `hf` | (750,) | fitur akustik buatan tim |
| `perch_logit` | (13938,) | logit Perch, sudah dikali `logit_scale` |
| `bn_logit` | (4182,) | logit BirdNET, sudah dikali `logit_scale` |

Tambahkan dependensinya ke `backend/requirements.txt` dengan versi dikunci, lalu jalankan `setup.bat` lagi.

## Langkah 3. Verifikasi (wajib sebelum dipercaya)
1. Ambil 5-10 klip yang ada di paket `npc_extract_all`.
2. Ekstraksi ulang lewat `LiveExtractor`.
3. Bandingkan dengan nilai di paket: `np.allclose(...)` untuk `pe`, `bn`, `hf`, dan logit.
4. Jalankan klip yang sama lewat `/v1/analyze/single` (mode live) dan mode `pack`. Labelnya harus sama.
5. Tambahkan tes otomatis di `backend/tests/` untuk perbandingan ini.

Jika angkanya tidak cocok, hasil klasifikasi tidak boleh dipercaya. Penyebab paling sering: sample rate berbeda, jendela berbeda, atau urutan kolom logit.

## Langkah 4. Siapkan lingkungan penerima
- [ ] Tentukan apakah model Perch/BirdNET diunduh saat pertama kali jalan (perlu internet, ratusan MB) atau disalin ke folder `backend/models/`.
- [ ] Perkirakan kecepatan: CPU biasa memerlukan beberapa detik sampai puluhan detik per klip. Mode Batch dengan ratusan klip dapat memakan menit. Batas waktu frontend saat ini 180 detik (`timeoutMs` di `lib/backend.ts`); naikkan bila perlu.
- [ ] Bila memakai GPU, pasang versi TensorFlow/CUDA yang sesuai.
- [ ] Periksa lisensi: bobot BirdNET berlisensi CC BY-NC-SA 4.0 (nonkomersial); Perch v2 berlisensi Apache 2.0.

## Langkah 5. Uji menyeluruh
```
setup.bat
start-backend.bat        (jendela 1)
start-frontend.bat       (jendela 2)
```
Buka http://localhost:3000/analyze. Banner harus **hijau** ("Backend terhubung"), bukan kuning. Unggah satu klip, lalu satu set klip untuk mode Batch.

## Langkah 6. Sebelum mengirim ke orang lain
- [ ] Jalankan `cd backend && .venv\Scripts\python -m pytest -q` (semua lulus).
- [ ] Jalankan `npm run build`.
- [ ] Buat ulang zip tanpa `.git`, `.venv`, `node_modules`, `.next`.
- [ ] Tulis di README versi Python/Node yang dibutuhkan.

## Opsi sementara: mode pack (untuk demo klip kompetisi saja)
Tanpa langkah 1-3, backend tetap bisa dicoba dengan klip yang sudah ada di paket ekstraksi:

```
set SIUL_PACK_DIR=D:\jalur\ke\npc_extract_all
start-backend.bat
```
Nama berkas unggahan harus sama dengan `file_id` di paket. Klip lain ditolak (422).

## Mode demonstrasi (hanya melihat antarmuka)
Kosongkan `SIUL_API_URL` di `.env.local`, lalu jalankan `start-frontend.bat` saja. Hasilnya dibangkitkan dari nama berkas dan **bukan prediksi model**.
