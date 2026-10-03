import type { TestResult } from '$lib/types';

const KEY = 'typing-history';

function loadHistory(): TestResult[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '[]');
	} catch {
		return [];
	}
}

export const history = $state<{ items: TestResult[] }>({
	items: []
});

export function initHistory() {
	history.items = loadHistory();
}

export function addResultToHistory(r: TestResult) {
	history.items = [r, ...history.items].slice(0, 50);
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(KEY, JSON.stringify(history.items));
	}
}
