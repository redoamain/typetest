import { desc, eq, sql, and } from 'drizzle-orm';
import { db } from './index';
import {
	users,
	results,
	words,
	sentences,
	competitions,
	competitionEntries,
	appSettings
} from './schema';
import type { Language } from '$lib/types';
import { defaultAppConfig, type AppConfig } from '$lib/config';
import enWords from '$lib/data/words-en.json';
import idWords from '$lib/data/words-id.json';

export function normalizeName(raw: string): string {
	return raw.trim().replace(/\s+/g, ' ').slice(0, 30);
}

// User & Results
export interface SaveResultInput {
	name: string;
	wpm: number;
	accuracy: number;
	correctChars: number;
	incorrectChars: number;
	duration: number;
	language: Language;
	mode?: string;
}

export function saveResult(input: SaveResultInput) {
	const name = normalizeName(input.name);
	if (!name) throw new Error('Nama wajib diisi');

	return db.transaction((tx) => {
		const user = tx
			.insert(users)
			.values({ name, nameKey: name.toLowerCase() })
			.onConflictDoUpdate({
				target: users.nameKey,
				set: { lastUsedAt: sql`(unixepoch())` }
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
				mode: input.mode ?? 'words'
			})
			.run();

		return user;
	});
}

export function listUsers() {
	return db
		.select({
			id: users.id,
			name: users.name,
			lastUsedAt: users.lastUsedAt,
			testCount: sql<number>`count(${results.id})`,
			bestWpm: sql<number>`coalesce(max(${results.wpm}), 0)`
		})
		.from(users)
		.leftJoin(results, eq(results.userId, users.id))
		.groupBy(users.id)
		.orderBy(desc(users.lastUsedAt))
		.all();
}

export function getGlobalLeaderboard(limit = 10) {
	return db
		.select({
			id: results.id,
			userName: users.name,
			wpm: results.wpm,
			accuracy: results.accuracy,
			duration: results.duration,
			language: results.language,
			mode: results.mode,
			createdAt: results.createdAt
		})
		.from(results)
		.innerJoin(users, eq(results.userId, users.id))
		.orderBy(desc(results.wpm), desc(results.accuracy))
		.limit(limit)
		.all();
}

export function deleteUser(name: string) {
	const key = normalizeName(name).toLowerCase();
	return db.delete(users).where(eq(users.nameKey, key)).run().changes;
}

export function deleteUserById(id: number) {
	return db.delete(users).where(eq(users.id, id)).run().changes;
}

// Words Management
export function getWords(language?: string, limit = 500) {
	if (language) {
		return db
			.select()
			.from(words)
			.where(eq(words.language, language))
			.orderBy(desc(words.id))
			.limit(limit)
			.all();
	}
	return db.select().from(words).orderBy(desc(words.id)).limit(limit).all();
}

export function getAllWordsList(language: Language): string[] {
	const rows = db
		.select({ word: words.word })
		.from(words)
		.where(eq(words.language, language))
		.all();
	return rows.map((r) => r.word);
}

export function addWord(word: string, language: string) {
	const clean = word.trim().toLowerCase();
	if (!clean) throw new Error('Kata tidak boleh kosong');

	// Check if already exists in this language
	const existing = db
		.select()
		.from(words)
		.where(and(eq(words.word, clean), eq(words.language, language)))
		.get();
	if (existing) return existing;

	return db.insert(words).values({ word: clean, language }).returning().get();
}

export function addWordsBatch(rawText: string, language: string) {
	// Parse words split by comma, newline, or space
	const tokens = rawText
		.split(/[\s,;\n\r]+/)
		.map((w) => w.trim().toLowerCase())
		.filter((w) => w.length > 0 && /^[a-zA-Z0-9\-_]+$/.test(w));

	const uniqueTokens = Array.from(new Set(tokens));
	let addedCount = 0;

	db.transaction((tx) => {
		for (const w of uniqueTokens) {
			const existing = tx
				.select({ id: words.id })
				.from(words)
				.where(and(eq(words.word, w), eq(words.language, language)))
				.get();
			if (!existing) {
				tx.insert(words).values({ word: w, language }).run();
				addedCount++;
			}
		}
	});

	return addedCount;
}

