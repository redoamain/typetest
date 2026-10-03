# ⌨️ SpeedType — Typing Test App with Admin Panel & Competition

Aplikasi tes kecepatan mengetik berbasis web modern dengan **SvelteKit (Svelte 5 Runes)**, **TypeScript**, **Tailwind CSS**, **SQLite (`better-sqlite3`)**, dan **Drizzle ORM**.

Aplikasi ini dilengkapi dengan pencatatan nama guest tanpa login, papan peringkat (leaderboard) real-time, **Admin Panel lengkap** untuk mengelola kata dan kalimat, serta **Arena Kompetisi Turnamen** dengan teks seragam dan podium juara.

---

## 🚀 Fitur Utama

### 1. Tes Mengetik Interaktif (Typing Test)
- **Pengukuran Akurat**: Mengukur **WPM** (Words Per Minute), **Akurasi (%)**, karakter benar, dan kesalahan secara live.
- **Dukungan Dua Mode**:
  - **Mode Kata (Words)**: Mengambil kata-kata umum secara acak dengan durasi pilihan: **15s**, **30s**, atau **60s**.
  - **Mode Kalimat / Kutipan (Sentences / Quotes)**: Mengetik kutipan tokoh inspiratif (B.J. Habibie, Ir. Soekarno, Nelson Mandela, Steve Jobs, dll.) sampai tuntas.
- **Pilihan Bahasa**: Mendukung **Bahasa Indonesia (ID)** dan **English (EN)**.
- **Visual Feedback & Animasi**:
  - Karakter benar: Hijau emerald terang
  - Karakter salah: Merah rose dengan highlight
  - Kursor pengetikan aktif dengan animasi berkedip halus
  - Auto-scroll otomatis menjaga kursor tetap di tengah tampilan
- **Dukungan Pintasan Keyboard**: Tekan <kbd>Tab</kbd> atau <kbd>Esc</kbd> untuk langsung mengulang tes (quick restart).
- **Layar Hasil & Perayaan**: Tampilan statistik lengkap (WPM, Akurasi, Net WPM, Karakter Benar/Salah) disertai efek kembang api konfeti (`canvas-confetti`).
- **Pencatatan Tanpa Login**: Pengguna cukup mengisi nama pertama kali, tersimpan di database SQLite dan browser `localStorage`. Nama dapat diubah kapan saja.

### 2. Fitur Kompetisi & Turnamen (Competition Arena)
- **Teks Seragam & Adil**: Setiap peserta dalam satu kompetisi mengetik teks materi yang persis sama dalam durasi waktu yang sama.
- **Podium Juara (Top 3)**:
  - 🥇 Juara 1 (Gold Podium)
  - 🥈 Juara 2 (Silver Podium)
  - 🥉 Juara 3 (Bronze Podium)
- **Papan Peringkat Kompetisi Live**: Menampilkan ranking peserta secara otomatis terurut berdasarkan WPM tertinggi dan akurasi terbaik.
- **Manajemen Kompetisi**: Status kompetisi aktif atau selesai/ditutup.

### 3. Panel Admin (Admin Panel — `/admin`)
- **Proteksi Akses**: Menggunakan password admin (default: `admin123`, dapat diatur via `.env`).
- **Kelola Kata (Words Management)**:
  - Melihat daftar kata per bahasa (Indonesia / Inggris)
  - Tambah satu kata baru
  - **Import Massal (Batch Add)**: Tambahkan puluhan hingga ratusan kata sekaligus dengan memisahkan spasi/koma/baris baru
  - Pencarian dan filter kata
  - Hapus kata
  - Tombol **Reset Kata ke Kamus Bawaan**
- **Kelola Kalimat & Kutipan (Sentences Management)**:
  - Tambah kalimat / kutipan baru dengan kolom Penulis, Bahasa, dan Tingkat Kesulitan (Easy, Medium, Hard)
  - Edit kalimat yang sudah ada
  - Hapus kalimat
- **Kelola Pengguna (Users Management)**:
  - Melihat semua pengguna terdaftar, jumlah tes yang sudah dilakukan, dan WPM terbaik
  - Menghapus pengguna dan riwayat tesnya (membersihkan nama spam/tidak pantas)
