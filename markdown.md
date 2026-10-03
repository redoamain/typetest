# Typing Test App — Svelte + TypeScript

Aplikasi tes kecepatan mengetik berbasis web. Mengukur **WPM** (words per minute), **akurasi**, dan **jumlah kesalahan** secara real-time.

---

## 1. Fitur

### MVP

- Teks acak untuk diketik (kata-kata umum)
- Pilihan durasi: 15 / 30 / 60 detik
- Highlight karakter benar (hijau), salah (merah), dan posisi kursor
- Statistik live: WPM, akurasi, waktu tersisa
- Layar hasil + tombol ulangi (restart)
- **Pencatatan pengguna tanpa login**: cukup isi nama sebelum mulai, lalu nama dan hasil tes tersimpan di database SQLite (Drizzle) dan tampil di daftar "pernah menggunakan"

### Tahap lanjut

- Mode kata (25 / 50 / 100 kata) dan mode kutipan (quotes)
- Riwayat hasil tersimpan di `localStorage`
- Grafik WPM per detik
- Tema gelap/terang
- Pilihan bahasa (Indonesia / Inggris)
- Leaderboard (butuh backend)

---

## 2. Tech Stack

| Kebutuhan         | Pilihan                                                                         |
| ----------------- | ------------------------------------------------------------------------------- |
| Framework         | **SvelteKit** (Svelte 5)                                                        |
| Bahasa            | **TypeScript**                                                                  |
| Build tool        | Vite (bawaan SvelteKit)                                                         |
| Styling           | Tailwind CSS (atau CSS biasa)                                                   |
| State             | Svelte 5 runes (`$state`, `$derived`)                                           |
| Database          | SQLite via `better-sqlite3`                                                     |
| ORM & migrasi     | Drizzle ORM + drizzle-kit                                                       |
| Testing           | Vitest + Testing Library                                                        |
| Lint/format       | ESLint + Prettier                                                               |
| Deploy            | VPS / Railway / Fly.io (`adapter-node`, butuh disk persisten untuk file SQLite) |
| Grafik (opsional) | Chart.js atau Layerchart                                                        |

---

## 3. Setup Proyek

```bash
npx sv create typing-test
# pilih: SvelteKit minimal, TypeScript, tambahkan: prettier, eslint, vitest, tailwindcss

cd typing-test
npm install
npm run dev
```

---

## 4. Struktur Folder

```
typing-test/
├── drizzle/                       # file migrasi (hasil drizzle-kit generate)
├── drizzle.config.ts
├── local.db                       # database SQLite (jangan di-commit)
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── TypingArea.svelte
│   │   │   ├── Stats.svelte
│   │   │   ├── Result.svelte
│   │   │   ├── NameForm.svelte    # input nama (tanpa login)
│   │   │   ├── UserList.svelte    # daftar pengguna yang pernah mencoba
│   │   │   └── ModeSelector.svelte
│   │   ├── engine/
│   │   │   ├── metrics.ts         # hitung WPM & akurasi
│   │   │   └── words.ts           # generator teks
│   │   ├── server/
│   │   │   └── db/
│   │   │       ├── index.ts       # koneksi SQLite + instance Drizzle
│   │   │       ├── schema.ts      # definisi tabel users & results
│   │   │       └── queries.ts     # simpan hasil, daftar pengguna
│   │   ├── stores/
│   │   │   ├── history.svelte.ts  # (opsional) cache riwayat lokal
│   │   │   └── session.svelte.ts  # nama aktif di browser
│   │   ├── data/
│   │   │   ├── words-en.json
│   │   │   └── words-id.json
│   │   └── types.ts
│   ├── routes/
│   │   ├── api/results/+server.ts # POST hasil tes
│   │   ├── +layout.svelte
│   │   ├── +page.server.ts        # load daftar pengguna
│   │   └── +page.svelte
│   └── app.css
├── tests/
│   └── metrics.test.ts
└── package.json
```

---

## 5. Tipe Data (`src/lib/types.ts`)

