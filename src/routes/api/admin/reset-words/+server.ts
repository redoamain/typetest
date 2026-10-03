import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resetWordsToDefault } from '$lib/server/db/queries';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const language = body?.language === 'id' || body?.language === 'en' ? body.language : undefined;

	try {
		resetWordsToDefault(language);
		return json({ ok: true });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Gagal reset kata';
		error(500, msg);
	}
};
