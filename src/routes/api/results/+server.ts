import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveResult } from '$lib/server/db/queries';

const int = (v: unknown, min: number, max: number) =>
	Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.name !== 'string') {
		error(400, 'Data tidak valid');
	}

	try {
		const user = saveResult({
			name: body.name,
			wpm: int(body.wpm, 0, 400),
			accuracy: int(body.accuracy, 0, 100),
			correctChars: int(body.correctChars, 0, 50000),
			incorrectChars: int(body.incorrectChars, 0, 50000),
			duration: int(body.duration, 1, 3600),
			language: body.language === 'en' ? 'en' : 'id',
			mode: body.mode || 'words'
		});

		return json({ ok: true, user });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Gagal menyimpan hasil';
		error(400, message);
	}
};