```ts
export type TestStatus = "idle" | "running" | "finished";

export interface TestConfig {
  duration: 15 | 30 | 60;
  language: "id" | "en";
}

export interface TestResult {
  name: string; // nama pengguna (tanpa login)
  wpm: number;
  accuracy: number; // 0–100
  correctChars: number;
  incorrectChars: number;
  duration: number; // detik
  date: string; // ISO string
}

export interface UserRecord {
  name: string;
  lastUsedAt: Date;
  testCount: number;
  bestWpm: number;
}
```

---

## 6. Logika Inti

### Rumus

- **WPM** = `(karakter benar / 5) / menit` (1 kata standar = 5 karakter)
- **Akurasi** = `karakter benar / total karakter diketik × 100`

### `src/lib/engine/metrics.ts`

```ts
export function calculateWpm(
  correctChars: number,
  elapsedSeconds: number,
): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(correctChars / 5 / minutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}
```

### `src/lib/engine/words.ts`

```ts
import en from "$lib/data/words-en.json";
import id from "$lib/data/words-id.json";

const dictionaries = { en, id } as const;

export function generateText(language: "en" | "id", count = 60): string {
  const list = dictionaries[language] as string[];
  return Array.from(
    { length: count },
    () => list[Math.floor(Math.random() * list.length)],
  ).join(" ");
}
```

---

## 7. Komponen Utama (Svelte 5 + runes)

### `src/lib/components/TypingArea.svelte`

```svelte
<script lang="ts">
  import { calculateWpm, calculateAccuracy } from '$lib/engine/metrics';
  import { generateText } from '$lib/engine/words';
  import type { TestStatus, TestResult } from '$lib/types';

  interface Props {
    duration: number;
    language: 'id' | 'en';
    onfinish: (result: Omit<TestResult, 'name'>) => void;
  }

  let { duration, language, onfinish }: Props = $props();

  let text = $state(generateText(language));
  let typed = $state('');
  let status = $state<TestStatus>('idle');
  let timeLeft = $state(duration);
  let timer: ReturnType<typeof setInterval>;

  let correctChars = $derived(
    [...typed].filter((ch, i) => ch === text[i]).length
  );
  let wpm = $derived(calculateWpm(correctChars, duration - timeLeft));
  let accuracy = $derived(calculateAccuracy(correctChars, typed.length));

  function start() {
    status = 'running';
    timer = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) finish();
    }, 1000);
  }

  function finish() {
    clearInterval(timer);
    status = 'finished';
    onfinish({
      wpm,
      accuracy,
      correctChars,
      incorrectChars: typed.length - correctChars,
      duration,
      date: new Date().toISOString()
    });
  }

  function handleInput(e: Event) {
    if (status === 'finished') return;
    if (status === 'idle') start();
    typed = (e.target as HTMLInputElement).value;
    if (typed.length >= text.length) finish();
  }

  function charClass(i: number): string {
    if (i >= typed.length) return i === typed.length ? 'cursor' : 'pending';
    return typed[i] === text[i] ? 'correct' : 'wrong';
  }
</script>

<div class="stats">
  <span>{timeLeft}s</span>
  <span>{wpm} WPM</span>
  <span>{accuracy}%</span>
</div>

<div class="text">
  {#each text as char, i}
    <span class={charClass(i)}>{char}</span>
  {/each}
</div>

<input
  class="sr-only"
  value={typed}
  oninput={handleInput}
  autofocus
  autocomplete="off"
  spellcheck="false"
/>

<style>
  .text { font-family: ui-monospace, monospace; font-size: 1.5rem; line-height: 2.2rem; }
  .pending { opacity: 0.4; }
  .correct { color: #22c55e; }
  .wrong { color: #ef4444; background: #ef444422; }
  .cursor { border-left: 2px solid currentColor; }
  .sr-only { position: absolute; opacity: 0; pointer-events: none; }
</style>
```

