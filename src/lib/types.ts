export type TestStatus = 'idle' | 'running' | 'finished';

export type Language = 'id' | 'en';

export type TestMode = 'words' | 'sentences' | 'custom' | 'competition';

export interface TestConfig {
	duration: number; // 15 | 30 | 60 or custom
	language: Language;
	mode: TestMode;
}

export interface TestResult {
	name: string;
	wpm: number;
	accuracy: number;
	correctChars: number;
	incorrectChars: number;
	duration: number;
	language: Language;
	mode?: string;
	date?: string;
}

export interface UserRecord {
	id?: number;
	name: string;
	lastUsedAt: Date | number;
	testCount: number;
	bestWpm: number;
}

export interface WordItem {
	id: number;
	word: string;
	language: Language;
	createdAt: Date | number;
}

export interface SentenceItem {
	id: number;
	text: string;
	author: string | null;
	language: Language;
	difficulty: 'easy' | 'medium' | 'hard';
	createdAt: Date | number;
}

export interface Competition {
	id: number;
	slug: string;
	title: string;
	description: string | null;
	customText: string;
	duration: number;
	status: 'active' | 'ended' | 'archived';
	startsAt: Date | number | null;
	endsAt: Date | number | null;
	createdAt: Date | number;
	entryCount?: number;
}

export interface CompetitionLeaderboardEntry {
	id: number;
	competitionId: number;
	userId: number;
	userName: string;
	wpm: number;
	accuracy: number;
	correctChars: number;
	incorrectChars: number;
	timeTaken: number;
	createdAt: Date | number;
	rank?: number;
}
