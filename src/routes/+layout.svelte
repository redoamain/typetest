<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { session, loadSession, setName, clearName } from '$lib/stores/session.svelte';

	let { children } = $props();
	let showNameModal = $state(false);
	let editNameInput = $state('');

	onMount(() => {
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
	<title>SpeedType — Tes Kecepatan Mengetik & Kompetisi</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-400/30 selection:text-amber-200">
	<!-- Navbar Header -->
	<header class="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2.5 text-lg font-extrabold tracking-tight group">
				<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center text-lg shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
					⌨️
				</div>
				<span class="text-white group-hover:text-amber-400 transition">Speed<span class="text-amber-400">Type</span></span>
			</a>

			<!-- Nav Navigation Links -->
			<nav class="flex items-center gap-1 sm:gap-2">
				<a
					href="/"
					class="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition {currentPath === '/' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
				>
					⚡ Tes Mengetik
				</a>
				<a
					href="/competitions"
					class="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition {currentPath.startsWith('/competitions') ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
				>
					🏆 Kompetisi
				</a>
				<a
					href="/admin"
					class="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition {currentPath.startsWith('/admin') ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
				>
					⚙️ Admin
				</a>
			</nav>

			<!-- User session badge -->
			<div class="flex items-center gap-2">
				{#if session.name}
					<button
						type="button"
						onclick={openNameModal}
						class="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 transition"
						title="Klik untuk ubah nama"
					>
						<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
						<span class="truncate max-w-[120px] font-bold text-amber-400">{session.name}</span>
						<span class="text-slate-400 text-[11px]">(ubah)</span>
					</button>
				{:else}
					<button
						type="button"
						onclick={() => (showNameModal = true)}
						class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold transition"
					>
						+ Isi Nama
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
	<footer class="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500">
		<div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
			<p>SpeedType — Aplikasi Tes Kecepatan Mengetik, Admin Panel & Arena Kompetisi</p>
			<p class="font-mono text-[11px] text-slate-600">Tekan <kbd class="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Tab</kbd> untuk reset tes seketika</p>
		</div>
	</footer>

	<!-- Name Edit Modal -->
	{#if showNameModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative" onclick={(e) => e.stopPropagation()}>
				<h3 class="text-lg font-bold text-white mb-2">Ganti Nama Pengetik</h3>
				<p class="text-xs text-slate-400 mb-4">Nama ini akan digunakan pada papan peringkat dan catatan kompetisi.</p>

				<form onsubmit={saveModalName} class="flex flex-col gap-3">
					<input
						type="text"
						bind:value={editNameInput}
						maxlength="30"
						placeholder="Nama baru..."
						class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400 text-sm font-medium"
					/>
					<div class="flex items-center gap-2 mt-2">
						<button
							type="button"
							onclick={() => (showNameModal = false)}
							class="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
						>
							Batal
						</button>
						<button
							type="submit"
							class="flex-1 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow"
						>
							Simpan
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