### `src/routes/+page.svelte`

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import TypingArea from '$lib/components/TypingArea.svelte';
  import NameForm from '$lib/components/NameForm.svelte';
  import UserList from '$lib/components/UserList.svelte';
  import { session, loadSession } from '$lib/stores/session.svelte';
  import type { TestResult } from '$lib/types';

  let { data } = $props(); // data.users berasal dari +page.server.ts

  let result = $state<TestResult | null>(null);
  let round = $state(0); // ubah untuk me-reset komponen

  onMount(loadSession);

  async function handleFinish(r: Omit<TestResult, 'name'>) {
    const full: TestResult = { ...r, name: session.name };
    result = full;

    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...full, language: 'id' })
      });
      await invalidateAll(); // muat ulang daftar pengguna
    } catch (err) {
      console.error('Gagal menyimpan hasil', err);
    }
  }

  function restart() {
    result = null;
    round += 1;
  }
</script>

<main>
  <h1>Typing Test</h1>

  {#if !session.ready}
    <!-- menunggu localStorage dibaca -->
  {:else if !session.name}
    <NameForm />
  {:else if result}
    <h2>{result.name}: {result.wpm} WPM</h2>
    <p>Akurasi {result.accuracy}%</p>
    <button onclick={restart}>Ulangi</button>
  {:else}
    <p>Halo, {session.name}!</p>
    {#key round}
      <TypingArea duration={30} language="id" onfinish={handleFinish} />
    {/key}
  {/if}

  <UserList users={data.users} />
</main>
```

---

## 8. Menyimpan Riwayat Lokal (`history.svelte.ts`)

> Opsional. Jika memakai database (bagian 9), riwayat lengkap sudah tersimpan di tabel `results`. Bagian ini hanya berguna sebagai cache lokal di browser.

```ts
import type { TestResult } from "$lib/types";

const KEY = "typing-history";

function load(): TestResult[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export const history = $state<{ items: TestResult[] }>({ items: load() });

export function addResult(r: TestResult) {
  history.items = [r, ...history.items].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(history.items));
}
```

---

## 9. Database: SQLite + Drizzle ORM

Data pengguna dan hasil tes disimpan di **SQLite** lewat **Drizzle ORM**, sehingga satu daftar nama dipakai bersama oleh semua perangkat yang mengakses server yang sama. Tidak ada login: pengguna cukup mengisi **nama**.

### Alur

1. Pertama kali buka, tampil form nama. Nama aktif disimpan di `localStorage` browser hanya agar tidak ditanya lagi.
2. Tes selesai → browser mengirim hasil ke `POST /api/results`.
3. Server membuat pengguna jika namanya belum ada (nama dibandingkan tanpa peduli huruf besar/kecil), lalu menyimpan hasil tes dalam satu transaksi.
4. `+page.server.ts` membaca daftar pengguna dari database, ditampilkan oleh `UserList`.

### 9.1 Instalasi

```bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

Tambahkan di `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

`.env`:

```
DATABASE_URL=local.db
```

`.gitignore` (tambahkan):

```
local.db
local.db-*
```

### 9.2 `drizzle.config.ts`

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: process.env.DATABASE_URL ?? "local.db" },
});
```

### 9.3 Skema: `src/lib/server/db/schema.ts`

```ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // nama tampilan, mis. "Budi"
  nameKey: text("name_key").notNull().unique(), // huruf kecil, "budi", pembeda unik
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const results = sqliteTable(
  "results",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wpm: integer("wpm").notNull(),
    accuracy: integer("accuracy").notNull(),
    correctChars: integer("correct_chars").notNull(),
    incorrectChars: integer("incorrect_chars").notNull(),
    duration: integer("duration").notNull(), // detik
    language: text("language").notNull(), // 'id' | 'en'
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("results_user_idx").on(t.userId)],
);

export type User = typeof users.$inferSelect;
export type Result = typeof results.$inferSelect;
```

Buat dan jalankan migrasi:

```bash
npm run db:generate   # membuat file SQL di folder drizzle/
npm run db:migrate    # menerapkan ke local.db
npm run db:studio     # (opsional) lihat isi database lewat browser
```

### 9.4 Koneksi: `src/lib/server/db/index.ts`

```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

const sqlite = new Database(env.DATABASE_URL ?? "local.db");
sqlite.pragma("journal_mode = WAL"); // lebih baik untuk banyak pembaca
sqlite.pragma("foreign_keys = ON"); // wajib agar onDelete cascade berjalan

export const db = drizzle(sqlite, { schema });
```

> Folder `src/lib/server/` hanya bisa diimpor dari kode server, jadi koneksi database tidak akan bocor ke browser.

### 9.5 Query: `src/lib/server/db/queries.ts`

```ts
import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { results, users } from "./schema";

export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 30);
}

interface SaveResultInput {
  name: string;
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  duration: number;
  language: "id" | "en";
}

/** Buat pengguna bila belum ada, lalu simpan hasil tes (satu transaksi). */
export function saveResult(input: SaveResultInput) {
  const name = normalizeName(input.name);
  if (!name) throw new Error("Nama wajib diisi");

  return db.transaction((tx) => {
    const user = tx
      .insert(users)
      .values({ name, nameKey: name.toLowerCase() })
      .onConflictDoUpdate({
        target: users.nameKey,
        set: { lastUsedAt: sql`(unixepoch())` },
      })
      .returning()
      .get();

    tx.insert(results)
      .values({
        userId: user.id,
        wpm: input.wpm,
        accuracy: input.accuracy,
        correctChars: input.correctChars,
        incorrectChars: input.incorrectChars,
        duration: input.duration,
        language: input.language,
      })
      .run();

    return user;
  });
}

/** Daftar semua pengguna beserta jumlah tes dan WPM terbaik. */
export function listUsers() {
  return db
    .select({
      name: users.name,
      lastUsedAt: users.lastUsedAt,
      testCount: sql<number>`count(${results.id})`,
      bestWpm: sql<number>`coalesce(max(${results.wpm}), 0)`,
    })
    .from(users)
    .leftJoin(results, eq(results.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.lastUsedAt))
    .all();
}

/** Hapus pengguna beserta seluruh hasilnya (cascade). */
export function deleteUser(name: string) {
  const key = normalizeName(name).toLowerCase();
  return db.delete(users).where(eq(users.nameKey, key)).run().changes;
}
```

### 9.6 Endpoint dan load data

`src/routes/api/results/+server.ts`

```ts
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { saveResult } from "$lib/server/db/queries";

const int = (v: unknown, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string") error(400, "Data tidak valid");

  try {
    saveResult({
      name: body.name,
      wpm: int(body.wpm, 0, 400),
      accuracy: int(body.accuracy, 0, 100),
      correctChars: int(body.correctChars, 0, 20000),
      incorrectChars: int(body.incorrectChars, 0, 20000),
      duration: int(body.duration, 1, 600),
      language: body.language === "en" ? "en" : "id",
    });
  } catch {
    error(400, "Nama wajib diisi");
  }

  return json({ ok: true });
};
```

`src/routes/+page.server.ts`

```ts
import { listUsers } from "$lib/server/db/queries";

export const load = () => ({ users: listUsers() });
```

### 9.7 Sisi client

`src/lib/stores/session.svelte.ts` (hanya mengingat nama aktif di browser):

```ts
const KEY = "typing-current-user";

export const session = $state({ name: "", ready: false });

export function loadSession() {
  session.name = localStorage.getItem(KEY) ?? "";
  session.ready = true;
}

export function setName(raw: string): boolean {
  const name = raw.trim().replace(/\s+/g, " ").slice(0, 30);
  if (!name) return false;
  session.name = name;
  localStorage.setItem(KEY, name);
  return true;
}

export function clearName() {
  session.name = "";
  localStorage.removeItem(KEY);
}
```

`src/lib/components/NameForm.svelte`

```svelte
<script lang="ts">
  import { setName } from '$lib/stores/session.svelte';

  let name = $state('');
  let error = $state('');

  function submit(e: SubmitEvent) {
    e.preventDefault();
    error = setName(name) ? '' : 'Nama tidak boleh kosong';
  }
</script>

<form onsubmit={submit}>
  <label for="name">Siapa namamu?</label>
  <input id="name" bind:value={name} maxlength="30" placeholder="Masukkan nama" />
  <button type="submit">Mulai</button>
  {#if error}<p class="error">{error}</p>{/if}
</form>
```

`src/lib/components/UserList.svelte`

```svelte
<script lang="ts">
  import type { UserRecord } from '$lib/types';
  import { session, clearName } from '$lib/stores/session.svelte';

  let { users }: { users: UserRecord[] } = $props();
</script>

<section>
  <h3>Pernah menggunakan ({users.length})</h3>
  <ul>
    {#each users as u (u.name)}
      <li>{u.name}: {u.testCount}x tes, terbaik {u.bestWpm} WPM</li>
    {:else}
      <li>Belum ada pengguna.</li>
    {/each}
  </ul>

  {#if session.name}
    <button onclick={clearName}>Ganti nama</button>
  {/if}
</section>
```

### 9.8 Catatan penting

- **Hosting**: SQLite adalah file di disk. Platform serverless seperti Vercel, Netlify, dan Cloudflare Pages tidak punya disk yang bertahan, jadi `better-sqlite3` tidak cocok di sana. Gunakan `@sveltejs/adapter-node` di VPS, Railway, atau Fly.io dengan volume persisten. Jika tetap ingin serverless, pindah ke **Turso (libSQL)**: skema Drizzle hampir sama, cukup ganti driver ke `drizzle-orm/libsql`.
- **Backup**: salin file `local.db` secara berkala (atau gunakan `sqlite3 local.db ".backup backup.db"`).
- **Nama bisa dipalsukan**: tanpa login, siapa pun bisa memakai nama orang lain. Wajar untuk kasus ini, tapi jangan dipakai untuk hal yang butuh keamanan.
- **Nama bentrok**: dua orang bernama sama akan tergabung. Jika perlu, tambahkan kolom opsional seperti kelas atau kota.
- **Validasi & spam**: server sudah membatasi panjang nama dan rentang angka. Pertimbangkan rate limit per IP agar tidak dibanjiri entri palsu.
- **Privasi**: nama adalah data pribadi. Sediakan cara menghapus nama (`deleteUser`), misalnya lewat halaman admin sederhana.

---

## 10. Contoh Unit Test (`tests/metrics.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { calculateWpm, calculateAccuracy } from "../src/lib/engine/metrics";

describe("metrics", () => {
  it("menghitung WPM", () => {
    expect(calculateWpm(150, 60)).toBe(30);
  });
  it("akurasi 100% jika belum mengetik", () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });
  it("menghitung akurasi", () => {
    expect(calculateAccuracy(45, 50)).toBe(90);
  });
});
```

---

## 11. Roadmap Pengerjaan

1. **Setup** — buat proyek SvelteKit + TypeScript
2. **Engine** — `metrics.ts`, `words.ts`, beserta unit test
3. **UI dasar** — `TypingArea`, statistik, layar hasil
4. **Pilihan mode** — durasi dan bahasa
5. **Riwayat** — simpan di `localStorage`
6. **Database** — SQLite + Drizzle (skema, migrasi, query), endpoint simpan hasil, `NameForm` dan `UserList` (nama saja, tanpa login)
7. **Polishing** — tema, animasi kursor, responsif, aksesibilitas
8. **Deploy** — `adapter-node` di VPS / Railway / Fly.io dengan disk persisten (atau pindah ke Turso untuk serverless)
9. **Opsional** — leaderboard, grafik riwayat per pengguna, dan halaman admin untuk menghapus nama

---

## 12. Catatan & Pitfall

- Gunakan `<input>` tersembunyi untuk menangkap ketikan agar keyboard mobile ikut bekerja.
- Hitung WPM dari waktu yang benar-benar berjalan, bukan dari durasi penuh, supaya hasil live tidak menyesatkan.
- Hindari re-render berat: render per-karakter cukup untuk ±100 kata, tapi pertimbangkan per-kata jika teks lebih panjang.
- Akses `localStorage` hanya di browser (cek `typeof localStorage`) karena SvelteKit melakukan SSR.
- Tangani tombol `Backspace`, `Tab` (restart), dan `Esc` untuk UX yang lebih baik.
