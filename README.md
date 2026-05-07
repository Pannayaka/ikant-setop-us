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

https://ikant-setop-us.vercel.app

## Tujuan MVP

Frontend MVP ini bertujuan agar alur utama dapat dipakai:

- Tambah jenis ikan
- Tambah cold storage
- Input stok masuk
- Lihat stok FIFO
- Catat stok keluar
- Lihat perubahan di dashboard