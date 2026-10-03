<script lang="ts">
	import type { Language, TestMode } from '$lib/types';

	interface Props {
		mode: TestMode;
		language: Language;
		duration: number;
		onchange: (options: { mode: TestMode; language: Language; duration: number }) => void;
	}

	let { mode, language, duration, onchange }: Props = $props();

	function setMode(newMode: TestMode) {
		onchange({ mode: newMode, language, duration });
	}

	function setLanguage(newLang: Language) {
		onchange({ mode, language: newLang, duration });
	}

	function setDuration(newDuration: number) {
		onchange({ mode, language, duration: newDuration });
	}
</script>

<div class="inline-flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg backdrop-blur">
	<!-- Language Selector -->
	<div class="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
		<button
			type="button"
			onclick={() => setLanguage('id')}
			class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {language === 'id' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}"
		>
			🇮🇩 ID
		</button>
		<button
			type="button"
			onclick={() => setLanguage('en')}
			class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {language === 'en' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}"
		>
			🇬🇧 EN
		</button>
	</div>

	<div class="w-px h-6 bg-slate-800 hidden sm:block"></div>

	<!-- Mode Selector -->
	<div class="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
		<button
			type="button"
			onclick={() => setMode('words')}
			class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition {mode === 'words' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}"
		>
			Kata
		</button>
		<button
			type="button"
			onclick={() => setMode('sentences')}
			class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition {mode === 'sentences' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}"
		>
			Kalimat / Kutipan
		</button>
	</div>

	<!-- Duration Selector (Only shown for words mode) -->
	{#if mode === 'words'}
		<div class="w-px h-6 bg-slate-800 hidden sm:block"></div>
		<div class="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
			{#each [15, 30, 60] as d}
				<button
					type="button"
					onclick={() => setDuration(d)}
					class="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition {duration === d ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}"
				>
					{d}s
				</button>
			{/each}
		</div>
	{/if}
</div>
