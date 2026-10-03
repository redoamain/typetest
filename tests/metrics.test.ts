import { describe, it, expect } from 'vitest';
import { calculateWpm, calculateAccuracy, calculateNetWpm } from '../src/lib/engine/metrics';

describe('metrics calculation engine', () => {
	it('menghitung WPM dengan benar', () => {
		expect(calculateWpm(150, 60)).toBe(30);
		expect(calculateWpm(300, 60)).toBe(60);
		expect(calculateWpm(150, 30)).toBe(60);
	});

	it('mengembalikan 0 WPM jika elapsedSeconds <= 0', () => {
		expect(calculateWpm(100, 0)).toBe(0);
		expect(calculateWpm(100, -5)).toBe(0);
	});

	it('akurasi 100% jika belum mengetik apa pun', () => {
		expect(calculateAccuracy(0, 0)).toBe(100);
	});

	it('menghitung akurasi dengan benar', () => {
		expect(calculateAccuracy(45, 50)).toBe(90);
		expect(calculateAccuracy(50, 50)).toBe(100);
		expect(calculateAccuracy(0, 10)).toBe(0);
	});

	it('menghitung net WPM dengan penalti kesalahan', () => {
		expect(calculateNetWpm(150, 0, 60)).toBe(30);
		expect(calculateNetWpm(150, 2, 60)).toBe(28);
		expect(calculateNetWpm(10, 10, 60)).toBe(0); // tidak boleh minus
	});
});
