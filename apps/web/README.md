# 🐟 Ikan't Setop Us — Web Frontend

> Sistem manajemen inventori ikan berbasis web untuk pengepul ikan di Pelabuhan Makassar.  
> Dibangun dengan pendekatan **Mobile-First** untuk pekerja lapangan.

---

## 📋 Tentang Proyek

Aplikasi ini merupakan solusi digitalisasi pencatatan stok ikan yang sebelumnya dilakukan secara manual menggunakan buku tulis fisik. Dirancang khusus untuk kondisi lapangan pelabuhan — tangan basah, layar kecil, aktivitas cepat — dengan antarmuka yang simpel, kontras tinggi, dan minim ketikan.

Sistem menerapkan prinsip **FIFO (First In, First Out)** untuk memastikan ikan yang lebih lama disimpan diprioritaskan untuk dikeluarkan terlebih dahulu, sehingga mengurangi risiko penurunan kualitas dan kerugian finansial.

### Target Pengguna
- **Baso** (Admin Gudang / Pekerja Lapangan) — mencatat ikan masuk & keluar
- **Daeng Syamsul** (Pemilik Usaha / Punggawa) — memantau stok via dashboard

---

## ✨ Fitur Utama

| Halaman | Deskripsi |
|---|---|
| `/dashboard` | Monitoring stok real-time, distribusi kualitas, kapasitas cold storage, dan aktivitas terbaru |
| `/stocks` | Daftar stok terurut FIFO dengan filter per jenis ikan dan badge prioritas |
| `/stocks/new` | Form input stok masuk 4-step: jenis ikan → kualitas → lokasi → berat |
| `/stock-outs/new` | Form pengeluaran ikan dengan multi-select batch dan rekomendasi FIFO |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Inline CSS Variables (Mobile-First, zero dependency)
- **Font**: Syne, DM Sans, DM Mono (Google Fonts)

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+
- npm

### Instalasi

```bash
# Clone repository
git clone https://github.com/your-org/ikant-setop-us.git
cd ikant-setop-us/apps/web

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [https://ikant-setop-us.vercel.app](https://ikant-setop-us.vercel.app) di browser.

---

## 📁 Struktur Folder

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirect ke /dashboard
│   ├── dashboard/
│   │   └── page.tsx            # Halaman dashboard monitoring
│   ├── stocks/
│   │   ├── page.tsx            # Daftar stok FIFO
│   │   └── new/
│   │       └── page.tsx        # Form input stok masuk
│   └── stock-outs/
│       └── new/
│           └── page.tsx        # Form stok keluar
├── components/
│   └── layout/
│       ├── MobileLayout.tsx    # Layout wrapper + header
│       └── BottomNav.tsx       # Bottom navigation 4 tab
├── lib/
│   └── api.ts                  # API helper + mock data
└── types/
    └── api.ts                  # TypeScript type definitions
```

---

## 🔌 Integrasi API

Semua request API terpusat di `src/lib/api.ts`. Untuk beralih dari mock data ke backend nyata, ubah satu baris:

```ts
// src/lib/api.ts
const USE_MOCK = false; // ganti dari true ke false
```

Endpoint yang digunakan:

```
GET  /fish-types
GET  /cold-storages
GET  /stocks/fifo
POST /stocks
POST /stock-outs
GET  /dashboard/summary
GET  /dashboard/recent-movements
```

---

## 👥 Tim Pengembang

| Nama | Role |
|---|---|
| Mikail Achmad | Frontend Developer & UI Implementer |
| Pison Golda Mountera | Backend Developer & System Designer |
| Pannayaka Janggleng RL | Product Research & Flow Designer |
| Ahmad Farhan Hidayat | Data & Logic Support |
| Raditya Fadhil Athaya | Documentation, Testing & Pitching |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **Internship Month OmahTI 2026**.  
© 2026 Kelompok 8 — Ikan't Setop Us · Universitas Gadjah Mada
