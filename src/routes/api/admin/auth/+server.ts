import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => null);
	const password = body?.password?.trim();
	const adminSecret = process.env.ADMIN_SECRET || 'admin123';

	if (password === adminSecret) {
		cookies.set('admin_auth', 'authenticated', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 // 24 hours
		});
		return json({ ok: true });
	}

	error(401, 'Password admin salah');
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete('admin_auth', { path: '/' });
	return json({ ok: true });
};
