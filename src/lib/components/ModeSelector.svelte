<script lang="ts">
	import type { Language, TestMode } from '$lib/types';
	import { Languages, Type, FileText, Clock } from '@lucide/svelte';

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

<div class="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-card border border-border rounded-2xl shadow-sm">
	<!-- Language Selector -->
	<div class="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
		<div class="flex items-center gap-1 pl-1.5 pr-2 text-muted-foreground">
			<Languages class="w-3.5 h-3.5" />
		</div>
		<button
			type="button"
			onclick={() => setLanguage('id')}
			class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {language === 'id' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
		>
			ID
		</button>
		<button
			type="button"
			onclick={() => setLanguage('en')}
			class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {language === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
		>
			EN
		</button>
	</div>

	<div class="w-px h-6 bg-border hidden sm:block"></div>

	<!-- Mode Selector -->
	<div class="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
		<button
			type="button"
			onclick={() => setMode('words')}
			class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition {mode === 'words' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
		>
			<Type class="w-3.5 h-3.5" />
			<span>Kata</span>
		</button>
		<button
			type="button"
			onclick={() => setMode('sentences')}
			class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition {mode === 'sentences' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
		>
			<FileText class="w-3.5 h-3.5" />
			<span>Kalimat & Kutipan</span>
		</button>
	</div>

	<!-- Duration Selector (Only shown for words mode) -->
	{#if mode === 'words'}
		<div class="w-px h-6 bg-border hidden sm:block"></div>
		<div class="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
			<div class="flex items-center gap-1 pl-1.5 pr-1 text-muted-foreground">
				<Clock class="w-3.5 h-3.5" />
			</div>
			{#each [15, 30, 60] as d}
				<button
					type="button"
					onclick={() => setDuration(d)}
					class="px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg transition {duration === d ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
				>
					{d}s
				</button>
			{/each}
		</div>
	{/if}
</div>
