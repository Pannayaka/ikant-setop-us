# Ikan't Setop Us

Website untuk mencatat pemasukan dan pengeluaran ikan di cold storage. Aplikasi ini dirancang sebagai MVP mobile-first untuk membantu operator gudang dan pekerja lapangan menikmati alur yang sederhana dan cepat.

## Deskripsi

Aplikasi ini mencatat:

- Stok ikan masuk ke cold storage
- Data jenis ikan
- Lokasi cold storage
- Stok FIFO
- Pencatatan ikan keluar
- Ringkasan dashboard
- Riwayat pengeluaran sederhana

Tujuan utama adalah membuktikan alur end-to-end:
`input stok masuk → data tersimpan → stok tampil berdasarkan FIFO → stok keluar dicatat → dashboard berubah`.

## Fitur Utama

- Input stok ikan masuk
- Daftar stok FIFO
- Input stok keluar berdasarkan jenis ikan
- Dashboard monitoring stok dan aktivitas terbaru
- Master jenis ikan
- Master cold storage
- Tampilan mobile-first

## Struktur Halaman

- `/` → redirect ke dashboard
- `/dashboard` → ringkasan stok dan recent movement
- `/fish-types` → master jenis ikan
- `/cold-storages` → master lokasi cold storage
- `/stocks/new` → input stok masuk
- `/stocks` → daftar stok FIFO
- `/stock-outs/new` → input ikan keluar
- `/stock-outs` → riwayat pengeluaran

## Teknologi

- Next.js
- TypeScript
- API backend Go Fiber
- Mobile-first UI

## Link Website
Website bisa diakses dengan link di bawah ini:

<<<<<<< HEAD
https://ikant-setop-us.vercel.app
=======
Tambahkan variabel berikut di `.env`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1
```

## Cara Menjalankan

1. Pasang dependensi:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser dan akses:
```bash
https://ikant-setop-us.vercel.app
```
>>>>>>> 0c76436545e45fc5feef382562d2064e878b9173

## Tujuan MVP

Frontend MVP ini bertujuan agar alur utama dapat dipakai:

- Tambah jenis ikan
- Tambah cold storage
- Input stok masuk
- Lihat stok FIFO
- Catat stok keluar
<<<<<<< HEAD
- Lihat perubahan di dashboard
=======
- Lihat perubahan di dashboard

## Catatan

Fitur non-MVP seperti login, role-based access, notifikasi realtime, dan grafik kompleks ditunda untuk prioritas fitur inti.
>>>>>>> 0c76436545e45fc5feef382562d2064e878b9173
