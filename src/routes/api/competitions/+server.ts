import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	listCompetitions,
	createCompetition,
	deleteCompetition,
	updateCompetitionStatus
} from '$lib/server/db/queries';

export const GET: RequestHandler = async ({ url }) => {
	const status = url.searchParams.get('status') || undefined;
	const competitions = listCompetitions(status);
	return json({ competitions });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body || !body.title || !body.customText) {
		error(400, 'Judul dan teks kompetisi wajib diisi');
	}

	try {
		const comp = createCompetition({
			title: body.title,
			slug: body.slug,
			description: body.description,
			customText: body.customText,
			duration: Number(body.duration) || 30,
			status: body.status || 'active',
			startsAt: body.startsAt ? new Date(body.startsAt) : null,
			endsAt: body.endsAt ? new Date(body.endsAt) : null
		});

		return json({ ok: true, competition: comp });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Gagal membuat kompetisi';
		error(400, msg);
	}
};

export const PATCH: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const id = Number(body?.id);
	const status = body?.status;
	if (!id || !['active', 'ended', 'archived'].includes(status)) {
		error(400, 'ID dan status tidak valid');
	}

	const changes = updateCompetitionStatus(id, status);
	return json({ ok: changes > 0 });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const id = Number(body?.id);
	if (!id) error(400, 'ID kompetisi wajib diisi');

	const changes = deleteCompetition(id);
	return json({ ok: changes > 0 });
};
