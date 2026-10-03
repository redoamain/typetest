import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAppSettings, updateAppSettings } from '$lib/server/db/queries';

export const GET: RequestHandler = async () => {
	const settings = getAppSettings();
	return json({ settings });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) error(400, 'Payload tidak valid');

	try {
		updateAppSettings({
			appName: body.appName,
			companyName: body.companyName,
			tagline: body.tagline,
			logoUrl: body.logoUrl,
			description: body.description
		});

		const updated = getAppSettings();
		return json({ ok: true, settings: updated });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Gagal memperbarui pengaturan aplikasi';
		error(500, msg);
	}
};
