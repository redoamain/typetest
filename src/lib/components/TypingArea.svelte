<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { calculateWpm, calculateAccuracy, calculateNetWpm } from '$lib/engine/metrics';
	import type { TestStatus } from '$lib/types';

	interface FinishResult {
		wpm: number;
		accuracy: number;
		correctChars: number;
		incorrectChars: number;
		duration: number;
		timeTaken: number;
		date: string;
	}

	interface Props {
		text: string;
		duration?: number; // 0 = unlimited / text completion mode
		language?: 'id' | 'en';
		mode?: string;
		onfinish: (result: FinishResult) => void;
		onrestart?: () => void;
	}

	let {
		text = '',
		duration = 30,
		language = 'id',
		mode = 'words',
		onfinish,
		onrestart
	}: Props = $props();

	let typed = $state('');
	let status = $state<TestStatus>('idle');
	let timeLeft = $state(0);
	let elapsedSeconds = $state(0);

	$effect(() => {
		if (status === 'idle') {
			timeLeft = duration > 0 ? duration : 0;
		}
	});
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let inputEl: HTMLInputElement | null = $state(null);
	let textContainerEl: HTMLDivElement | null = $state(null);
	let cursorEl: HTMLSpanElement | null = $state(null);

	// Derived metrics
	let correctChars = $derived.by(() => {
		let count = 0;
		for (let i = 0; i < typed.length && i < text.length; i++) {
			if (typed[i] === text[i]) count++;
		}
		return count;
	});

	let incorrectChars = $derived(Math.max(0, typed.length - correctChars));

	let currentWpm = $derived(
		calculateWpm(correctChars, elapsedSeconds > 0 ? elapsedSeconds : 1)
	);

	let currentAccuracy = $derived(calculateAccuracy(correctChars, typed.length));

	function start() {
		if (status !== 'idle') return;
		status = 'running';
		elapsedSeconds = 0;
		if (duration > 0) {
			timeLeft = duration;
		}

		timerInterval = setInterval(() => {
			elapsedSeconds += 1;
			if (duration > 0) {
				timeLeft -= 1;
				if (timeLeft <= 0) {
					finish();
				}
			}
		}, 1000);
	}

	function finish() {
		if (status === 'finished') return;
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		status = 'finished';

		const totalDuration = duration > 0 ? duration : elapsedSeconds;
		const finalElapsed = elapsedSeconds > 0 ? elapsedSeconds : 1;

		onfinish({
			wpm: calculateWpm(correctChars, finalElapsed),
			accuracy: currentAccuracy,
			correctChars,
			incorrectChars,
			duration: totalDuration,
			timeTaken: finalElapsed,
			date: new Date().toISOString()
		});
	}

	function handleInput(e: Event) {
		if (status === 'finished') return;
		if (status === 'idle') start();

		const target = e.target as HTMLInputElement;
		typed = target.value;

		// If typed reached or exceeded target text length in completion mode or normal mode
		if (typed.length >= text.length) {
			finish();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		// Restart on Tab or Escape
		if (e.key === 'Tab' || e.key === 'Escape') {
			e.preventDefault();
			reset();
		}
	}

	export function reset() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		typed = '';
		status = 'idle';
		timeLeft = duration > 0 ? duration : 0;
		elapsedSeconds = 0;
		if (inputEl) {
			inputEl.value = '';
			inputEl.focus();
		}
		onrestart?.();
	}

	function focusInput() {
		inputEl?.focus();
	}

	// Auto-scroll so cursor stays visible
	$effect(() => {
		if (cursorEl && textContainerEl) {
			const cursorOffset = cursorEl.offsetTop;
			const containerHeight = textContainerEl.clientHeight;
			if (cursorOffset > containerHeight / 2) {
				textContainerEl.scrollTop = cursorOffset - containerHeight / 2;
			}
		}
	});

	onMount(() => {
		focusInput();
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			if (timerInterval) clearInterval(timerInterval);
		};
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});
</script>

