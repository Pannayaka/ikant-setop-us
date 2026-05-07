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

---

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

## API Endpoints

### Stock Management API

#### 1. Get All Stocks

Mengambil seluruh data stok ikan yang tersedia di dalam sistem.

```http
GET /api/stock
```

#### Response Example

```json
[
  {
    "id": 1,
    "fishType": "Tuna",
    "quality": "Good",
    "remainingWeight": 50,
    "coldStorage": "A-01",
    "enteredAt": "2026-05-07T10:00:00Z"
  }
]
```

#### 2. Add New Stock

Menambahkan batch stok ikan baru ke dalam inventaris.

```http
POST /api/stock
```

#### Request Body

```json
{
  "fishTypeId": 1,
  "quality": "Good",
  "weight": 50,
  "coldStorageId": 2
}
```

#### Response Example

```json
{
  "message": "Stock added successfully",
  "stockId": 7
}
```

#### 3. Update Existing Stock

Digunakan untuk memperbarui data stok seperti lokasi penyimpanan atau kualitas ikan.

```http
PUT /api/stock/{id}
```

#### Request Body

```json
{
  "quality": "Medium",
  "coldStorageId": 3
}
```

#### Response Example

```json
{
  "message": "Stock updated successfully"
}
```

#### 4. Delete Stock

Menghapus data stok tertentu dari sistem.

```http
DELETE /api/stock/{id}
```

#### Response Example

```json
{
  "message": "Stock deleted successfully"
}
```

---

### Stock Out API

#### 1. Record Stock Out

Mencatat ikan keluar dari gudang dan mengurangi jumlah stok secara otomatis.

```http
POST /api/stock_out
```

#### Request Body

```json
{
  "stockBatchId": 7,
  "weightOut": 10,
  "destination": "Restaurant A"
}
```

#### Response Example

```json
{
  "message": "Stock out recorded successfully"
}
```

#### 2. Get Stock Out History

Mengambil seluruh riwayat pengeluaran stok ikan.

```http
GET /api/stock_out
```

#### Response Example

```json
[
  {
    "id": 1,
    "fishType": "Tuna",
    "weightOut": 10,
    "destination": "Restaurant A",
    "outTime": "2026-05-07T14:00:00Z"
  }
]
```

---

### Dashboard API

#### 1. Get Dashboard Summary

Mengambil data ringkasan inventaris untuk dashboard monitoring.

```http
GET /api/dashboard
```

#### Response Example

```json
{
  "totalStock": 1200,
  "fishInToday": 300,
  "fishOutToday": 150,
  "fifoPriority": [
    {
      "fishType": "Tuna",
      "remainingWeight": 40
    }
  ]
}
```

---

### Cold Storage API

#### 1. Get All Cold Storage Locations

Mengambil seluruh data lokasi cold storage.

```http
GET /api/cold_storage
```

#### Response Example

```json
[
  {
    "id": 1,
    "name": "A-01"
  },
  {
    "id": 2,
    "name": "B-02"
  }
]
```

#### 2. Add New Cold Storage

Menambahkan lokasi penyimpanan baru.

```http
POST /api/cold_storage
```

#### Request Body

```json
{
  "name": "C-03"
}
```

#### Response Example

```json
{
  "message": "Cold storage added successfully"
}
```

---

## Dev and Run Instructions

---

### 1. Clone Repository

```bash
git clone https://github.com/pisondev/ikant-setop-us.git
```

### 2. Masuk ke Folder Project

```bash
cd ikant-setop-us
```

### 3. Install Dependencies

Menginstall seluruh dependency yang dibutuhkan project.

```bash
npm install
```

atau menggunakan Yarn:

```bash
yarn install
```

### 4. Setup Environment Variables

Buat file `.env` pada root project.

Contoh konfigurasi:

```env
DATABASE_URL=your_database_url
PORT=3000
JWT_SECRET=your_secret_key
```

### 5. Run Development Server

Menjalankan project dalam mode development.

```bash
npm run dev
```

atau

```bash
yarn dev
```

### 6. Build Project

Build project untuk production.

```bash
npm run build
```

### 7. Start Production Server

Menjalankan hasil build production.

```bash
npm start
```

### 8. Open Application

Buka browser dan akses:

```bash
http://localhost:3000
```

---

## Testing Checklist

### Fish Stock Entry

- [ ] User dapat menambahkan stok ikan baru
- [ ] Data stok tersimpan ke database
- [ ] Validasi form berjalan dengan benar
- [ ] Dashboard otomatis update setelah stock entry
- [ ] Timestamp otomatis tersimpan

### Stock Management

- [ ] Seluruh stok tampil pada stock list
- [ ] Filter berdasarkan jenis ikan berjalan
- [ ] Filter berdasarkan kualitas berjalan
- [ ] Filter berdasarkan lokasi storage berjalan
- [ ] FIFO sorting berjalan dengan benar

### Fish Stock Out

- [ ] User dapat mengurangi stok ikan
- [ ] Jumlah stok tidak bisa negatif
- [ ] Riwayat stock out tersimpan
- [ ] Dashboard update otomatis setelah stock out

### Dashboard Monitoring

- [ ] Total stok tampil dengan benar
- [ ] Fish in today tampil dengan benar
- [ ] Fish out today tampil dengan benar
- [ ] FIFO priority tampil dengan benar
- [ ] Latest entries tampil dengan benar

### Cold Storage Management

- [ ] User dapat menambahkan lokasi storage
- [ ] User dapat mengganti lokasi batch ikan
- [ ] Lokasi tampil pada stock list

### Activity History Log

- [ ] Seluruh aktivitas tercatat
- [ ] Timestamp tersimpan dengan benar
- [ ] Riwayat aktivitas dapat ditampilkan

### Responsive Design

- [ ] Tampilan responsive pada mobile
- [ ] Form mudah digunakan pada smartphone
- [ ] Button mudah ditekan
- [ ] Layout tidak rusak pada layar kecil

### Error Handling

- [ ] Invalid input menampilkan error message
- [ ] API error tertangani dengan baik
- [ ] Sistem tidak crash ketika request gagal
- [ ] User mendapatkan feedback ketika terjadi kesalahan

### Security Testing

- [ ] Endpoint terlindungi authentication
- [ ] User tanpa akses tidak dapat mengubah data
- [ ] Input tervalidasi dengan aman
- [ ] Environment variables tidak terekspos

## Catatan

Fitur non-MVP seperti login, role-based access, notifikasi realtime, dan grafik kompleks ditunda untuk prioritas fitur inti.
