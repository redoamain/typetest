<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Language, SentenceItem, WordItem, UserRecord, Competition } from '$lib/types';

	let { data } = $props();

	// Auth state
	let passwordInput = $state('');
	let loginError = $state('');
	let isLoggingIn = $state(false);

	// Active Admin Tab
	let activeTab = $state<'branding' | 'words' | 'sentences' | 'users' | 'competitions'>('branding');

	// App & Company Settings state (Citilumb Branding)
	let cfgAppName = $state('Citilumb SpeedType');
	let cfgCompanyName = $state('Citilumb');
	let cfgTagline = $state('');
	let cfgLogoUrl = $state('/logo.svg');
	let cfgDescription = $state('');
	let settingsMessage = $state('');
	let isSavingSettings = $state(false);

	$effect(() => {
		if (data.appConfig) {
			cfgAppName = data.appConfig.appName || 'Citilumb SpeedType';
			cfgCompanyName = data.appConfig.companyName || 'Citilumb';
			cfgTagline = data.appConfig.tagline || '';
			cfgLogoUrl = data.appConfig.logoUrl || '/logo.svg';
			cfgDescription = data.appConfig.description || '';
		}
	});

	async function saveSettingsSubmit(e: SubmitEvent) {
		e.preventDefault();
		isSavingSettings = true;
		settingsMessage = '';
		try {
			const res = await fetch('/api/admin/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					appName: cfgAppName,
					companyName: cfgCompanyName,
					tagline: cfgTagline,
					logoUrl: cfgLogoUrl,
					description: cfgDescription
				})
			});
			if (!res.ok) throw new Error('Gagal menyimpan pengaturan');
			settingsMessage = 'Pengaturan nama dan logo Citilumb berhasil disimpan!';
			setTimeout(() => (settingsMessage = ''), 3500);
			await invalidateAll();
		} catch (err: unknown) {
			settingsMessage = err instanceof Error ? err.message : 'Error';
		} finally {
			isSavingSettings = false;
		}
	}

	function resetDefaultBranding() {
		cfgAppName = 'Citilumb SpeedType';
		cfgCompanyName = 'Citilumb';
		cfgTagline = 'Platform Resmi Tes Kecepatan Mengetik & Turnamen Citilumb';
		cfgLogoUrl = '/logo.svg';
		cfgDescription = 'Tingkatkan akurasi dan kecepatan mengetik seluruh tim dan karyawan Citilumb.';
	}

	// Words management state
	let wordLangFilter = $state<'all' | 'id' | 'en'>('all');
	let wordSearch = $state('');
	let newSingleWord = $state('');
	let newSingleLang = $state<Language>('id');
	let batchWordsText = $state('');
	let batchWordsLang = $state<Language>('id');
	let wordActionMessage = $state('');

	// Sentences management state
	let newSentenceText = $state('');
	let newSentenceAuthor = $state('');
	let newSentenceLang = $state<Language>('id');
	let newSentenceDiff = $state<'easy' | 'medium' | 'hard'>('medium');
	let editingSentenceId = $state<number | null>(null);
	let sentenceActionMessage = $state('');

	// Competitions management state
	let newCompTitle = $state('');
	let newCompDesc = $state('');
	let newCompText = $state('');
	let newCompDuration = $state(30);
	let newCompStatus = $state<'active' | 'ended' | 'archived'>('active');
	let compActionMessage = $state('');

	// Filtered words
	let filteredWords = $derived.by(() => {
		let list = data.words;
		if (wordLangFilter !== 'all') {
			list = list.filter((w: { language: string }) => w.language === wordLangFilter);
		}
		if (wordSearch.trim()) {
			const q = wordSearch.trim().toLowerCase();
			list = list.filter((w: { word: string }) => w.word.toLowerCase().includes(q));
		}
		return list;
	});

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loginError = '';
		isLoggingIn = true;
		try {
			const res = await fetch('/api/admin/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: passwordInput })
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Password admin salah');
			}
			passwordInput = '';
			await invalidateAll();
		} catch (err: unknown) {
			loginError = err instanceof Error ? err.message : 'Login gagal';
		} finally {
			isLoggingIn = false;
		}
	}

	async function handleLogout() {
		await fetch('/api/admin/auth', { method: 'DELETE' });
		await invalidateAll();
	}

	// Word Actions
	async function addSingleWordSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!newSingleWord.trim()) return;
		try {
			const res = await fetch('/api/words', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ word: newSingleWord, language: newSingleLang })
			});
			if (!res.ok) throw new Error('Gagal menambah kata');
			newSingleWord = '';
			wordActionMessage = 'Kata berhasil ditambahkan!';
			setTimeout(() => (wordActionMessage = ''), 3000);
			await invalidateAll();
		} catch (err: unknown) {
			wordActionMessage = err instanceof Error ? err.message : 'Error';
		}
	}

	async function addBatchWordsSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!batchWordsText.trim()) return;
		try {
			const res = await fetch('/api/words', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ batch: batchWordsText, language: batchWordsLang })
			});
			const d = await res.json();
			if (!res.ok) throw new Error(d.message || 'Gagal batch kata');
			batchWordsText = '';
			wordActionMessage = `Berhasil menambahkan ${d.addedCount ?? 0} kata baru!`;
			setTimeout(() => (wordActionMessage = ''), 4000);
			await invalidateAll();
		} catch (err: unknown) {
			wordActionMessage = err instanceof Error ? err.message : 'Error';
		}
	}

	async function removeWord(id: number) {
		if (!confirm('Yakin ingin menghapus kata ini?')) return;
		try {
			await fetch('/api/words', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			await invalidateAll();
		} catch (err) {
			console.error(err);
		}
	}

	async function resetWords() {
		if (!confirm('Peringatan: Ini akan mengembalikan seluruh kata ke kamus default bawaan. Lanjutkan?')) return;
		try {
			await fetch('/api/admin/reset-words', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
			wordActionMessage = 'Kata berhasil direset ke bawaan!';
			setTimeout(() => (wordActionMessage = ''), 3000);
			await invalidateAll();
		} catch (err) {
			console.error(err);
		}
	}

	// Sentence Actions
	async function saveSentenceSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!newSentenceText.trim()) return;
		try {
			if (editingSentenceId) {
				await fetch('/api/sentences', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: editingSentenceId,
						text: newSentenceText,
						author: newSentenceAuthor,
						language: newSentenceLang,
						difficulty: newSentenceDiff
					})
				});
				sentenceActionMessage = 'Kalimat berhasil diperbarui!';
			} else {
				await fetch('/api/sentences', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						text: newSentenceText,
						author: newSentenceAuthor,
						language: newSentenceLang,
						difficulty: newSentenceDiff
					})
				});
				sentenceActionMessage = 'Kalimat baru berhasil disimpan!';
			}
			newSentenceText = '';
			newSentenceAuthor = '';
			editingSentenceId = null;
			setTimeout(() => (sentenceActionMessage = ''), 3000);
			await invalidateAll();
		} catch (err: unknown) {
			sentenceActionMessage = err instanceof Error ? err.message : 'Error';
		}
	}

	function startEditSentence(s: { id: number; text: string; author: string | null; language: string; difficulty: string }) {
		editingSentenceId = s.id;
		newSentenceText = s.text;
		newSentenceAuthor = s.author || '';
		newSentenceLang = s.language as Language;
		newSentenceDiff = s.difficulty as 'easy' | 'medium' | 'hard';
		window.scrollTo({ top: 100, behavior: 'smooth' });
	}

	function cancelEditSentence() {
		editingSentenceId = null;
		newSentenceText = '';
		newSentenceAuthor = '';
	}

	async function removeSentence(id: number) {
		if (!confirm('Hapus kalimat ini?')) return;
		try {
			await fetch('/api/sentences', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			await invalidateAll();
		} catch (err) {
			console.error(err);
		}
	}

	// User Actions
	async function removeUser(id: number, name: string) {
		if (!confirm(`Hapus pengguna "${name}" beserta seluruh riwayat tesnya?`)) return;
		try {
			await fetch('/api/admin/users', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			await invalidateAll();
		} catch (err) {
			console.error(err);
		}
	}

	// Competition Actions
	async function createCompetitionSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!newCompTitle.trim() || !newCompText.trim()) return;

		try {
			const res = await fetch('/api/competitions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: newCompTitle,
					description: newCompDesc,
					customText: newCompText,
					duration: newCompDuration,
					status: newCompStatus
				})
			});
			if (!res.ok) throw new Error('Gagal membuat kompetisi');
			newCompTitle = '';
			newCompDesc = '';
			newCompText = '';
			compActionMessage = 'Kompetisi berhasil dibuat!';
			setTimeout(() => (compActionMessage = ''), 3000);
			await invalidateAll();
		} catch (err: unknown) {
			compActionMessage = err instanceof Error ? err.message : 'Error';
		}
	}

	async function updateCompStatus(id: number, status: 'active' | 'ended' | 'archived') {
		try {
			await fetch('/api/competitions', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, status })
			});
			await invalidateAll();
		} catch (err) {
			console.error(err);
		}
	}

	async function removeCompetition(id: number) {
		if (!confirm('Hapus kompetisi ini? Semua skor dan entri peserta akan terhapus.')) return;
		try {
			await fetch('/api/competitions', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			await invalidateAll();
		} catch (err) {
			console.error(err);
		}
	}
</script>

<svelte:head>
	<title>Admin Panel — SpeedType</title>
</svelte:head>

<div class="max-w-6xl mx-auto flex flex-col gap-8">
	{#if !data.isAuthenticated}
		<!-- Login Card -->
		<div class="max-w-md mx-auto w-full my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center">
			<div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl">
				🔒
			</div>
			<h2 class="text-2xl font-bold text-white mb-2">Admin Panel</h2>
			<p class="text-xs text-slate-400 mb-6">
				Masuk untuk mengatur kamus kata, kalimat, quotes, daftar pengguna, dan event kompetisi.
			</p>

			<form onsubmit={handleLogin} class="flex flex-col gap-4 text-left">
				<div>
					<label for="admin-pass" class="block text-xs font-semibold text-slate-300 uppercase mb-2">Password Admin</label>
					<input
						id="admin-pass"
						type="password"
						bind:value={passwordInput}
						placeholder="Masukkan password admin..."
						class="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white rounded-2xl text-sm outline-none transition"
					/>
					<p class="text-[11px] text-slate-400 mt-1.5">Default password: <code class="text-amber-400 bg-slate-800 px-1 py-0.5 rounded">admin123</code></p>
				</div>

				{#if loginError}
					<p class="text-xs text-rose-400 font-semibold">{loginError}</p>
				{/if}

				<button
					type="submit"
					disabled={isLoggingIn}
					class="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
				>
					{isLoggingIn ? 'Memverifikasi...' : 'Masuk Panel Admin'}
				</button>
			</form>
		</div>
	{:else}
		<!-- Authenticated Admin Dashboard -->
		<div class="flex flex-col gap-6">
			<!-- Header & Logout -->
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
				<div>
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold mb-2">
						<span>⚡ Admin Mode</span>
					</div>
					<h1 class="text-2xl sm:text-3xl font-bold text-white">Pusat Kendali Admin</h1>
					<p class="text-xs text-slate-400">Kelola kata, kutipan/kalimat, pengguna, dan kompetisi secara langsung.</p>
				</div>

				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={handleLogout}
						class="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition"
					>
						Keluar (Logout)
					</button>
				</div>
			</div>

			<!-- Quick Stats Row -->
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
					<span class="text-xs text-slate-400">Total Kata Tersimpan</span>
					<p class="text-2xl font-mono font-bold text-amber-400 mt-1">{data.words.length}</p>
				</div>
				<div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
					<span class="text-xs text-slate-400">Total Kalimat / Quotes</span>
					<p class="text-2xl font-mono font-bold text-cyan-400 mt-1">{data.sentences.length}</p>
				</div>
				<div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
					<span class="text-xs text-slate-400">Total Pengetik Terdaftar</span>
					<p class="text-2xl font-mono font-bold text-emerald-400 mt-1">{data.users.length}</p>
				</div>
				<div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
					<span class="text-xs text-slate-400">Total Kompetisi</span>
					<p class="text-2xl font-mono font-bold text-purple-400 mt-1">{data.competitions.length}</p>
				</div>
			</div>

			<!-- Navigation Tabs -->
			<div class="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
				<button
					type="button"
					onclick={() => (activeTab = 'branding')}
					class="px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap {activeTab === 'branding' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
				>
					🏢 Branding & Logo Citilumb
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'words')}
					class="px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap {activeTab === 'words' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
				>
					🔤 Kelola Kata ({data.words.length})
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'sentences')}
					class="px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap {activeTab === 'sentences' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
				>
					📜 Kelola Kalimat ({data.sentences.length})
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'users')}
					class="px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap {activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
				>
					👥 Pengguna ({data.users.length})
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'competitions')}
					class="px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap {activeTab === 'competitions' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
				>
					🏆 Kompetisi ({data.competitions.length})
				</button>
			</div>

			<!-- TAB 0: BRANDING & LOGO MANAGEMENT (CITILUMB) -->
			{#if activeTab === 'branding'}
				<div class="flex flex-col gap-6">
					{#if settingsMessage}
						<div class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl text-center">
							{settingsMessage}
						</div>
					{/if}

					<div class="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-2">
							<div>
								<h3 class="text-lg font-bold text-white">🏢 Pengaturan Identitas & Logo Citilumb</h3>
								<p class="text-xs text-slate-400">Atur nama aplikasi, nama perusahaan, slogan, dan logo yang tampil di seluruh sistem.</p>
							</div>
							<button
								type="button"
								onclick={resetDefaultBranding}
								class="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition self-start sm:self-auto"
							>
								Reset ke Default Citilumb
							</button>
						</div>

						<form onsubmit={saveSettingsSubmit} class="flex flex-col gap-5">
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label for="cfg-app-name" class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Nama Aplikasi</label>
									<input
										id="cfg-app-name"
										type="text"
										bind:value={cfgAppName}
										placeholder="Misal: Citilumb SpeedType"
										class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400"
										required
									/>
								</div>
								<div>
									<label for="cfg-comp-name" class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Nama Perusahaan</label>
									<input
										id="cfg-comp-name"
										type="text"
										bind:value={cfgCompanyName}
										placeholder="Misal: Citilumb"
										class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400"
										required
									/>
								</div>
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label for="cfg-logo-url" class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">URL / Path Logo</label>
									<input
										id="cfg-logo-url"
										type="text"
										bind:value={cfgLogoUrl}
										placeholder="Misal: /logo.svg atau https://..."
										class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 font-mono"
										required
									/>
									<span class="text-[11px] text-slate-500 mt-1 block">Default: <code class="text-amber-400">/logo.svg</code> (tersedia logo Citilumb bawaan)</span>
								</div>
								<div>
									<label for="cfg-tagline" class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Slogan / Tagline</label>
									<input
										id="cfg-tagline"
										type="text"
										bind:value={cfgTagline}
										placeholder="Misal: Platform Resmi Tes Kecepatan Mengetik & Turnamen Citilumb"
										class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400"
									/>
								</div>
							</div>

							<div>
								<label for="cfg-desc" class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Deskripsi Perusahaan / Pengantar</label>
								<textarea
									id="cfg-desc"
									bind:value={cfgDescription}
									rows="2"
									placeholder="Deskripsi singkat mengenai tes mengetik untuk karyawan Citilumb..."
									class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 resize-none"
								></textarea>
							</div>

							<!-- Live Preview Card -->
							<div class="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
								<span class="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-3">Live Preview Tampilan Navbar & Logo</span>
								<div class="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl max-w-md">
									<div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
										<img
											src={cfgLogoUrl || '/logo.svg'}
											alt={cfgCompanyName}
											class="w-full h-full object-contain"
										/>
									</div>
									<div class="flex flex-col min-w-0">
										<span class="text-white font-bold text-sm truncate">{cfgAppName || 'Nama Aplikasi'}</span>
										<span class="text-[10px] uppercase tracking-wider text-amber-400 font-bold truncate">{cfgCompanyName || 'Nama Perusahaan'}</span>
									</div>
								</div>
							</div>

							<div class="flex items-center justify-end gap-3 pt-2">
								<button
									type="submit"
									disabled={isSavingSettings}
									class="py-3 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 text-sm disabled:opacity-50"
								>
									{isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Citilumb'}
								</button>
							</div>
						</form>
					</div>
				</div>
			{/if}

			<!-- TAB 1: WORDS MANAGEMENT -->
			{#if activeTab === 'words'}
				<div class="flex flex-col gap-6">
					{#if wordActionMessage}
						<div class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl text-center">
							{wordActionMessage}
						</div>
					{/if}

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- Add Single Word -->
						<div class="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl">
							<h3 class="text-base font-bold text-white mb-3">➕ Tambah Satu Kata</h3>
							<form onsubmit={addSingleWordSubmit} class="flex flex-col gap-3">
								<div class="flex gap-2">
									<input
										type="text"
										bind:value={newSingleWord}
										placeholder="Misal: kecepatan"
										class="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400"
									/>
									<select
										bind:value={newSingleLang}
										class="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 font-semibold"
									>
										<option value="id">ID</option>
										<option value="en">EN</option>
									</select>
								</div>
								<button
									type="submit"
									class="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition"
								>
									Tambah Kata
								</button>
							</form>
						</div>

						<!-- Add Words Batch -->
						<div class="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl">
							<h3 class="text-base font-bold text-white mb-3">📦 Tambah Kata Massal (Batch)</h3>
							<form onsubmit={addBatchWordsSubmit} class="flex flex-col gap-3">
								<textarea
									bind:value={batchWordsText}
									rows="2"
									placeholder="Paste kata-kata di sini dipisahkan spasi atau koma..."
									class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 resize-none font-mono"
								></textarea>
								<div class="flex items-center justify-between gap-3">
									<select
										bind:value={batchWordsLang}
										class="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 font-semibold"
									>
										<option value="id">Bahasa Indonesia</option>
										<option value="en">English</option>
									</select>
									<button
										type="submit"
										class="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition"
									>
										Import Massal
									</button>
								</div>
							</form>
						</div>
					</div>

					<!-- Search, Filter & List -->
					<div class="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl flex flex-col gap-4">
						<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={() => (wordLangFilter = 'all')}
									class="px-3 py-1.5 text-xs font-semibold rounded-lg {wordLangFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}"
								>
									Semua
								</button>
								<button
									type="button"
									onclick={() => (wordLangFilter = 'id')}
									class="px-3 py-1.5 text-xs font-semibold rounded-lg {wordLangFilter === 'id' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}"
								>
									🇮🇩 Indonesia
								</button>
								<button
									type="button"
									onclick={() => (wordLangFilter = 'en')}
									class="px-3 py-1.5 text-xs font-semibold rounded-lg {wordLangFilter === 'en' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}"
								>
									🇬🇧 English
								</button>
							</div>

							<div class="flex items-center gap-2">
								<input
									type="text"
									bind:value={wordSearch}
									placeholder="Cari kata..."
									class="px-3.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-amber-400"
								/>
								<button
									type="button"
									onclick={resetWords}
									class="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition whitespace-nowrap"
									title="Kembalikan semua kata ke kamus awal"
								>
									Reset Default
								</button>
							</div>
						</div>

						<!-- Words Cloud / List -->
						<div class="flex flex-wrap gap-2 max-h-[420px] overflow-y-auto p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
							{#each filteredWords as w (w.id)}
								<div class="group inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-mono text-slate-200 transition">
									<span class="text-[10px] text-amber-400 font-bold uppercase">{w.language}</span>
									<span>{w.word}</span>
									<button
										type="button"
										onclick={() => removeWord(w.id)}
										class="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 ml-1 text-xs transition"
										title="Hapus kata"
									>
										✕
									</button>
								</div>
							{:else}
								<div class="w-full py-8 text-center text-slate-500 text-sm">
									Tidak ada kata yang sesuai dengan pencarian atau filter.
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			<!-- TAB 2: SENTENCES MANAGEMENT -->
			{#if activeTab === 'sentences'}
				<div class="flex flex-col gap-6">
					{#if sentenceActionMessage}
						<div class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl text-center">
							{sentenceActionMessage}
						</div>
					{/if}

					<!-- Add / Edit Sentence Form -->
					<div class="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl">
						<h3 class="text-base font-bold text-white mb-3">
							{editingSentenceId ? '✏️ Edit Kalimat / Kutipan' : '➕ Tambah Kalimat / Kutipan Baru'}
						</h3>

						<form onsubmit={saveSentenceSubmit} class="flex flex-col gap-4">
							<div>
								<label for="sentence-text" class="block text-xs font-semibold text-slate-300 uppercase mb-1">Teks Kalimat</label>
								<textarea
									id="sentence-text"
									bind:value={newSentenceText}
									rows="3"
									placeholder="Tulis kalimat inspiratif atau teks latihan..."
									class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 resize-none font-mono"
									required
								></textarea>
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div>
									<label for="sentence-author" class="block text-xs font-semibold text-slate-300 uppercase mb-1">Penulis / Tokoh (Opsional)</label>
									<input
										id="sentence-author"
										type="text"
										bind:value={newSentenceAuthor}
										placeholder="Misal: B.J. Habibie"
										class="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400"
									/>
								</div>

								<div>
									<label for="sentence-lang" class="block text-xs font-semibold text-slate-300 uppercase mb-1">Bahasa</label>
									<select
										id="sentence-lang"
										bind:value={newSentenceLang}
										class="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 font-semibold"
									>
										<option value="id">Bahasa Indonesia</option>
										<option value="en">English</option>
									</select>
								</div>

								<div>
									<label for="sentence-diff" class="block text-xs font-semibold text-slate-300 uppercase mb-1">Tingkat Kesulitan</label>
									<select
										id="sentence-diff"
										bind:value={newSentenceDiff}
										class="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 font-semibold"
									>
										<option value="easy">Mudah (Easy)</option>
										<option value="medium">Menengah (Medium)</option>
										<option value="hard">Tinggi (Hard)</option>
									</select>
								</div>
							</div>

							<div class="flex items-center gap-3 mt-2">
								{#if editingSentenceId}
									<button
										type="button"
										onclick={cancelEditSentence}
										class="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition"
									>
										Batal Edit
									</button>
								{/if}
								<button
									type="submit"
									class="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition"
								>
									{editingSentenceId ? 'Simpan Perubahan' : 'Tambah Kalimat'}
								</button>
							</div>
						</form>
					</div>

					<!-- Sentences List -->
					<div class="flex flex-col gap-3">
						{#each data.sentences as s (s.id)}
							<div class="p-5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1.5">
										<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {s.language === 'id' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}">
											{s.language}
										</span>
										<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
											{s.difficulty}
										</span>
										{#if s.author}
											<span class="text-xs text-slate-400 italic">— {s.author}</span>
										{/if}
									</div>
									<p class="text-slate-200 text-sm leading-relaxed font-mono">"{s.text}"</p>
								</div>

								<div class="flex items-center gap-2 shrink-0">
									<button
										type="button"
										onclick={() => startEditSentence(s)}
										class="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
									>
										Edit
									</button>
									<button
										type="button"
										onclick={() => removeSentence(s.id)}
										class="px-3 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition"
									>
										Hapus
									</button>
								</div>
							</div>
						{:else}
							<div class="py-12 text-center text-slate-500 text-sm">
								Belum ada kalimat yang tersimpan.
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- TAB 3: USERS & TEST RESULTS -->
			{#if activeTab === 'users'}
				<div class="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl">
					<div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
						<div>
							<h3 class="text-lg font-bold text-white">Daftar Pengguna & Skor ({data.users.length})</h3>
							<p class="text-xs text-slate-400">Pengguna guest yang tersimpan di database SQLite.</p>
						</div>
					</div>

					{#if data.users.length === 0}
						<div class="py-8 text-center text-slate-500 text-sm">
							Belum ada pengguna terdaftar.
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-left text-sm">
								<thead>
									<tr class="text-xs text-slate-400 uppercase border-b border-slate-800/80 font-mono">
										<th class="py-3 px-3">Nama</th>
										<th class="py-3 px-3 text-right">Tes Dilakukan</th>
										<th class="py-3 px-3 text-right">Best WPM</th>
										<th class="py-3 px-3 text-right">Terakhir Aktif</th>
										<th class="py-3 px-3 text-center">Aksi</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-800/50">
									{#each data.users as u (u.id)}
										<tr class="hover:bg-slate-800/30 transition">
											<td class="py-3 px-3 font-semibold text-slate-200">
												{u.name}
											</td>
											<td class="py-3 px-3 text-right font-mono text-slate-300">
												{u.testCount}x
											</td>
											<td class="py-3 px-3 text-right font-mono font-bold text-emerald-400">
												{u.bestWpm} WPM
											</td>
											<td class="py-3 px-3 text-right text-xs text-slate-400">
												{new Date(u.lastUsedAt).toLocaleDateString('id-ID')}
											</td>
											<td class="py-3 px-3 text-center">
												<button
													type="button"
													onclick={() => removeUser(u.id, u.name)}
													class="px-2.5 py-1 text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition"
													title="Hapus pengguna dan semua hasilnya"
												>
													Hapus
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			{/if}

			<!-- TAB 4: COMPETITIONS MANAGEMENT -->
			{#if activeTab === 'competitions'}
				<div class="flex flex-col gap-6">
					{#if compActionMessage}
						<div class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl text-center">
							{compActionMessage}
						</div>
					{/if}

					<!-- Create Competition Form -->
					<div class="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl">
						<h3 class="text-base font-bold text-white mb-3">🏆 Buat Kompetisi Mengetik Baru</h3>
						<form onsubmit={createCompetitionSubmit} class="flex flex-col gap-4">
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label for="comp-title" class="block text-xs font-semibold text-slate-300 uppercase mb-1">Judul Kompetisi</label>
									<input
										id="comp-title"
										type="text"
										bind:value={newCompTitle}
										placeholder="Misal: Kejuaraan Mengetik Nasional 2026"
										class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400"
										required
									/>
								</div>
								<div>
									<label for="comp-duration" class="block text-xs font-semibold text-slate-300 uppercase mb-1">Durasi Tes (Detik)</label>
									<input
										id="comp-duration"
										type="number"
										min="10"
										max="300"
										bind:value={newCompDuration}
										class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 font-mono"
										required
									/>
								</div>
							</div>

							<div>
								<label for="comp-desc" class="block text-xs font-semibold text-slate-300 uppercase mb-1">Deskripsi / Peraturan Singkat</label>
								<input
									id="comp-desc"
									type="text"
									bind:value={newCompDesc}
									placeholder="Misal: Ketik teks berikut secepat dan seakurat mungkin untuk memperebutkan podium!"
									class="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400"
								/>
							</div>

							<div>
								<label for="comp-text" class="block text-xs font-semibold text-slate-300 uppercase mb-1">Teks Seragam Kompetisi (Exact Text yang Diketik Semua Peserta)</label>
								<textarea
									id="comp-text"
									bind:value={newCompText}
									rows="3"
									placeholder="Ketik teks yang akan dijadikan materi kompetisi..."
									class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-400 resize-none font-mono"
									required
								></textarea>
							</div>

							<div class="flex items-center justify-between gap-3">
								<div class="flex items-center gap-2">
									<label for="comp-status" class="text-xs font-semibold text-slate-300 uppercase">Status:</label>
									<select
										id="comp-status"
										bind:value={newCompStatus}
										class="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400 font-semibold"
									>
										<option value="active">Aktif (Bisa Diikuti)</option>
										<option value="ended">Selesai (Ditutup)</option>
									</select>
								</div>

								<button
									type="submit"
									class="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition"
								>
									Buat Kompetisi
								</button>
							</div>
						</form>
					</div>

					<!-- Existing Competitions List -->
					<div class="flex flex-col gap-3">
						{#each data.competitions as c (c.id)}
							<div class="p-5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1.5">
										<span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase {c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}">
											{c.status}
										</span>
										<span class="text-xs text-slate-400 font-mono">{c.duration}s</span>
										<span class="text-xs text-slate-500">• {c.entryCount ?? 0} peserta</span>
									</div>
									<h4 class="text-base font-bold text-white mb-1 truncate">{c.title}</h4>
									{#if c.description}
										<p class="text-xs text-slate-400 line-clamp-1 mb-2">{c.description}</p>
									{/if}
									<p class="text-xs text-slate-400 font-mono line-clamp-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
										"{c.customText}"
									</p>
								</div>

								<div class="flex items-center gap-2 shrink-0">
									<a
										href={`/competitions/${c.slug}`}
										target="_blank"
										class="px-3.5 py-2 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl transition"
									>
										Buka Arena ↗
									</a>
									{#if c.status === 'active'}
										<button
											type="button"
											onclick={() => updateCompStatus(c.id, 'ended')}
											class="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
										>
											Tutup
										</button>
									{:else}
										<button
											type="button"
											onclick={() => updateCompStatus(c.id, 'active')}
											class="px-3.5 py-2 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition"
										>
											Aktifkan
										</button>
									{/if}
									<button
										type="button"
										onclick={() => removeCompetition(c.id)}
										class="px-3 py-2 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition"
										title="Hapus kompetisi"
									>
										Hapus
									</button>
								</div>
							</div>
						{:else}
							<div class="py-12 text-center text-slate-500 text-sm">
								Belum ada kompetisi yang dibuat.
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
