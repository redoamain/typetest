#!/bin/bash
set -e

echo "=========================================="
echo "  Deploy Citilumb Typing Test (Port 4324) "
echo "=========================================="

# Direktori proyek
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Buat .env jika belum ada
if [ ! -f .env ]; then
    echo "Membuat file .env dari .env.example..."
    cp .env.example .env
fi

# 1. Install dependencies
echo "[1/3] Menginstal dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile || pnpm install
else
    npm install
fi

# 2. Build SvelteKit
echo "[2/3] Membangun aplikasi produksi (SvelteKit build)..."
if command -v pnpm &> /dev/null; then
    pnpm run build
else
    npm run build
fi

# 3. Jalankan / Reload PM2
echo "[3/3] Menjalankan / merestart via PM2 di port 4324..."
if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
    pm2 save
    echo "=========================================="
    echo " Berhasil dideploy!                       "
    echo " URL Lokal: http://127.0.0.1:4324         "
    echo " Cek status: pm2 status                   "
    echo " Cek log   : pm2 logs typetest            "
    echo "=========================================="
else
    echo "=========================================="
    echo " Build selesai!                           "
    echo " Catatan: PM2 CLI tidak ada di PATH user ini."
    echo " Anda dapat menyalakan via menu aaPanel   "
    echo " Website -> Node project -> Add project   "
    echo " atau start manual: npm run start         "
    echo "=========================================="
fi
