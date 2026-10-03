import { sql } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type Database from 'better-sqlite3';
import * as schema from './schema';
import enWords from '$lib/data/words-en.json';
import idWords from '$lib/data/words-id.json';
import sentencesData from '$lib/data/sentences.json';

let initialized = false;

export function initDb(db: BetterSQLite3Database<typeof schema>, client: Database.Database) {
	if (initialized) return;
	initialized = true;

	try {
		// Create tables and indexes if they do not exist
		client.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				name_key TEXT NOT NULL UNIQUE,
				created_at INTEGER NOT NULL DEFAULT (unixepoch()),
				last_used_at INTEGER NOT NULL DEFAULT (unixepoch())
			);

			CREATE TABLE IF NOT EXISTS results (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				wpm INTEGER NOT NULL,
				accuracy INTEGER NOT NULL,
				correct_chars INTEGER NOT NULL,
				incorrect_chars INTEGER NOT NULL,
				duration INTEGER NOT NULL,
				language TEXT NOT NULL,
				mode TEXT NOT NULL DEFAULT 'words',
				created_at INTEGER NOT NULL DEFAULT (unixepoch())
			);

			CREATE INDEX IF NOT EXISTS results_user_idx ON results(user_id);

			CREATE TABLE IF NOT EXISTS words (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				word TEXT NOT NULL,
				language TEXT NOT NULL,
				created_at INTEGER NOT NULL DEFAULT (unixepoch())
			);

			CREATE INDEX IF NOT EXISTS words_lang_idx ON words(language);

			CREATE TABLE IF NOT EXISTS sentences (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				text TEXT NOT NULL,
				author TEXT,
				language TEXT NOT NULL,
				difficulty TEXT NOT NULL DEFAULT 'medium',
				created_at INTEGER NOT NULL DEFAULT (unixepoch())
			);

			CREATE INDEX IF NOT EXISTS sentences_lang_idx ON sentences(language);

			CREATE TABLE IF NOT EXISTS competitions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				slug TEXT NOT NULL UNIQUE,
				title TEXT NOT NULL,
				description TEXT,
				custom_text TEXT NOT NULL,
				duration INTEGER NOT NULL DEFAULT 30,
				status TEXT NOT NULL DEFAULT 'active',
				starts_at INTEGER,
				ends_at INTEGER,
				created_at INTEGER NOT NULL DEFAULT (unixepoch())
			);

			CREATE INDEX IF NOT EXISTS competitions_status_idx ON competitions(status);

			CREATE TABLE IF NOT EXISTS competition_entries (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
				user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				wpm INTEGER NOT NULL,
				accuracy INTEGER NOT NULL,
				correct_chars INTEGER NOT NULL,
				incorrect_chars INTEGER NOT NULL,
				time_taken INTEGER NOT NULL,
				created_at INTEGER NOT NULL DEFAULT (unixepoch())
			);

			CREATE INDEX IF NOT EXISTS comp_entries_comp_idx ON competition_entries(competition_id);
			CREATE INDEX IF NOT EXISTS comp_entries_user_idx ON competition_entries(user_id);
		`);

		// Seed initial words if empty
		const wordCountResult = db.select({ count: sql<number>`count(*)` }).from(schema.words).get();
		if (!wordCountResult || wordCountResult.count === 0) {
			const idInserts = idWords.map((w) => ({ word: w, language: 'id' }));
			const enInserts = enWords.map((w) => ({ word: w, language: 'en' }));

			db.transaction((tx) => {
				for (const item of [...idInserts, ...enInserts]) {
					tx.insert(schema.words).values(item).run();
				}
			});
		}

		// Seed initial sentences if empty
		const sentenceCountResult = db
			.select({ count: sql<number>`count(*)` })
			.from(schema.sentences)
			.get();
		if (!sentenceCountResult || sentenceCountResult.count === 0) {
			db.transaction((tx) => {
				for (const item of sentencesData) {
					tx.insert(schema.sentences)
						.values({
							text: item.text,
							author: item.author,
							language: item.language,
							difficulty: item.difficulty
						})
						.run();
				}
			});
		}

		// Seed sample competitions if empty
		const compCountResult = db
			.select({ count: sql<number>`count(*)` })
			.from(schema.competitions)
			.get();
		if (!compCountResult || compCountResult.count === 0) {
			const now = Math.floor(Date.now() / 1000);
			db.insert(schema.competitions)
				.values([
					{
						slug: 'grand-prix-indonesia-2026',
						title: 'Grand Prix Mengetik Cepat Indonesia',
						description:
							'Uji kemampuan jari dan kecepatan mengetik kalimat inspiratif bersama pengetik terbaik se-Indonesia!',
						customText:
							'Beri aku seribu orang tua, niscaya akan kucabut semeru dari akarnya. Beri aku sepuluh pemuda, niscaya akan kuguncangkan dunia.',
						duration: 30,
						status: 'active',
						startsAt: new Date((now - 86400) * 1000),
						endsAt: new Date((now + 86400 * 14) * 1000)
					},
					{
						slug: 'speed-sprint-global',
						title: 'Speed Sprint 60s Challenge',
						description:
							'Tantangan sprint 60 detik kata-kata umum untuk meraih posisi teratas di leaderboard.',
						customText:
							'teknologi komputer internet program kode sistem data informasi jaringan layar papan ketik tombol kecepatan akurasi latihan fokus disiplin konsisten kemampuan pintar cerdas hebat unggul terbaik pemenang juara',
						duration: 60,
						status: 'active',
						startsAt: new Date((now - 86400) * 1000),
						endsAt: new Date((now + 86400 * 30) * 1000)
					}
				])
				.run();
		}
	} catch (err) {
		console.error('Database initialization error:', err);
	}
}