export function deleteWord(id: number) {
	return db.delete(words).where(eq(words.id, id)).run().changes;
}

export function resetWordsToDefault(language?: string) {
	return db.transaction((tx) => {
		if (language) {
			tx.delete(words).where(eq(words.language, language)).run();
			const list = language === 'id' ? idWords : enWords;
			for (const w of list) {
				tx.insert(words).values({ word: w, language }).run();
			}
		} else {
			tx.delete(words).run();
			for (const w of idWords) {
				tx.insert(words).values({ word: w, language: 'id' }).run();
			}
			for (const w of enWords) {
				tx.insert(words).values({ word: w, language: 'en' }).run();
			}
		}
	});
}

// Sentences Management
export function getSentences(language?: string) {
	if (language) {
		return db
			.select()
			.from(sentences)
			.where(eq(sentences.language, language))
			.orderBy(desc(sentences.id))
			.all();
	}
	return db.select().from(sentences).orderBy(desc(sentences.id)).all();
}

export function addSentence(
	text: string,
	author: string | null,
	language: string,
	difficulty = 'medium'
) {
	const clean = text.trim();
	if (!clean) throw new Error('Kalimat tidak boleh kosong');

	return db
		.insert(sentences)
		.values({
			text: clean,
			author: author ? author.trim() : null,
			language,
			difficulty
		})
		.returning()
		.get();
}

export function updateSentence(
	id: number,
	text: string,
	author: string | null,
	language: string,
	difficulty = 'medium'
) {
	return db
		.update(sentences)
		.set({
			text: text.trim(),
			author: author ? author.trim() : null,
			language,
			difficulty
		})
		.where(eq(sentences.id, id))
		.returning()
		.get();
}

export function deleteSentence(id: number) {
	return db.delete(sentences).where(eq(sentences.id, id)).run().changes;
}

// Competitions Management
export function listCompetitions(status?: string) {
	const base = db
		.select({
			id: competitions.id,
			slug: competitions.slug,
			title: competitions.title,
			description: competitions.description,
			customText: competitions.customText,
			duration: competitions.duration,
			status: competitions.status,
			startsAt: competitions.startsAt,
			endsAt: competitions.endsAt,
			createdAt: competitions.createdAt,
			entryCount: sql<number>`count(${competitionEntries.id})`
		})
		.from(competitions)
		.leftJoin(competitionEntries, eq(competitionEntries.competitionId, competitions.id));

	if (status) {
		return base
			.where(eq(competitions.status, status))
			.groupBy(competitions.id)
			.orderBy(desc(competitions.createdAt))
			.all();
	}

	return base.groupBy(competitions.id).orderBy(desc(competitions.createdAt)).all();
}

export function getCompetitionBySlug(slug: string) {
	return db.select().from(competitions).where(eq(competitions.slug, slug)).get();
}

export function getCompetitionById(id: number) {
	return db.select().from(competitions).where(eq(competitions.id, id)).get();
}

export interface CreateCompetitionInput {
	title: string;
	slug?: string;
	description?: string;
	customText: string;
	duration?: number;
	status?: 'active' | 'ended' | 'archived';
	startsAt?: Date | null;
	endsAt?: Date | null;
}

export function createCompetition(input: CreateCompetitionInput) {
	const title = input.title.trim();
	if (!title) throw new Error('Judul kompetisi wajib diisi');
	if (!input.customText?.trim()) throw new Error('Teks kompetisi wajib diisi');

	const slug =
		input.slug?.trim() ||
		title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') +
			'-' +
			Math.floor(Math.random() * 1000);

	return db
		.insert(competitions)
		.values({
			title,
			slug,
			description: input.description?.trim() || null,
			customText: input.customText.trim(),
			duration: input.duration || 30,
			status: input.status || 'active',
			startsAt: input.startsAt ?? null,
			endsAt: input.endsAt ?? null
		})
		.returning()
		.get();
}

