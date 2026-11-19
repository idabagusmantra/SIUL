# SIUL
Prototype Next.js + React untuk hasil NPC DSC 2026 (Tim IRIS Darsana): klasifikasi suara burung open-set
(Bondol Jawa, Cendrawasih, Kutilang, Unknown) dengan keputusan tingkat cluster.

## Jalankan
    npm install
    npm run dev   # http://localhost:3000

## Halaman
- `/` ringkasan & pipeline · `/analyze` unggah audio (mode DEMO tanpa backend)
- `/clusters` 22 cluster uji (Tabel XXII) · `/rules` simulator 6 aturan open-set · `/validation` grafik validasi

## Struktur
- `lib/rules.ts` aturan keputusan (Laporan IV-D) · `lib/data.ts` angka dari laporan · `lib/demo.ts` mode demo
- `app/api/analyze` proxy ke `SIUL_BACKEND_URL` bila diisi · `backend/` kontrak FastAPI (belum diimplementasikan)

## Catatan
Inferensi nyata butuh Perch/BirdNET + data latih (Python); aplikasi web ini belum memuat model.
