export type Theme = 'dark' | 'light';

const THEME_KEY = 'citilumb-theme';

export const themeState = $state<{ current: Theme }>({
	current: 'dark'
});

export function initTheme() {
	if (typeof window === 'undefined') return;

	const saved = localStorage.getItem(THEME_KEY) as Theme | null;
	if (saved === 'dark' || saved === 'light') {
		themeState.current = saved;
	} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
		themeState.current = 'light';
	} else {
		themeState.current = 'dark';
	}

	applyTheme(themeState.current);
}

export function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	if (theme === 'dark') {
		root.classList.add('dark');
		root.classList.remove('light');
	} else {
		root.classList.remove('dark');
		root.classList.add('light');
	}
	localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme() {
	const next: Theme = themeState.current === 'dark' ? 'light' : 'dark';
	themeState.current = next;
	applyTheme(next);
}
