# SuntikPanel - Web Panel Sosmed

## Stack
- Node.js + Express
- Frontend: HTML/CSS/JS vanilla (single page per fitur)
- Data: JSON files
- Deploy: Termux Android
- Backup: GitHub private

## Struktur File
- server.js — Backend, semua API endpoint
- public/index.html — Halaman order pembeli
- public/admin.html — Dashboard admin
- public/login.html — Login/register
- public/saldo.html — Isi saldo
- public/deposit.html — Instruksi deposit QRIS
- public/statistik.html — Statistik user
- public/tiket.html — Tiket komplain user
- public/riwayat.html — Riwayat order user
- public/deposit-riwayat.html — Riwayat deposit user
- public/status.html — Status server publik
- public/landing.html — Landing page publik
- public/menu.html — Menu user
- public/menu-admin.html — Menu admin
- public/style.css — Style user (light + dark mode)
- public/admin.css — Style admin
- public/app.js — Logic user (order, refund, theme)
- public/admin.js — Logic admin
- public/logo.png — Logo
- public/qris.png — QRIS all payment

## Data Files (jangan dihapus)
- users.json — Data user + saldo + level
- orders.json — Riwayat order
- deposits.json — Riwayat deposit
- tickets.json — Tiket komplain
- vouchers.json — Voucher diskon

## Fitur Selesai
1. Login/register
2. Order sosmed (TikTok, IG, FB) dengan harga otomatis
3. Deposit saldo via QRIS
4. Panel admin: order, deposit, tiket
5. Statistik user (grafik 7 hari)
6. Tiket komplain + chat
7. Voucher diskon (percent/fixed)
8. Auto-refund untuk order gagal
9. Level user: user / reseller (diskon 15%)
10. Dark mode
11. Landing page publik
12. Status server
13. Backup GitHub otomatis

## Config Penting
- WA Admin: 6289674642514
- Minimum order: 100 pcs (comment: 50)
- Minimum charge: Rp 5.000
- Minimum deposit: Rp 5.000
- Diskon reseller: 15%
- Port: 3000

## Harga
TikTok: Like 7k, View 6k, Follower 28k, Comment 35k, Share 10k
IG: Like 8k, View 7k, Follower 35k, Comment 42k, Share 12k
FB: Like 10k, View 7k, Follower 40k, Comment 48k, Share 15k
(semua per 1000 kecuali comment per 100)

## Endpoint API
- POST /api/register, /api/login
- GET /api/user/:whatsapp
- GET /api/harga
- POST /api/order
- POST /api/deposit/request
- GET /api/admin/orders, /api/admin/deposits, /api/admin/users
- POST /api/admin/deposit/confirm/:id
- POST /api/admin/user/set-level
- POST /api/order/:id/report-fail
- POST /api/admin/order/refund/:id
- POST /api/voucher/check
- POST /api/admin/voucher/create
- GET /api/status

## Integrasi Provider (IrvanKede) - BARU

### Fitur
- Order otomatis dikirim ke provider IrvanKede
- Auto-tracking status order tiap 5 menit
- Auto-refund kalau provider error
- Mode mock untuk testing tanpa API key
- Dukungan multi-provider (tinggal ganti lib/provider.js)

### File Baru
- `lib/provider.js` - Wrapper API IrvanKede (mock + live)
- `lib/sync-orders.js` - Cron cek status order
- `lib/services-map.json` - Mapping layanan panel → service_id provider
- `.env` - Konfigurasi API (JANGAN commit)
- `.env.example` - Template

### Config Penting
- Provider: IrvanKede (https://irvankedesmm.co.id)
- API ID: (lihat .env)
- Mode: mock/live (set di .env)
- Sync interval: 5 menit (set di .env)

### Status Order Baru
- `pending` - baru dibuat, belum kirim
- `processing` - sudah kirim ke provider, sedang diproses
- `success` - provider selesai
- `partial` - selesai sebagian
- `error` - gagal → auto refund
- `refunded` - sudah direfund

### Endpoint Baru
- `GET /api/provider/balance` - cek saldo provider
- `GET /api/provider/services` - daftar layanan provider
- `GET /api/provider/info` - info konfigurasi
- `POST /api/admin/sync-orders` - manual sync status

### Auto-Sync
- Cron jalan tiap 5 menit
- Cek order berstatus `processing`
- Update status + auto-refund kalau error

### Test
- Mode mock: set `PROVIDER_MODE=mock` di `.env`
- Mode live: set `PROVIDER_MODE=live` + API key
- Manual sync: `curl -X POST http://localhost:3000/api/admin/sync-orders`
