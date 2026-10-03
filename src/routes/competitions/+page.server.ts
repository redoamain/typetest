import type { PageServerLoad } from './$types';
import { listCompetitions } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const competitions = listCompetitions();
	return {
		competitions
	};
};
