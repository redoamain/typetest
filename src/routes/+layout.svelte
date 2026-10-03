<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { session, loadSession, setName } from '$lib/stores/session.svelte';
	import { defaultAppConfig } from '$lib/config';
	import { themeState, initTheme, toggleTheme } from '$lib/stores/theme.svelte';
	import {
		Keyboard,
		Trophy,
		Settings,
		Sun,
		Moon,
		User,
		X,
		Check,
		Edit3
	} from '@lucide/svelte';

	let { data, children } = $props();
	let showNameModal = $state(false);
	let editNameInput = $state('');

	let appConfig = $derived(data?.appConfig || defaultAppConfig);

	onMount(() => {
		initTheme();
		loadSession();
	});

	function openNameModal() {
		editNameInput = session.name;
		showNameModal = true;
	}

	function saveModalName(e: SubmitEvent) {
		e.preventDefault();
		if (setName(editNameInput)) {
			showNameModal = false;
		}
	}

	let currentPath = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>{appConfig.appName} — {appConfig.companyName}</title>
	<link rel="icon" href={appConfig.logoUrl || '/favicon.svg'} />
</svelte:head>

<div class="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
	<!-- Navbar Header -->
	<header class="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
			<!-- Logo & Company Branding -->
			<a href="/" class="flex items-center gap-3 text-lg font-bold tracking-tight group shrink-0">
				<div class="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center p-1.5 shadow-sm group-hover:border-primary/50 group-hover:scale-105 transition">
					<img
						src={appConfig.logoUrl || '/logo.svg'}
						alt={appConfig.companyName}
						class="w-full h-full object-contain"
					/>
				</div>
				<div class="flex flex-col">
					<span class="text-foreground font-bold leading-tight group-hover:text-primary transition text-sm sm:text-base">
						{appConfig.appName}
					</span>
					<span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
						{appConfig.companyName}
					</span>
				</div>
			</a>

			<!-- Nav Navigation Links -->
			<nav class="flex items-center gap-1 sm:gap-2">
				<a
					href="/"
					class="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition {currentPath === '/' ? 'bg-primary text-primary-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
				>
					<Keyboard class="w-4 h-4" />
					<span>Tes Mengetik</span>
				</a>
				<a
					href="/competitions"
					class="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition {currentPath.startsWith('/competitions') ? 'bg-primary text-primary-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
				>
					<Trophy class="w-4 h-4" />
					<span>Kompetisi</span>
				</a>
				<a
					href="/admin"
					class="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition {currentPath.startsWith('/admin') ? 'bg-primary text-primary-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
				>
					<Settings class="w-4 h-4" />
					<span>Admin</span>
				</a>
			</nav>

			<!-- Right tools: User session badge & Theme Toggle -->
			<div class="flex items-center gap-2">
				<!-- Theme Toggle Button -->
				<button
					type="button"
					onclick={toggleTheme}
					class="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition shadow-sm"
					title={themeState.current === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
					aria-label="Toggle theme"
				>
					{#if themeState.current === 'dark'}
						<Sun class="w-4 h-4 text-amber-400" />
					{:else}
						<Moon class="w-4 h-4 text-slate-700" />
					{/if}
				</button>

				<!-- User Badge -->
				{#if session.name}
					<button
						type="button"
						onclick={openNameModal}
						class="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-muted border border-border rounded-xl text-xs font-medium text-foreground transition shadow-sm"
						title="Ubah nama pengetik"
					>
						<User class="w-3.5 h-3.5 text-primary" />
						<span class="truncate max-w-[110px] font-semibold">{session.name}</span>
						<Edit3 class="w-3 h-3 text-muted-foreground" />
					</button>
				{:else}
					<button
						type="button"
						onclick={() => (showNameModal = true)}
						class="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-semibold transition"
					>
						<User class="w-3.5 h-3.5" />
						<span>Isi Nama</span>
					</button>
				{/if}
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="w-full border-t border-border py-6 text-center text-xs text-muted-foreground bg-card/30">
		<div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<img src={appConfig.logoUrl || '/logo.svg'} alt={appConfig.companyName} class="w-5 h-5 object-contain" />
				<p>{appConfig.appName} &copy; {new Date().getFullYear()} {appConfig.companyName}. {appConfig.tagline}</p>
			</div>
			<p class="font-mono text-[11px] text-muted-foreground">
				Tekan <kbd class="px-1.5 py-0.5 bg-muted border border-border rounded text-foreground font-semibold">Tab</kbd> untuk mengulang tes seketika
			</p>
		</div>
	</footer>

	<!-- Name Edit Modal -->
	{#if showNameModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-xl relative" onclick={(e) => e.stopPropagation()}>
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-base font-bold text-foreground">Ganti Nama Pengetik</h3>
					<button
						type="button"
						onclick={() => (showNameModal = false)}
						class="text-muted-foreground hover:text-foreground transition p-1"
					>
						<X class="w-4 h-4" />
					</button>
				</div>
				<p class="text-xs text-muted-foreground mb-4">Nama ini akan dicatat pada skor tes dan kompetisi.</p>

				<form onsubmit={saveModalName} class="flex flex-col gap-3">
					<input
						type="text"
						bind:value={editNameInput}
						maxlength="30"
						placeholder="Nama baru..."
						class="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition"
					/>
					<div class="flex items-center gap-2 mt-2">
						<button
							type="button"
							onclick={() => (showNameModal = false)}
							class="flex-1 py-2 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl transition"
						>
							Batal
						</button>
						<button
							type="submit"
							class="flex-1 py-2 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-xl transition shadow-sm flex items-center justify-center gap-1"
						>
							<Check class="w-3.5 h-3.5" />
							<span>Simpan</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
