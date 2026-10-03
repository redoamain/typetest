<script lang="ts">
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';
	import type { TestResult } from '$lib/types';
	import { calculateNetWpm } from '$lib/engine/metrics';
	import { RotateCcw, Flame, Zap, Award, CheckCircle2, Sparkles, Check, X, Clock } from '@lucide/svelte';

	interface Props {
		result: TestResult;
		onrestart: () => void;
	}

	let { result, onrestart }: Props = $props();

	let netWpm = $derived(
		calculateNetWpm(result.correctChars, result.incorrectChars, result.duration)
	);

	type BadgeInfo = {
		label: string;
		color: string;
		icon: typeof Flame;
	};

	function getBadge(wpm: number): BadgeInfo {
		if (wpm >= 100) return { label: 'Kecepatan Kilat (Godlike)', color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30', icon: Flame };
		if (wpm >= 75) return { label: 'Sangat Cepat (Master)', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Zap };
		if (wpm >= 50) return { label: 'Cepat (Pro)', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: Award };
		if (wpm >= 30) return { label: 'Menengah (Good)', color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30', icon: CheckCircle2 };
		return { label: 'Pemula (Keep Practicing)', color: 'text-muted-foreground bg-muted border-border', icon: Sparkles };
	}

	let badge = $derived(getBadge(result.wpm));
	let BadgeIcon = $derived(badge.icon);

	onMount(() => {
		if (result.wpm >= 40) {
			confetti({
				particleCount: 80,
				spread: 70,
				origin: { y: 0.6 }
			});
		}
	});
</script>

<div class="w-full max-w-xl mx-auto p-8 bg-card text-card-foreground border border-border rounded-3xl shadow-xl text-center">
	<!-- Badge -->
	<div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border mb-6 {badge.color}">
		<BadgeIcon class="w-4 h-4" />
		<span>{badge.label}</span>
	</div>

	<!-- Title -->
	<h2 class="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Hasil Tes Mengetik</h2>
	<h3 class="text-3xl font-extrabold text-foreground mb-8">{result.name}</h3>

	<!-- Primary Metrics Highlight -->
	<div class="grid grid-cols-2 gap-4 mb-8">
		<div class="p-6 bg-muted/40 border border-border rounded-2xl flex flex-col items-center justify-center">
			<span class="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Kecepatan (WPM)</span>
			<span class="text-5xl font-mono font-extrabold text-primary">{result.wpm}</span>
			<span class="text-xs text-muted-foreground mt-1">Kata per menit</span>
		</div>

		<div class="p-6 bg-muted/40 border border-border rounded-2xl flex flex-col items-center justify-center">
			<span class="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Akurasi</span>
			<span class="text-5xl font-mono font-extrabold text-sky-600 dark:text-sky-400">{result.accuracy}%</span>
			<span class="text-xs text-muted-foreground mt-1">Ketepatan ketik</span>
		</div>
	</div>

	<!-- Secondary Details Breakdown -->
	<div class="grid grid-cols-3 gap-3 p-4 bg-muted/30 border border-border rounded-2xl mb-8 text-sm">
		<div class="flex flex-col items-center">
			<div class="flex items-center gap-1 text-muted-foreground text-xs mb-1">
				<Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
				<span>Karakter Benar</span>
			</div>
			<span class="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg">{result.correctChars}</span>
		</div>
		<div class="flex flex-col items-center">
			<div class="flex items-center gap-1 text-muted-foreground text-xs mb-1">
				<X class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
				<span>Kesalahan</span>
			</div>
			<span class="text-rose-600 dark:text-rose-400 font-mono font-bold text-lg">{result.incorrectChars}</span>
		</div>
		<div class="flex flex-col items-center">
			<div class="flex items-center gap-1 text-muted-foreground text-xs mb-1">
				<Clock class="w-3.5 h-3.5 text-muted-foreground" />
				<span>Waktu</span>
			</div>
			<span class="text-foreground font-mono font-bold text-lg">{result.duration}s</span>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="flex items-center justify-center gap-4">
		<button
			type="button"
			onclick={onrestart}
			class="flex items-center gap-2 py-3.5 px-8 bg-primary text-primary-foreground font-bold rounded-2xl shadow-sm hover:opacity-90 transition transform active:scale-95 text-sm"
		>
			<RotateCcw class="w-4 h-4" />
			<span>Ulangi Tes</span>
		</button>
	</div>
</div>
