import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { submitCompetitionEntry, getCompetitionLeaderboard } from '$lib/server/db/queries';

export const GET: RequestHandler = async ({ params }) => {
	const compId = Number(params.id);
	if (!compId) error(400, 'ID kompetisi tidak valid');

	const leaderboard = getCompetitionLeaderboard(compId);
	return json({ leaderboard });
};

export const POST: RequestHandler = async ({ params, request }) => {
	const compId = Number(params.id);
	if (!compId) error(400, 'ID kompetisi tidak valid');

	const body = await request.json().catch(() => null);
	if (!body || !body.name) error(400, 'Nama peserta wajib diisi');

	try {
		const result = submitCompetitionEntry({
			competitionId: compId,
			name: body.name,
			wpm: Math.round(Number(body.wpm) || 0),
			accuracy: Math.round(Number(body.accuracy) || 0),
			correctChars: Math.round(Number(body.correctChars) || 0),
			incorrectChars: Math.round(Number(body.incorrectChars) || 0),
			timeTaken: Math.round(Number(body.timeTaken) || 0)
		});

		const updatedLeaderboard = getCompetitionLeaderboard(compId);
		return json({ ok: true, result, leaderboard: updatedLeaderboard });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Gagal mengirim hasil kompetisi';
		error(400, msg);
	}
};