- **Kelola Kompetisi (Competitions Management)**:
  - Membuat event kompetisi baru (Judul, Teks Khusus, Durasi, Deskripsi)
  - Mengubah status kompetisi (Aktif / Tutup)
  - Menghapus kompetisi

---

## 🛠️ Tech Stack

| Kebutuhan | Pilihan |
|---|---|
| **Framework** | SvelteKit 3 (Svelte 5 Runes) |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | SQLite via `better-sqlite3` |
| **ORM** | Drizzle ORM + `drizzle-kit` |
| **Testing** | Vitest |
| **Deploy** | Node.js adapter (`@sveltejs/adapter-node`) |
| **Efek Visual** | `canvas-confetti` |

---

## 💻 Cara Menjalankan

### 1. Instalasi Dependensi
```bash
pnpm install
# atau npm install
```

### 2. Menjalankan Mode Development
```bash
pnpm run dev
```
Buka browser di `http://localhost:5173`.

### 3. Menjalankan Unit Test
```bash
pnpm test
```

### 4. Memeriksa Tipe Data (Typecheck)
```bash
pnpm run check
```

### 5. Build Produksi & Menjalankan
```bash
pnpm run build
node --env-file=.env build/index.js
```

---

## 🔐 Kredensial Default Admin
- **URL Admin**: `http://localhost:5173/admin`
- **Default Password**: `admin123`
*(Dapat diubah pada file `.env` di variabel `ADMIN_SECRET`)*

---

## 📁 Struktur Direktori

```
typing-test/
├── drizzle/                     # Folder migrasi Drizzle
├── drizzle.config.ts            # Konfigurasi Drizzle Kit
├── local.db                     # Database SQLite lokal
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── TypingArea.svelte    # Area pengetikan real-time
│   │   │   ├── Result.svelte        # Layar hasil dan skor
│   │   │   ├── NameForm.svelte      # Form nama pengguna (guest)
│   │   │   ├── ModeSelector.svelte  # Pemilih mode, bahasa, durasi
│   │   │   ├── Leaderboard.svelte   # Papan skor global
│   │   │   └── UserList.svelte      # Daftar pengguna aktif
│   │   ├── data/
│   │   │   ├── words-id.json        # Kamus kata Indonesia
│   │   │   ├── words-en.json        # Kamus kata Inggris
│   │   │   └── sentences.json       # Koleksi kutipan & kalimat
│   │   ├── engine/
│   │   │   ├── metrics.ts           # Rumus WPM, Akurasi, Net WPM
│   │   │   └── words.ts             # Generator kata & pemilih kalimat
│   │   ├── server/
│   │   │   └── db/
│   │   │       ├── index.ts         # Koneksi better-sqlite3 + Drizzle
│   │   │       ├── schema.ts        # Skema tabel SQLite
│   │   │       ├── init.ts          # Auto seed data awal ke SQLite
│   │   │       └── queries.ts       # Kueri database
│   │   ├── stores/
│   │   │   ├── session.svelte.ts    # Store nama pengetik aktif
│   │   │   └── history.svelte.ts    # Store riwayat lokal
│   │   └── types.ts                 # TypeScript interfaces & types
│   ├── routes/
│   │   ├── admin/                   # Halaman panel admin
│   │   ├── competitions/            # Halaman daftar kompetisi
│   │   │   └── [slug]/              # Arena kompetisi & leaderboard podium
│   │   ├── api/
│   │   │   ├── admin/               # API auth, user management, reset kata
│   │   │   ├── competitions/        # API kompetisi & submit entry
│   │   │   ├── results/             # API simpan hasil tes
│   │   │   ├── sentences/           # API CRUD kalimat/quotes
│   │   │   └── words/               # API CRUD kata/dictionary
│   │   ├── +layout.svelte           # Navbar & session manager
│   │   └── +page.svelte             # Halaman utama tes mengetik
├── tests/
│   └── metrics.test.ts              # Unit test Vitest untuk engine
└── package.json
```
