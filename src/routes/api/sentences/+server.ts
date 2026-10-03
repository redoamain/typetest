import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSentences, addSentence, updateSentence, deleteSentence } from '$lib/server/db/queries';

export const GET: RequestHandler = async ({ url }) => {
	const lang = url.searchParams.get('lang') || undefined;
	const list = getSentences(lang);
	return json({ sentences: list });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body || !body.text) error(400, 'Teks kalimat wajib diisi');

	const language = body.language === 'en' ? 'en' : 'id';
	const difficulty = ['easy', 'medium', 'hard'].includes(body.difficulty)
		? body.difficulty
		: 'medium';

	try {
		const created = addSentence(body.text, body.author || null, language, difficulty);
		return json({ ok: true, sentence: created });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Gagal menambahkan kalimat';
		error(400, msg);
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const id = Number(body?.id);
	if (!id || !body?.text) error(400, 'ID dan teks kalimat wajib diisi');

	const language = body.language === 'en' ? 'en' : 'id';
	const difficulty = ['easy', 'medium', 'hard'].includes(body.difficulty)
		? body.difficulty
		: 'medium';

	try {
		const updated = updateSentence(id, body.text, body.author || null, language, difficulty);
		return json({ ok: true, sentence: updated });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Gagal mengubah kalimat';
		error(400, msg);
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const id = Number(body?.id);
	if (!id) error(400, 'ID kalimat wajib diisi');

	const changes = deleteSentence(id);
	return json({ ok: changes > 0 });
};
