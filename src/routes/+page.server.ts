import type { PageServerLoad } from './$types';
import {
	listUsers,
	getGlobalLeaderboard,
	getAllWordsList,
	getSentences
} from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const users = listUsers();
	const leaderboard = getGlobalLeaderboard(10);
	const idWords = getAllWordsList('id');
	const enWords = getAllWordsList('en');
	const allSentences = getSentences();

	return {
		users,
		leaderboard,
		words: {
			id: idWords,
			en: enWords
		},
		sentences: allSentences
	};
};
