# 🛠️ Sepasi Admin Panel

> Dashboard admin untuk mengelola produk affiliate, memantau klik Amazon, dan autentikasi admin — dibangun dengan Next.js 15 dan Prisma ORM.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Fitur

- 🔐 **Autentikasi admin** dengan iron-session + enkripsi AES-256
- 📦 **Manajemen produk** — upload, edit, dan hapus produk affiliate
- 📊 **Dashboard analitik** — grafik kategori produk & total klik Amazon
- 🔗 **Click tracking** — mencatat setiap klik affiliate link ke Amazon
- 🖼️ **Upload gambar** produk dengan penyimpanan lokal
- 🌐 **REST API** dengan CORS whitelist untuk ecommerce frontend

---

## 🧰 Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| ORM | Prisma |
| Database | MySQL |
| Auth | iron-session |
| Enkripsi | AES-256 (crypto-js) |
| Charts | Recharts |

---

## 🚀 Setup Lokal

### 1. Clone dan install dependencies

```bash
git clone https://github.com/username/sepasi-admin.git
cd sepasi-admin
pnpm install
```

### 2. Setup environment variables

```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi semua value (lihat tabel di bawah).

### 3. Setup database

```bash
# Jalankan semua migrasi
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 4. Buat akun admin pertama

```bash
# Pastikan ADMIN_USERNAME dan ADMIN_PASSWORD sudah diset di .env.local
npx ts-node -r tsconfig-paths/register scripts/create-admin.ts
```

### 5. Jalankan dev server

```bash
pnpm dev
# Buka http://localhost:3000
```

---

## ⚙️ Environment Variables

Buat file `.env.local` berdasarkan `.env.example`:

| Variable | Deskripsi | Contoh |
|---|---|---|
| `DATABASE_URL` | Connection string MySQL | `mysql://user:pass@localhost:3306/db` |
| `SECRET_KEY` | Kunci enkripsi AES-256 (**tepat 32 karakter**) | `abcdefgh12345678abcdefgh12345678` |
| `SESSION_PASSWORD` | Kunci iron-session (**min 32 karakter**) | `my-super-secret-session-key-here` |
| `ECOMMERCE_URL` | URL frontend ecommerce (untuk CORS) | `http://localhost:3001` |
| `ADMIN_USERNAME` | Username untuk script create-admin | `admin` |
| `ADMIN_PASSWORD` | Password untuk script create-admin | `password_kuat_kamu` |

> ⚠️ **Jangan pernah commit `.env.local` ke GitHub!** File ini sudah di-ignore di `.gitignore`.

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/login` | Login admin |
| `POST` | `/api/logout` | Logout admin |
| `GET` | `/api/session` | Cek status sesi |
| `GET` | `/api/products` | Ambil semua produk |
| `POST` | `/api/products` | Tambah produk baru |
| `PUT` | `/api/products/[id]` | Update produk |
| `DELETE` | `/api/products/[id]` | Hapus produk |
| `GET` | `/api/clicks` | Total klik affiliate |
| `POST` | `/api/clicks` | Catat klik baru |
| `GET` | `/api/dashboard/stats` | Statistik dashboard |

---

## ☁️ Deploy ke Vercel

1. Push repo ini ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project** → import repo
3. Tambahkan semua environment variables di **Settings → Environment Variables**
4. Klik **Deploy**

> 💡 Deploy admin ini **terlebih dahulu** sebelum deploy ecommerce frontend.

---

## 📁 Struktur Project

```
sepasi-admin/
├── app/
│   ├── api/              # REST API routes
│   ├── dashboard/        # Halaman dashboard & analitik
│   ├── manage-products/  # Halaman kelola produk
│   └── upload-product/   # Halaman upload produk baru
├── components/           # Komponen React (UI + layout)
├── lib/                  # Utilities (prisma, session, enkripsi)
├── prisma/               # Schema & migrasi database
├── scripts/              # Script setup (create-admin)
└── public/uploads/       # Gambar produk (di-ignore git)
```

---

## 🔗 Related Project

- [**Sepasi Ecommerce**](https://github.com/stefanus28/sepasi-ecommerce) — Frontend storefront publik yang mengkonsumsi API dari admin ini
