# Panduan Deployment aaPanel (PM2 - Port 4324)

Dokumen ini memandu langkah demi langkah cara men-deploy aplikasi **Citilumb Typing Test** di server VPS yang menggunakan **aaPanel** dengan **PM2** pada port **`4324`**.

---

## 1. Persyaratan Server aaPanel

Pastikan di menu **App Store** aaPanel Anda sudah terinstal:
1. **Nginx** (Web Server / Reverse Proxy)
2. **PM2 Manager** atau **Node.js Version Manager** (Pilih versi Node.js **v20.x** atau **v22.x**)

---

## 2. File Konfigurasi yang Tersedia di Proyek

Proyek ini sudah dilengkapi file siap pakai untuk aaPanel & PM2:
- **`ecosystem.config.cjs`**: File konfigurasi resmi PM2 (menjalankan port 4324, mode fork 1 instance untuk stabilitas SQLite WAL, dan auto-restart).
- **`deploy.sh`**: Script otomatis untuk install dependensi, build produksi, dan restart PM2.
- **`package.json`**: Script `"start": "node --env-file=.env build/index.js"`.
- **`.env.example`**: Berisi variabel `PORT=4324`, `HOST=0.0.0.0`, `DATABASE_URL=local.db`, `ADMIN_SECRET=admin123`.

---

## 3. Langkah Deploy di aaPanel

### Opsi A: Menggunakan Menu "Node project" di aaPanel (Paling Mudah)

1. **Clone Proyek ke Server**
   Buka terminal di aaPanel atau SSH ke VPS Anda:
   ```bash
   cd /www/wwwroot
   git clone https://github.com/redoamain/typetest.git
   cd typetest
   cp .env.example .env
   ```

2. **Build Aplikasi**
   Jalankan perintah build satu kali:
   ```bash
   npm install
   npm run build
   ```

3. **Tambahkan Project di aaPanel**
   - Masuk ke dashboard aaPanel > **Website** > tab **Node project**.
   - Klik tombol **Add Node project**.
   - Masukkan informasi berikut:
     - **Project directory**: `/www/wwwroot/typetest`
     - **Project name**: `typetest`
     - **Run opt**: Pilih `start` (atau isi `build/index.js`)
     - **Node version**: Pilih Node.js v20+
     - **Port**: `4324`
     - **Run user**: `www` (atau user default Anda)
   - Klik **Submit**. Aplikasi akan langsung berjalan di background via PM2.

---

### Opsi B: Menggunakan Script Otomatis `deploy.sh` via Terminal

Jika Anda lebih suka menggunakan terminal:
```bash
cd /www/wwwroot
git clone https://github.com/redoamain/typetest.git
cd typetest

# Berikan izin eksekusi dan jalankan deploy
chmod +x deploy.sh
./deploy.sh
```

Perintah PM2 yang bisa Anda gunakan:
```bash
# Cek status aplikasi
pm2 status

# Melihat log aplikasi
pm2 logs typetest

# Merestart aplikasi
pm2 reload ecosystem.config.cjs

# Menghentikan aplikasi
pm2 stop typetest
```

---

## 4. Konfigurasi Reverse Proxy & Domain di aaPanel

Agar aplikasi dapat diakses lewat domain (misal `typing.domainanda.com`):

1. Di menu **Website** > **Add site** di aaPanel:
   - Buat domain baru (misal `typing.domainanda.com`), pilih tipe PHP: `Pure PHP` (karena kita akan gunakan reverse proxy).
2. Klik nama domain tersebut pada daftar website, lalu buka tab **Reverse Proxy**:
   - Klik **Add Reverse Proxy**.
   - **Proxy Name**: `typetest`
   - **Target URL**: `http://127.0.0.1:4324`
   - **Sent Domain**: `$host`
   - Aktifkan opsi **Cache**: Nonaktifkan.
   - Klik **Submit**.
3. Buka tab **SSL** di konfigurasi website yang sama:
   - Pilih **Let's Encrypt**, centang domain Anda, dan klik **Apply**.
   - Aktifkan **Force HTTPS**.

---

## 5. Konfigurasi Port Firewall

Jika Anda ingin mengakses langsung via IP server `http://IP-SERVER:4324`:
- Buka menu **Security** di aaPanel.
- Tambahkan Port **`4324`** pada daftar firewall (Status: **Accept**).
- Jika menggunakan VPS Cloud (seperti AWS, GCP, DigitalOcean, Alibaba Cloud), pastikan port `4324` juga diizinkan di Security Group provider Anda.

---

## 6. Update / Redeploy di Masa Depan

Setiap kali ada pembaruan di repository GitHub:
```bash
cd /www/wwwroot/typetest
git pull origin main
./deploy.sh
```
Aplikasi akan otomatis menginstal dependensi baru, melakukan build ulang, dan merestart PM2 tanpa *downtime*.
