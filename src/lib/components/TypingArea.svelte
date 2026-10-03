<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { calculateWpm, calculateAccuracy } from '$lib/engine/metrics';
	import type { TestStatus } from '$lib/types';
	import { RotateCcw, Clock, Zap, Target } from '@lucide/svelte';

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

		if (typed.length >= text.length) {
			finish();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
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
	<!-- Top Live Stats Bar (Shadcn UI style) -->
	<div class="flex items-center justify-between px-6 py-4 bg-card text-card-foreground border border-border rounded-2xl shadow-sm">
		<div class="flex items-center gap-6 sm:gap-8">
			<!-- Timer / Countdown -->
			<div class="flex flex-col">
				<div class="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
					<Clock class="w-3.5 h-3.5 text-primary" />
					<span>{duration > 0 ? 'Waktu' : 'Stopwatch'}</span>
				</div>
				<div class="flex items-baseline gap-1 mt-0.5">
					<span class="text-3xl font-mono font-bold text-primary">
						{duration > 0 ? timeLeft : elapsedSeconds}
					</span>
					<span class="text-xs text-muted-foreground">detik</span>
				</div>
			</div>

			<!-- Live WPM -->
			<div class="flex flex-col">
				<div class="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
					<Zap class="w-3.5 h-3.5 text-emerald-500" />
					<span>Kecepatan</span>
				</div>
				<div class="flex items-baseline gap-1 mt-0.5">
					<span class="text-3xl font-mono font-bold text-emerald-500">
						{currentWpm}
					</span>
					<span class="text-xs text-muted-foreground">WPM</span>
				</div>
			</div>

			<!-- Live Accuracy -->
			<div class="flex flex-col">
				<div class="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
					<Target class="w-3.5 h-3.5 text-sky-500" />
					<span>Akurasi</span>
				</div>
				<div class="flex items-baseline gap-1 mt-0.5">
					<span class="text-3xl font-mono font-bold text-sky-500">
						{currentAccuracy}
					</span>
					<span class="text-xs text-muted-foreground">%</span>
				</div>
			</div>
		</div>

		<!-- Status & Reset Button -->
		<div class="flex items-center gap-3">
			{#if status === 'idle'}
				<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
					Ketik untuk mulai
				</span>
			{:else if status === 'running'}
				<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
					Mengetik...
				</span>
			{:else}
				<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
					Selesai
				</span>
			{/if}

			<button
				type="button"
				onclick={reset}
				class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-xl border border-border transition shadow-sm"
				title="Ulangi Tes (Tab / Esc)"
			>
				<RotateCcw class="w-3.5 h-3.5" />
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
		class="relative p-8 min-h-[220px] max-h-[340px] overflow-y-auto bg-card text-card-foreground hover:border-primary/40 focus-within:border-primary border-2 border-border rounded-2xl cursor-text transition shadow-sm select-none"
	>
		<div class="font-mono text-2xl leading-relaxed tracking-wide select-none break-words">
			{#each text as char, i}
				{#if i < typed.length}
					{#if typed[i] === char}
						<span class="text-emerald-600 dark:text-emerald-400 font-medium transition-colors duration-75">{char}</span>
					{:else}
						<span class="text-rose-600 dark:text-rose-400 bg-rose-500/15 rounded px-0.5 border-b-2 border-rose-500">{char}</span>
					{/if}
				{:else if i === typed.length}
					<!-- Active Cursor Indicator -->
					<span
						bind:this={cursorEl}
						class="relative inline-block text-foreground bg-primary/25 border-l-2 border-primary animate-cursor font-semibold"
					>
						{char}
					</span>
				{:else}
					<span class="text-muted-foreground/60">{char}</span>
				{/if}
			{/each}
		</div>

		<!-- Hidden Input -->
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

	<!-- Bottom Hint & Counters -->
	<div class="flex items-center justify-between px-2 text-xs text-muted-foreground font-mono">
		<div class="flex items-center gap-4">
			<span>Karakter benar: <strong class="text-emerald-600 dark:text-emerald-400 font-semibold">{correctChars}</strong></span>
			<span>Kesalahan: <strong class="text-rose-600 dark:text-rose-400 font-semibold">{incorrectChars}</strong></span>
			<span>Total target: <strong class="text-foreground">{text.length}</strong></span>
		</div>
		<div class="flex items-center gap-1.5">
			<kbd class="px-1.5 py-0.5 bg-muted text-foreground border border-border rounded text-[11px] font-semibold">Tab</kbd>
			<span>/</span>
			<kbd class="px-1.5 py-0.5 bg-muted text-foreground border border-border rounded text-[11px] font-semibold">Esc</kbd>
			<span>untuk restart</span>
		</div>
	</div>
</div>
