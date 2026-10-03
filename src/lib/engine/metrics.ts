export function calculateWpm(correctChars: number, elapsedSeconds: number): number {
	if (elapsedSeconds <= 0) return 0;
	const minutes = elapsedSeconds / 60;
	return Math.max(0, Math.round(correctChars / 5 / minutes));
}

export function calculateAccuracy(correct: number, total: number): number {
	if (total <= 0) return 100;
	const ratio = (correct / total) * 100;
	return Math.min(100, Math.max(0, Math.round(ratio)));
}

export function calculateNetWpm(
	correctChars: number,
	incorrectChars: number,
	elapsedSeconds: number
): number {
	if (elapsedSeconds <= 0) return 0;
	const minutes = elapsedSeconds / 60;
	const grossWpm = correctChars / 5 / minutes;
	const errorPenalty = incorrectChars / minutes;
	return Math.max(0, Math.round(grossWpm - errorPenalty));
}
