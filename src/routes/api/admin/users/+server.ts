import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteUserById, deleteUser } from '$lib/server/db/queries';

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) error(400, 'Payload tidak valid');

	if (body.id) {
		const changes = deleteUserById(Number(body.id));
		return json({ ok: changes > 0 });
	}

	if (body.name) {
		const changes = deleteUser(String(body.name));
		return json({ ok: changes > 0 });
	}

	error(400, 'ID atau nama pengguna wajib disertakan');
};
