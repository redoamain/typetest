<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import TypingArea from '$lib/components/TypingArea.svelte';
	import NameForm from '$lib/components/NameForm.svelte';
	import Result from '$lib/components/Result.svelte';
	import ModeSelector from '$lib/components/ModeSelector.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import UserList from '$lib/components/UserList.svelte';
	import { session, loadSession } from '$lib/stores/session.svelte';
	import { addResultToHistory, initHistory } from '$lib/stores/history.svelte';
	import { generateTextFromWords, getRandomSentence } from '$lib/engine/words';
	import type { Language, TestMode, TestResult } from '$lib/types';

	let { data } = $props();

	let mode = $state<TestMode>('words');
	let language = $state<Language>('id');
	let duration = $state<number>(30);
	let result = $state<TestResult | null>(null);
	let round = $state(0);
	let currentText = $state('');

	// Active quote author (for sentences mode)
	let currentAuthor = $state<string | null>(null);

	function prepareNewTest() {
		result = null;
		if (mode === 'words') {
			const dict = (data.words as Record<Language, string[]>)[language];
			currentText = generateTextFromWords(language, 60, dict);
			currentAuthor = null;
		} else {
			const s = getRandomSentence(
				language,
				(data.sentences as Array<{ text: string; author: string | null; language: string; difficulty: string; createdAt: Date | number }>).map((item) => ({
					id: 0,
					text: item.text,
					author: item.author,
					language: item.language as Language,
					difficulty: item.difficulty as 'easy' | 'medium' | 'hard',
					createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now()
				}))
			);
			currentText = s.text;
			currentAuthor = s.author ?? null;
		}
	}

	function handleModeChange(opts: { mode: TestMode; language: Language; duration: number }) {
		mode = opts.mode;
		language = opts.language;
		duration = opts.duration;
		round += 1;
		prepareNewTest();
	}

	async function handleFinish(r: {
		wpm: number;
		accuracy: number;
		correctChars: number;
		incorrectChars: number;
		duration: number;
		timeTaken: number;
		date: string;
	}) {
		const fullResult: TestResult = {
			name: session.name,
			wpm: r.wpm,
			accuracy: r.accuracy,
			correctChars: r.correctChars,
			incorrectChars: r.incorrectChars,
			duration: mode === 'sentences' ? r.timeTaken : r.duration,
			language,
			mode,
			date: r.date
		};

		result = fullResult;
		addResultToHistory(fullResult);

		try {
			await fetch('/api/results', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(fullResult)
			});
			await invalidateAll();
		} catch (err) {
			console.error('Gagal menyimpan hasil tes ke server:', err);
		}
	}

	function restart() {
		round += 1;
		prepareNewTest();
	}

	onMount(() => {
		loadSession();
		initHistory();
		prepareNewTest();
	});
</script>

<div class="flex flex-col items-center gap-8">
	<!-- Hero Header -->
	<div class="text-center max-w-2xl mx-auto pt-2">
		<h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
			Uji Kecepatan <span class="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Mengetikmu</span>
		</h1>
		<p class="text-sm text-slate-400">
			Tingkatkan kecepatan dan akurasi jarimu dengan tes real-time interaktif.
		</p>
	</div>

	<!-- Mode & Duration Selector Bar -->
	{#if session.ready && session.name && !result}
		<ModeSelector
			{mode}
			{language}
			{duration}
			onchange={handleModeChange}
		/>
	{/if}

	<!-- Sentence Author Info (if sentence mode) -->
	{#if mode === 'sentences' && currentAuthor && !result && session.name}
		<div class="text-xs text-slate-400 italic">
			Kutipan oleh: <span class="text-amber-400 font-semibold">{currentAuthor}</span>
		</div>
	{/if}

	<!-- Main Test Section -->
	<div class="w-full">
		{#if !session.ready}
			<div class="py-16 text-center text-slate-500 text-sm">
				Memuat sesi...
			</div>
		{:else if !session.name}
			<NameForm onsaved={prepareNewTest} />
		{:else if result}
			<Result {result} onrestart={restart} />
		{:else}
			{#key round}
				<TypingArea
					text={currentText}
					duration={mode === 'words' ? duration : 0}
					{language}
					{mode}
					onfinish={handleFinish}
					onrestart={restart}
				/>
			{/key}
		{/if}
	</div>

	<!-- Bottom Sections: Leaderboard & User List -->
	<div class="w-full flex flex-col gap-8 mt-4">
		<Leaderboard entries={data.leaderboard} />
		<UserList users={data.users} onchangeName={restart} />
	</div>
</div>
