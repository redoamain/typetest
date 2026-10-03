const KEY = 'typing-current-user';

export const session = $state({
	name: '',
	ready: false
});

export function loadSession() {
	if (typeof localStorage === 'undefined') return;
	session.name = localStorage.getItem(KEY) ?? '';
	session.ready = true;
}

export function setName(raw: string): boolean {
	const clean = raw.trim().replace(/\s+/g, ' ').slice(0, 30);
	if (!clean) return false;
	session.name = clean;
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(KEY, clean);
	}
	return true;
}

export function clearName() {
	session.name = '';
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(KEY);
	}
}
