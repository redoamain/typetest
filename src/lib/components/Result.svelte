<script lang="ts">
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';
	import type { TestResult } from '$lib/types';
	import { calculateNetWpm } from '$lib/engine/metrics';

	interface Props {
		result: TestResult;
		onrestart: () => void;
	}

	let { result, onrestart }: Props = $props();

	let netWpm = $derived(
		calculateNetWpm(result.correctChars, result.incorrectChars, result.duration)
	);

	function getBadge(wpm: number): { label: string; color: string } {
		if (wpm >= 100) return { label: '🔥 Kecepatan Kilat (Godlike)', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
		if (wpm >= 75) return { label: '⚡ Sangat Cepat (Master)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
		if (wpm >= 50) return { label: '🚀 Cepat (Pro)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
		if (wpm >= 30) return { label: '👍 Menengah (Good)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
		return { label: '🌱 Pemula (Keep Practicing)', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
	}

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

<div class="w-full max-w-xl mx-auto p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur text-center">
	<!-- Badge -->
	<div class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border mb-6 {getBadge(result.wpm).color}">
		{getBadge(result.wpm).label}
	</div>

	<!-- Title -->
	<h2 class="text-xl font-medium text-slate-400 mb-2">Hasil Tes Mengetik:</h2>
	<h3 class="text-3xl font-extrabold text-white mb-8">{result.name}</h3>

	<!-- Primary Metrics Highlight -->
	<div class="grid grid-cols-2 gap-4 mb-8">
		<div class="p-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center">
			<span class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Kecepatan (WPM)</span>
			<span class="text-5xl font-mono font-extrabold text-amber-400">{result.wpm}</span>
			<span class="text-xs text-slate-500 mt-1">Kata per menit</span>
		</div>

		<div class="p-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center">
			<span class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Akurasi</span>
			<span class="text-5xl font-mono font-extrabold text-cyan-400">{result.accuracy}%</span>
			<span class="text-xs text-slate-500 mt-1">Ketepatan ketik</span>
		</div>
	</div>

	<!-- Secondary Details Breakdown -->
	<div class="grid grid-cols-3 gap-3 p-4 bg-slate-950/50 border border-slate-800/60 rounded-2xl mb-8 text-sm">
		<div class="flex flex-col">
			<span class="text-slate-400 text-xs">Karakter Benar</span>
			<span class="text-emerald-400 font-mono font-bold text-lg">{result.correctChars}</span>
		</div>
		<div class="flex flex-col">
			<span class="text-slate-400 text-xs">Kesalahan</span>
			<span class="text-rose-400 font-mono font-bold text-lg">{result.incorrectChars}</span>
		</div>
		<div class="flex flex-col">
			<span class="text-slate-400 text-xs">Waktu</span>
			<span class="text-slate-200 font-mono font-bold text-lg">{result.duration}s</span>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="flex items-center justify-center gap-4">
		<button
			type="button"
			onclick={onrestart}
			class="flex items-center gap-2 py-3.5 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition transform active:scale-95"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
			<span>Ulangi Tes</span>
		</button>
	</div>
</div>
