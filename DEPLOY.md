# Deploy UangKu ke VPS

Aplikasi ini memakai SQLite (file `data/uangku.db`) dan Node.js 22+. Cukup satu proses; tidak perlu database terpisah.

## 1. Siapkan konfigurasi

```bash
cp .env.example .env
# isi APP_PASSWORD (kata sandi masuk) dan AUTH_SECRET (acak panjang):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env` jangan pernah di-commit. Tanpa `APP_PASSWORD`, login **nonaktif** — jangan lakukan itu di server publik.

## 2A. Docker (disarankan)

```bash
docker compose up -d --build
```

Aplikasi mendengarkan di `127.0.0.1:3000`; data tersimpan di folder `./data`.

## 2B. Tanpa Docker

```bash
npm ci
npm run build
npm start          # port 3000 (ubah dengan PORT=xxxx)
```

Jalankan terus-menerus dengan systemd atau pm2 (`pm2 start npm --name uangku -- start`).

## 3. HTTPS lewat reverse proxy

Contoh Caddy (HTTPS otomatis), `/etc/caddy/Caddyfile`:

```
uangku.domainanda.com {
    reverse_proxy 127.0.0.1:3000
}
```

Pastikan `COOKIE_SECURE=true` di `.env` setelah HTTPS aktif. Dengan HTTPS, aplikasi juga bisa dipasang sebagai PWA di HP.

## 4. Backup (penting)

Semua data ada di `data/uangku.db` (+ file `-wal`/`-shm` saat berjalan). Backup harian yang aman:

```bash
sqlite3 data/uangku.db ".backup '/backup/uangku-$(date +%F).db'"
```

atau unduh CSV/JSON dari menu Pengaturan secara berkala. Salin hasil backup ke luar VPS.

## Catatan keamanan

- Login memakai satu kata sandi bersama untuk seluruh keluarga; "anggota" hanya penanda pencatat.
- Percobaan salah dibatasi 5 kali per 15 menit per IP (disimpan di memori, reset saat restart).
- Perbarui dependensi secara berkala (`npm audit`).
