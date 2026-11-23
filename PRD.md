# Product Requirements Document (PRD): UangKu
**Aplikasi Pencatatan Keuangan Pribadi & Keluarga Modern**

---

## 1. Ringkasan Eksekutif & Filosofi Desain

### 1.1 Visi Produk
**UangKu** adalah aplikasi pencatatan keuangan pribadi dan rumah tangga yang berfokus pada **akurasi kas riil (realized cash flow)**, kemudahan pencatatan harian, serta transparansi liabilitas (hutang) dan tujuan finansial (tabungan & wishlist).

### 1.2 Filosofi Desain: *"Anti-AI Slop", Fungsional & Elegan*
*Banyak aplikasi finansial modern terjebak dalam "AI Slop" — tampilan yang dipenuhi grafis 3D mengambang, gradien neon berlebihan, kartu metrik yang membingungkan, dan grafik warna-warni tanpa fungsi praktis.*

**Prinsip Desain UangKu:**
1. **Kejelasan di Atas Ornamen (Data-First):** Angka, arus kas, dan tanggal jatuh tempo adalah prioritas utama. Menggunakan tipografi clean (*Inter* atau *Geist*), kontras tinggi, dan tata letak terstruktur.
2. **Kecepatan Input (Quick Capture):** Rata-rata transaksi harian harus bisa dicatat dalam kurang dari 5 detik di perangkat mobile.
3. **Realisme Kas (No False Balance):** Uang belum dianggap saldo jika belum benar-benar ada di rekening/dompet.
4. **Responsif Nyata:** Tampilan mobile terasa seperti aplikasi native (bottom sheet, jempol-sentris), sementara tampilan desktop memanfaatkan lebar layar secara optimal (tabel data dense, shortcut keyboard, navigasi samping).

---

## 2. Persona & Pengguna Target

1. **Individu / Pekerja Mandiri & Karyawan:** Membutuhkan pemisahan antara gaji tetap (yang tanggal cairnya bisa bergeser) dan pemasukan lepas/freelance, serta pengelolaan tabungan darurat & wishlist barang idaman.
2. **Pasangan / Keluarga:** Membutuhkan transparansi pengeluaran bersama (belanja dapur, tagihan listrik, cicilan rumah/kendaraan, uang sekolah anak) tanpa kehilangan privasi dompet pribadi jika diinginkan.

---

## 3. Modul & Spesifikasi Fitur Utama

### 3.1 Manajemen Akun & Dompet (Multi-Account / Wallets)
- **Kategori Akun:** 
  - Kas / Tunai
  - Rekening Bank (BCA, Mandiri, BRI, dll.)
  - E-Wallet (GoPay, OVO, Dana, ShopeePay)
  - Rekening Tabungan Khusus / Deposito
  - Akun Investasi (Reksadana, Saham, Emas, Kripto)
- **Fitur:**
  - Transfer antar dompet (misal: Tarik tunai dari Bank ke Kas Tunai, atau Top-Up E-Wallet).
  - Mode sembunyikan saldo (*Privacy Masking*) untuk penggunaan di ruang publik.

---

### 3.2 Transaksi Masuk & Keluar (Income & Expense)

#### A. Pengeluaran (Expense)
- Kategori bertingkat (Parent Kategori $\rightarrow$ Sub-kategori, contoh: `Makan & Minum` $\rightarrow$ `Kopi`, `Groceries`).
- Input nominal, tanggal & jam, dompet sumber, catatan, tag opsional (misal: `#liburan`, `#proyek-A`), dan lampiran struk/foto.

