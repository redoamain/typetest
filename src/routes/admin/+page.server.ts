import type { PageServerLoad } from './$types';
import {
	getWords,
	getSentences,
	listUsers,
	listCompetitions,
	getAppSettings
} from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ cookies }) => {
	const authCookie = cookies.get('admin_auth');
	const isAuthenticated = authCookie === 'authenticated';
	const appConfig = getAppSettings();

	if (!isAuthenticated) {
		return {
			isAuthenticated: false,
			appConfig,
			words: [],
			sentences: [],
			users: [],
			competitions: []
		};
	}

	const allWords = getWords(undefined, 1000);
	const allSentences = getSentences();
	const allUsers = listUsers();
	const allCompetitions = listCompetitions();

	return {
		isAuthenticated: true,
		appConfig,
		words: allWords,
		sentences: allSentences,
		users: allUsers,
		competitions: allCompetitions
	};
};