<div class="relative w-full max-w-4xl mx-auto flex flex-col gap-6">
	<!-- Top Live Stats Bar -->
	<div class="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl shadow-xl">
		<div class="flex items-center gap-8">
			<!-- Timer / Countdown -->
			<div class="flex flex-col">
				<span class="text-xs uppercase tracking-wider text-slate-400 font-medium">
					{duration > 0 ? 'Waktu Tersisa' : 'Waktu Berjalan'}
				</span>
				<div class="flex items-baseline gap-1">
					<span class="text-3xl font-mono font-bold text-amber-400">
						{duration > 0 ? timeLeft : elapsedSeconds}
					</span>
					<span class="text-sm text-slate-400">detik</span>
				</div>
			</div>

			<!-- Live WPM -->
			<div class="flex flex-col">
				<span class="text-xs uppercase tracking-wider text-slate-400 font-medium">Kecepatan</span>
				<div class="flex items-baseline gap-1">
					<span class="text-3xl font-mono font-bold text-emerald-400">
						{currentWpm}
					</span>
					<span class="text-sm text-slate-400">WPM</span>
				</div>
			</div>

			<!-- Live Accuracy -->
			<div class="flex flex-col">
				<span class="text-xs uppercase tracking-wider text-slate-400 font-medium">Akurasi</span>
				<div class="flex items-baseline gap-1">
					<span class="text-3xl font-mono font-bold text-cyan-400">
						{currentAccuracy}
					</span>
					<span class="text-sm text-slate-400">%</span>
				</div>
			</div>
		</div>

		<!-- Status & Restart Button -->
		<div class="flex items-center gap-3">
			{#if status === 'idle'}
				<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
					Ketik untuk mulai
				</span>
			{:else if status === 'running'}
				<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
					Mengetik...
				</span>
			{:else}
				<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
					Selesai!
				</span>
			{/if}

			<button
				type="button"
				onclick={reset}
				class="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition shadow-sm border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
				title="Ulangi Tes (Tab / Esc)"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<span>Reset</span>
			</button>
		</div>
	</div>

	<!-- Interactive Typing Area Box -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={textContainerEl}
		onclick={focusInput}
		class="relative p-8 min-h-[220px] max-h-[340px] overflow-y-auto bg-slate-900/60 hover:bg-slate-900/80 border-2 border-slate-800 hover:border-slate-700 focus-within:border-amber-500/70 rounded-3xl cursor-text transition shadow-2xl backdrop-blur-sm select-none"
	>
		<div class="font-mono text-2xl leading-relaxed tracking-wide select-none break-words">
			{#each text as char, i}
				{#if i < typed.length}
					{#if typed[i] === char}
						<span class="text-emerald-400 transition-colors duration-75">{char}</span>
					{:else}
						<span class="text-rose-400 bg-rose-950/60 rounded px-0.5 border-b-2 border-rose-500">{char}</span>
					{/if}
				{:else if i === typed.length}
					<!-- Active Cursor Indicator -->
					<span
						bind:this={cursorEl}
						class="relative inline-block text-slate-100 bg-amber-400/25 border-l-2 border-amber-400 animate-cursor font-semibold"
					>
						{char}
					</span>
				{:else}
					<span class="text-slate-500 opacity-60">{char}</span>
				{/if}
			{/each}
		</div>

		<!-- Hidden Input that captures all keystrokes and supports mobile keyboards -->
		<input
			bind:this={inputEl}
			type="text"
			value={typed}
			oninput={handleInput}
			class="absolute inset-0 opacity-0 cursor-text pointer-events-auto w-full h-full"
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			spellcheck="false"
			aria-label="Input pengetikan"
		/>
	</div>

	<!-- Bottom Hint -->
	<div class="flex items-center justify-between px-2 text-xs text-slate-400 font-mono">
		<div class="flex items-center gap-4">
			<span>Karakter benar: <strong class="text-emerald-400">{correctChars}</strong></span>
			<span>Kesalahan: <strong class="text-rose-400">{incorrectChars}</strong></span>
			<span>Total target: <strong>{text.length}</strong></span>
		</div>
		<div class="flex items-center gap-2 text-slate-400">
			<kbd class="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[11px]">Tab</kbd>
			<span>/</span>
			<kbd class="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[11px]">Esc</kbd>
			<span>untuk restart</span>
		</div>
	</div>
</div>