#### B. Pemasukan Tetap vs Tidak Tetap (Income Handling Khusus)
- **Pemasukan Tidak Tetap (Variable):** Bonus, freelance, komisi, hadiah — langsung dicatat saat diterima dan langsung menambah saldo dompet terpilih.
- **Pemasukan Tetap (Fixed Income - "Realized-Only Confirmation"):**
  - Pengguna membuat jadwal pemasukan tetap (contoh: "Gaji Kantor", nominal estimasi Rp10.000.000, ekspektasi cair tiap tanggal 25).
  - **Mekanisme Anti-Keterlambatan Cair:** 
    - Sistem **TIDAK** menambahkan saldo secara otomatis pada tanggal 25.
    - Sistem memunculkan kartu status: **"Menunggu Konfirmasi Cair"** pada dashboard.
    - Ketika gaji sudah masuk notifikasi bank, pengguna menekan tombol **"Tandai Sudah Diterima"**.
    - Pengguna dapat menyesuaikan nominal riil (jika ada potongan BPJS, PPh21, atau bonus lembur) serta memilih dompet tujuan.
    - Saldo kas baru bertambah setelah status menjadi **Diterima**.

---

### 3.3 Pencatatan & Pengingat Hutang-Piutang (Debt & Loan Management)

- **Dua Arah:**
  - **Hutang Saya (Payable):** Pinjaman bank, KPR, kartu kredit, pinjaman ke rekan/keluarga.
  - **Piutang (Receivable):** Uang yang dipinjam oleh orang lain.
- **Data per Entitas:**
  - Pihak terkait (Nama kontak/bank).
  - Total pokok hutang.
  - Sisa hutang berjalan (*running balance*).
  - Tanggal jatuh tempo per cicilan / tanggal tenggat lunas.
  - Suku bunga (opsional, jika pinjaman berbunga).
- **Histori Pembayaran Cicilan:**
  - Setiap pembayaran dicatat sebagai transaksi keluar yang otomatis memotong sisa hutang dan mengurangi saldo dompet pembayar.
- **Sistem Pengingat (Smart Reminder):**
  - Status visual: Hijau (Lancar), Kuning (Jatuh tempo $\le$ 7 hari), Merah (Lewat jatuh tempo).
  - Ringkasan di Dashboard: *"Total kewajiban jatuh tempo bulan ini: RpX.XXX.XXX"*.

---

### 3.4 Tabungan & Portofolio Investasi

- **Alokasi Tabungan Berbasis Pos (Virtual Buckets / Envelopes):**
  - Pos: Dana Darurat, Tabungan Liburan, Qurban, Pendidikan, dll.
  - Progress bar berbasis persentase (Target Rp20.000.000, terkumpul Rp12.000.000 = 60%).
- **Portofolio Investasi:**
  - Pencatatan nilai modal masuk (Cost Basis).
  - Input berkala nilai pasar saat ini (*Current Valuation*) untuk menghitung keuntungan/kerugian (Unrealized Gain/Loss) secara manual tanpa perlu integrasi API sekuritas yang rumit dan rentan putus.

---

### 3.5 Wishlist & Simulasi Pembelian (Goal Purchase)

- **Komponen Wishlist:**
  - Nama barang/tujuan (misal: "Laptop Kerja Baru").
  - Estimasi harga.
  - Tingkat urgensi: *Kebutuhan (Need)* vs *Keinginan (Want)*.
  - Link referensi pembelian / foto barang.
- **Indikator Kesiapan Beli (Readiness Metric):**
  - Pengguna dapat mengaitkan pos tabungan tertentu ke item wishlist.
  - Indikator: *"Berdasarkan sisa kas dingin (safe-to-spend) bulan ini, barang ini dapat dibeli dalam X bulan"*.

---

### 3.6 Mode Keluarga / Bersama (Family & Shared Ledger)

- **Ruang Lingkup:**
  - Bisa digunakan dalam mode **Pribadi (Single User)** atau **Keluarga (Multi-User Shared)**.
- **Pemisahan Transaksi:**
  - Label pencatat (*Created by: Ayah / Ibu*).
  - Opsi dompet bersama (misal: "Rekening Bersama Operasional") vs dompet pribadi.

---

## 4. Rekomendasi Fitur Tambahan (High-Value Features)

Berikut adalah usulan fitur tambahan yang sangat relevan untuk memperkuat aplikasi:

