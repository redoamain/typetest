import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWords, addWord, addWordsBatch, deleteWord } from '$lib/server/db/queries';

export const GET: RequestHandler = async ({ url }) => {
	const lang = url.searchParams.get('lang') || undefined;
	const limit = Number(url.searchParams.get('limit')) || 500;
	const list = getWords(lang, limit);
	return json({ words: list });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) error(400, 'Payload tidak valid');

	const language = body.language === 'en' ? 'en' : 'id';

	// Batch insertion
	if (typeof body.batch === 'string' && body.batch.trim()) {
		try {
			const addedCount = addWordsBatch(body.batch, language);
			return json({ ok: true, addedCount });
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Gagal menambahkan kata';
			error(400, msg);
		}
	}

	// Single word
	if (typeof body.word === 'string' && body.word.trim()) {
		try {
			const created = addWord(body.word, language);
			return json({ ok: true, word: created });
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Gagal menambahkan kata';
			error(400, msg);
		}
	}

	error(400, 'Kata atau batch wajib diisi');
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const id = Number(body?.id);
	if (!id) error(400, 'ID kata wajib diisi');

	const changes = deleteWord(id);
	return json({ ok: changes > 0 });
};
