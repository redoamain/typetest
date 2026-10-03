import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	nameKey: text('name_key').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	lastUsedAt: integer('last_used_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const results = sqliteTable(
	'results',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		wpm: integer('wpm').notNull(),
		accuracy: integer('accuracy').notNull(),
		correctChars: integer('correct_chars').notNull(),
		incorrectChars: integer('incorrect_chars').notNull(),
		duration: integer('duration').notNull(),
		language: text('language').notNull(),
		mode: text('mode').notNull().default('words'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(t) => [index('results_user_idx').on(t.userId)]
);

export const words = sqliteTable(
	'words',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		word: text('word').notNull(),
		language: text('language').notNull(), // 'id' | 'en'
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(t) => [index('words_lang_idx').on(t.language)]
);

export const sentences = sqliteTable(
	'sentences',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		text: text('text').notNull(),
		author: text('author'),
		language: text('language').notNull(), // 'id' | 'en'
		difficulty: text('difficulty').notNull().default('medium'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(t) => [index('sentences_lang_idx').on(t.language)]
);

export const competitions = sqliteTable(
	'competitions',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		description: text('description'),
		customText: text('custom_text').notNull(),
		duration: integer('duration').notNull().default(30),
		status: text('status').notNull().default('active'), // 'active' | 'ended' | 'archived'
		startsAt: integer('starts_at', { mode: 'timestamp' }),
		endsAt: integer('ends_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(t) => [index('competitions_status_idx').on(t.status)]
);

export const competitionEntries = sqliteTable(
	'competition_entries',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		competitionId: integer('competition_id')
			.notNull()
			.references(() => competitions.id, { onDelete: 'cascade' }),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		wpm: integer('wpm').notNull(),
		accuracy: integer('accuracy').notNull(),
		correctChars: integer('correct_chars').notNull(),
		incorrectChars: integer('incorrect_chars').notNull(),
		timeTaken: integer('time_taken').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(t) => [
		index('comp_entries_comp_idx').on(t.competitionId),
		index('comp_entries_user_idx').on(t.userId)
	]
);

export const appSettings = sqliteTable('app_settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export type User = typeof users.$inferSelect;
export type Result = typeof results.$inferSelect;
export type Word = typeof words.$inferSelect;
export type Sentence = typeof sentences.$inferSelect;
export type CompetitionTable = typeof competitions.$inferSelect;
export type CompetitionEntryTable = typeof competitionEntries.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