1. **Metrik "Uang Dingin" / *Safe-to-Spend Balance* (Sangat Direkomendasikan):**
   - Bukan sekadar menampilkan total saldo, tetapi menampilkan:
     $$\text{Safe to Spend} = \text{Total Saldo Kas Aktif} - (\text{Kewajiban Hutang Jatuh Tempo Bulan Ini} + \text{Alokasi Tabungan Wajib})$$
   - Mencegah pengguna merasa memiliki banyak uang padahal sebagian uang tersebut sudah "bertuan".
2. **Template Transaksi Berulang (Recurring Bills):**
   - Tagihan listrik, internet, air, Netflix/Spotify. Sama seperti sistem gaji, tagihan dapat berstatus *Pending Approval* sebelum dipotong dari kas.
3. **Pencarian Cepat & Filter Multidimensi:**
   - Filter cepat berdasarkan: Rentang Tanggal, Dompet, Kategori, Status (Lunas/Pending), dan Kata Kunci.
4. **Export & Backup Mandiri:**
   - Kemampuan export data ke Excel (.xlsx), CSV, dan JSON kapan saja. Data adalah milik pengguna sepenuhnya.
5. **Mode Cepat Keyboard di Desktop:**
   - Shortcut keyboard (`N` untuk transaksi baru, `/` untuk pencarian, `ESC` untuk tutup modal).

---

## 5. Kebutuhan Non-Fungsional & UI/UX

### 5.1 Tata Letak & Respon Perangkat
| Perangkat | Tata Letak Utama | Interaksi Unggulan |
| :--- | :--- | :--- |
| **Mobile (PWA / Responsive)** | Navigasi bawah (*Bottom Navigation*), Floating Action Button (FAB) besar di tengah, Form input via *Bottom Sheet*. | Tombol angka besar (*numeric keypad friendly*), gestur geser (*swipe to edit/delete*). |
| **Desktop / Laptop** | Sidebar kiri kolapsibel, ringkasan metrik horizontal di atas, tabel transaksi *dense* dengan paginasi/infinite scroll, split view. | Shortcut keyboard, multi-select baris transaksi, visualisasi grafik lebar. |

### 5.2 Estetika UI (Bebas "AI Slop")
- **Warna Pokok:** Netral monokrom (Zinc / Slate / Slate-900) dengan aksen warna semantik fungsional:
  - Hijau Zamrud (`#10B981`): Uang masuk & surplus
  - Merah Mawar (`#F43F5E`): Pengeluaran & hutang lewat tempo
  - Biru Lembut (`#3B82F6`): Tabungan & transfer
  - Kuning/Amber (`#F59E0B`): Pengingat & konfirmasi tertunda
- **Grafik:** Hanya grafik batang (*bar chart*) bulanan dan garis tren kas (*cashflow trend line*). Menghindari diagram 3D atau grafik lingkaran pie dengan 15 irisan yang tidak terbaca.

---

## 6. Arsitektur Teknis yang Direkomendasikan

- **Frontend:** Next.js (App Router) + Tailwind CSS + Shadcn UI (komponen bersih, modular, accessible, dan tidak bloated).
- **Backend / Database:** 
  - Opsi A (Full-Stack Ringan): Next.js Server Actions + SQLite (Prisma/Drizzle ORM) untuk deployment mandiri yang sangat cepat.
  - Opsi B (Multi-device Realtime): Supabase (PostgreSQL + Auth + Row Level Security untuk pemisahan data keluarga).
- **Offline Capability:** PWA (Progressive Web App) dengan caching lokal agar tetap bisa mencatat saat koneksi internet lambat di kasir toko.

---

## 7. Roadmap Rilis (Phasing)

- **Fase 1 (MVP - Inti Transaksi):**
  - Multi-wallet, input transaksi kasir, kategori kustom, sistem pemasukan tetap berbasis konfirmasi cair.
- **Fase 2 (Liabilitas & Tujuan Finansial):**
  - Modul Hutang & Piutang dengan alert jatuh tempo, pos Tabungan & Wishlist.
- **Fase 3 (Kolaborasi & Insight Lanjutan):**
  - Mode Keluarga (Multi-user per buku kas), Safe-to-Spend metric, Export Excel/PDF.
