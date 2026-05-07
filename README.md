# Ikan't Setop Us

Website untuk mencatat pemasukan dan pengeluaran ikan di cold storage. Aplikasi ini dirancang sebagai MVP mobile-first untuk membantu operator gudang dan pekerja lapangan menikmati alur yang sederhana dan cepat.

## Deskripsi

Aplikasi ini mencatat:

- stok ikan masuk ke cold storage
- data jenis ikan
- lokasi cold storage
- stok FIFO
- pencatatan ikan keluar
- ringkasan dashboard
- riwayat pengeluaran sederhana

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

## Cara Menjalankan

Buka browser dan akses link di bawah ini:
```bash
https://ikant-setop-us.vercel.app
```

## Tujuan MVP

Frontend MVP ini bertujuan agar alur utama dapat dipakai:

- Tambah jenis ikan
- Tambah cold storage
- Input stok masuk
- Lihat stok FIFO
- Catat stok keluar
- Lihat perubahan di dashboard

# MVP
---
## Problem Statement

Pelabuhan ikan di Makassar merupakan lingkungan kerja dengan aktivitas tinggi yang melibatkan proses bongkar muat, penyortiran, penimbangan, dan penyimpanan ikan setiap hari. Saat ini, pencatatan stok masih dilakukan secara manual menggunakan buku log atau catatan kertas yang rentan rusak akibat lingkungan kerja yang basah dan sibuk.

Sistem pencatatan manual menyebabkan beberapa permasalahan utama, seperti:

- Kesalahan pencatatan stok ikan masuk dan keluar
- Sulitnya memantau stok secara real-time
- Risiko kehilangan data inventaris
- Sulit menerapkan sistem FIFO (First In First Out)
- Tingginya potensi ikan rusak akibat stok lama terlupakan
- Sulitnya melacak lokasi penyimpanan ikan di cold storage

"Ikan’t Setop Us" hadir sebagai solusi digital berbasis web untuk membantu pengelolaan inventaris ikan secara real-time, efisien, dan terstruktur. Sistem ini memungkinkan pencatatan stok masuk dan keluar, pemantauan lokasi penyimpanan, serta penerapan FIFO untuk mengurangi kerugian akibat pembusukan ikan.

---

## Target Users

#### 1. Warehouse Admin / Pekerja Gudang

Pengguna utama yang bertugas melakukan:
- Input stok ikan masuk
- Input stok ikan keluar
- Mengatur lokasi penyimpanan ikan
- Memastikan data inventaris selalu ter-update

#### 2. Owner / Manager

Pengguna yang membutuhkan monitoring inventaris secara keseluruhan.
Kebutuhan utama:
- Melihat total stok ikan tersedia
- Melihat aktivitas stok masuk dan keluar
- Memantau stok prioritas FIFO
- Mengambil keputusan operasional berdasarkan data real-time

---

## Core User Flow

#### Proses Input Ikan Masuk
1. Admin membuka halaman "Tambah Stok"
2. Admin memilih jenis ikan
3. Admin memilih kualitas ikan
4. Admin memasukkan berat ikan
5. Admin memilih lokasi cold storage
6. Data disimpan ke database
7. Dashboard otomatis memperbarui total stok

#### Monitoring Stok dan FIFO
1. User membuka halaman Dashboard atau Stock List
2. Sistem menampilkan seluruh stok ikan
3. User dapat memfilter berdasarkan:
   - Jenis ikan
   - Kualitas
   - Lokasi storage
4. Sistem mengurutkan stok berdasarkan FIFO
5. User dapat melihat stok yang harus diprioritaskan keluar terlebih dahulu

#### Proses Ikan Keluar

1. Admin membuka halaman "Stock Out"
2. Admin memilih batch ikan
3. Sistem merekomendasikan batch tertua (FIFO)
4. Admin memasukkan jumlah ikan keluar
5. Admin memasukkan tujuan distribusi
6. Sistem mengurangi jumlah stok
7. Riwayat aktivitas tersimpan otomatis

---

## Key Features

### Fish Stock Entry

Fitur untuk mencatat ikan masuk ke dalam sistem inventaris.

### Stock Management & Filtering

Fitur untuk melihat dan mengelola seluruh stok ikan.

### FIFO (First In First Out) System

Fitur prioritas pengeluaran stok berdasarkan waktu masuk.

### Fish Stock Out

Fitur untuk mencatat ikan keluar dari gudang.

### Cold Storage Management

Fitur pengelolaan lokasi penyimpanan ikan.

### Dashboard Monitoring

Fitur dashboard untuk monitoring inventaris secara real-time.

### Activity History Log

Fitur pencatatan seluruh aktivitas sistem.

---

## Catatan

Fitur non-MVP seperti login, role-based access, notifikasi realtime, dan grafik kompleks ditunda untuk prioritas fitur inti.
