import enWords from '$lib/data/words-en.json';
import idWords from '$lib/data/words-id.json';
import sentencesData from '$lib/data/sentences.json';
import type { Language, SentenceItem } from '$lib/types';

export const defaultDictionaries: Record<Language, string[]> = {
	en: enWords,
	id: idWords
};

export const defaultSentences: SentenceItem[] = sentencesData.map((s) => ({
	id: s.id,
	language: s.language as Language,
	text: s.text,
	author: s.author,
	difficulty: s.difficulty as 'easy' | 'medium' | 'hard',
	createdAt: Date.now()
}));

export function generateTextFromWords(
	language: Language = 'id',
	count = 50,
	customDictionary?: string[]
): string {
	const list =
		customDictionary && customDictionary.length > 0
			? customDictionary
			: defaultDictionaries[language] || defaultDictionaries.id;

	if (!list || list.length === 0) return 'indonesia teknologi mengetik cepat akurat';

	const words: string[] = [];
	for (let i = 0; i < count; i++) {
		const randomIndex = Math.floor(Math.random() * list.length);
		words.push(list[randomIndex]);
	}
	return words.join(' ');
}

export function getRandomSentence(
	language: Language = 'id',
	customSentences?: SentenceItem[]
): SentenceItem {
	const list =
		customSentences && customSentences.length > 0
			? customSentences.filter((s) => s.language === language)
			: defaultSentences.filter((s) => s.language === language);

	if (!list || list.length === 0) {
		return {
			id: 1,
			language,
			text:
				language === 'id'
					? 'Pendidikan adalah kunci untuk membuka pintu emas kebebasan dan masa depan.'
					: 'Success is walking from failure to failure with no loss of enthusiasm.',
			author: 'Inspirasi',
			difficulty: 'easy',
			createdAt: Date.now()
		};
	}

	const randomIndex = Math.floor(Math.random() * list.length);
	return list[randomIndex];
}
