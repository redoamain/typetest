import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCompetitionBySlug, getCompetitionLeaderboard } from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ params }) => {
	const competition = getCompetitionBySlug(params.slug);
	if (!competition) {
		error(404, 'Kompetisi tidak ditemukan');
	}

	const leaderboard = getCompetitionLeaderboard(competition.id);

	return {
		competition,
		leaderboard
	};
};
