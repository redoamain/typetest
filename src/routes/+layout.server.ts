import type { LayoutServerLoad } from './$types';
import { getAppSettings } from '$lib/server/db/queries';

export const load: LayoutServerLoad = async () => {
	const appConfig = getAppSettings();
	return {
		appConfig
	};
};