export function updateCompetitionStatus(id: number, status: 'active' | 'ended' | 'archived') {
	return db.update(competitions).set({ status }).where(eq(competitions.id, id)).run().changes;
}

export function deleteCompetition(id: number) {
	return db.delete(competitions).where(eq(competitions.id, id)).run().changes;
}

// Competition Entries
export interface SubmitCompetitionInput {
	competitionId: number;
	name: string;
	wpm: number;
	accuracy: number;
	correctChars: number;
	incorrectChars: number;
	timeTaken: number;
}

export function submitCompetitionEntry(input: SubmitCompetitionInput) {
	const name = normalizeName(input.name);
	if (!name) throw new Error('Nama peserta wajib diisi');

	return db.transaction((tx) => {
		const user = tx
			.insert(users)
			.values({ name, nameKey: name.toLowerCase() })
			.onConflictDoUpdate({
				target: users.nameKey,
				set: { lastUsedAt: sql`(unixepoch())` }
			})
			.returning()
			.get();

		const entry = tx
			.insert(competitionEntries)
			.values({
				competitionId: input.competitionId,
				userId: user.id,
				wpm: input.wpm,
				accuracy: input.accuracy,
				correctChars: input.correctChars,
				incorrectChars: input.incorrectChars,
				timeTaken: input.timeTaken
			})
			.returning()
			.get();

		return { user, entry };
	});
}

export function getCompetitionLeaderboard(competitionId: number) {
	const rows = db
		.select({
			id: competitionEntries.id,
			competitionId: competitionEntries.competitionId,
			userId: competitionEntries.userId,
			userName: users.name,
			wpm: competitionEntries.wpm,
			accuracy: competitionEntries.accuracy,
			correctChars: competitionEntries.correctChars,
			incorrectChars: competitionEntries.incorrectChars,
			timeTaken: competitionEntries.timeTaken,
			createdAt: competitionEntries.createdAt
		})
		.from(competitionEntries)
		.innerJoin(users, eq(competitionEntries.userId, users.id))
		.where(eq(competitionEntries.competitionId, competitionId))
		.orderBy(desc(competitionEntries.wpm), desc(competitionEntries.accuracy))
		.all();

	// Add rank
	return rows.map((entry, index) => ({
		...entry,
		rank: index + 1
	}));
}

// App & Company Settings (Citilumb Branding)
export function getAppSettings(): AppConfig {
	try {
		const rows = db.select().from(appSettings).all();
		const map: Record<string, string> = {};
		for (const r of rows) {
			map[r.key] = r.value;
		}

		return {
			appName: map['app_name'] || defaultAppConfig.appName,
			companyName: map['company_name'] || defaultAppConfig.companyName,
			tagline: map['tagline'] || defaultAppConfig.tagline,
			logoUrl: map['logo_url'] || defaultAppConfig.logoUrl,
			description: map['description'] || defaultAppConfig.description
		};
	} catch {
		return defaultAppConfig;
	}
}

export function updateAppSettings(settings: Partial<AppConfig>) {
	const keyMap: Record<keyof AppConfig, string> = {
		appName: 'app_name',
		companyName: 'company_name',
		tagline: 'tagline',
		logoUrl: 'logo_url',
		description: 'description'
	};

	return db.transaction((tx) => {
		for (const [prop, val] of Object.entries(settings)) {
			if (val !== undefined && prop in keyMap) {
				const dbKey = keyMap[prop as keyof AppConfig];
				tx.insert(appSettings)
					.values({ key: dbKey, value: String(val).trim() })
					.onConflictDoUpdate({
						target: appSettings.key,
						set: { value: String(val).trim(), updatedAt: sql`(unixepoch())` }
					})
					.run();
			}
		}
	});
}
