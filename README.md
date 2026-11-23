# UangKu 💰

Aplikasi pencatatan keuangan pribadi dan rumah tangga modern yang berfokus pada **akurasi kas riil (*realized cash flow*)**, bebas "AI Slop", intuitif, dan responsif (Desktop & Mobile PWA).

---

## ✨ Fitur Utama

1. **Kas Riil & Anti-Keterlambatan Cair (*Realized-Only Fixed Income*):**
   - Pemasukan rutin (gaji) dan tagihan berkala tidak otomatis menambah/memotong saldo sebelum pengguna menekan konfirmasi terima/bayar.
2. **Hutang & Piutang (*Two-Way Tracking*):**
   - Catatan hutang sendiri & piutang orang lain dengan tracking cicilan, jatuh tempo, dan pengingat alert visual.
3. **Tabungan (Pos/Amplop Virtual) & Portofolio Investasi:**
   - Tracking pos alokasi tabungan (dana darurat, liburan, qurban) dan portofolio investasi dengan pemantauan untung/rugi (*gain/loss*).
4. **Wishlist & Simulasi Pembelian:**
   - Pencatatan target barang/keinginan beserta indikator prioritas (*Need* vs *Want*) dan estimasi waktu ketercapaian berdasarkan arus kas.
5. **Indikator "Aman Dibelanjakan" (*Safe-to-Spend Balance*):**
   - Menghitung sisa kas bebas setelah dikurangi kewajiban hutang bulan ini, tagihan pending, dan alokasi tabungan.
6. **Multi-Anggota Keluarga:**
   - Penanda pencatat transaksi untuk penggunaan bersama keluarga.
7. **PWA & Offline Capable:**
   - Dapat di-install di layar utama HP / Desktop.
8. **Ekspor Mandiri & Keamanan:**
   - Unduh data ke format CSV (Excel) atau JSON kapan saja.
   - Dilengkapi proteksi autentikasi kata sandi terenkripsi HMAC (opsional untuk VPS).

---

## 🚀 Menjalankan Secara Lokal (Development)

Prasyarat: Node.js 22+ (mendukung built-in `node:sqlite`).

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser. Data tersimpan di folder `data/uangku.db`.

---

## 🚢 Panduan Deploy ke VPS

Silakan lihat petunjuk lengkap di [DEPLOY.md](./DEPLOY.md) untuk deploy menggunakan Docker Compose atau secara native dengan reverse proxy HTTPS (Caddy/Nginx).

Ringkasan cepat:
```bash
# 1. Clone repository
git clone https://github.com/enjangjahrudin/uangku.git
cd uangku

# 2. Salin env dan set password
cp .env.example .env
# Edit .env dan atur APP_PASSWORD & AUTH_SECRET

# 3. Jalankan via Docker
docker compose up -d --build
```
