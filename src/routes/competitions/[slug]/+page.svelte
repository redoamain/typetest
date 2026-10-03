<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import confetti from 'canvas-confetti';
	import TypingArea from '$lib/components/TypingArea.svelte';
	import NameForm from '$lib/components/NameForm.svelte';
	import { session, loadSession } from '$lib/stores/session.svelte';
	import type { CompetitionLeaderboardEntry } from '$lib/types';

	let { data } = $props();

	let round = $state(0);
	let submissionResult = $state<{
		wpm: number;
		accuracy: number;
		correctChars: number;
		incorrectChars: number;
		timeTaken: number;
		rank?: number;
	} | null>(null);

	let isSubmitting = $state(false);

	let topThree = $derived.by(() => {
		const list = data.leaderboard;
		return {
			first: list[0] ?? null,
			second: list[1] ?? null,
			third: list[2] ?? null
		};
	});

	async function handleFinish(r: {
		wpm: number;
		accuracy: number;
		correctChars: number;
		incorrectChars: number;
		duration: number;
		timeTaken: number;
		date: string;
	}) {
		if (data.competition.status !== 'active') return;

		isSubmitting = true;
		try {
			const res = await fetch(`/api/competitions/${data.competition.id}/entry`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: session.name,
					wpm: r.wpm,
					accuracy: r.accuracy,
					correctChars: r.correctChars,
					incorrectChars: r.incorrectChars,
					timeTaken: r.timeTaken
				})
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.message || 'Gagal mengirim skor');

			// Find our rank in returned leaderboard
			const userEntry = json.leaderboard?.find(
				(e: CompetitionLeaderboardEntry) =>
					e.userName.toLowerCase() === session.name.toLowerCase() && e.wpm === r.wpm
			);

			submissionResult = {
				wpm: r.wpm,
				accuracy: r.accuracy,
				correctChars: r.correctChars,
				incorrectChars: r.incorrectChars,
				timeTaken: r.timeTaken,
				rank: userEntry?.rank
			};

			// Fire festive celebration
			confetti({
				particleCount: 100,
				spread: 80,
				origin: { y: 0.6 }
			});

			await invalidateAll();
		} catch (err) {
			console.error('Submission error:', err);
		} finally {
			isSubmitting = false;
		}
	}

	function restart() {
		submissionResult = null;
		round += 1;
	}

	onMount(() => {
		loadSession();
	});
</script>

<svelte:head>
	<title>{data.competition.title} — Arena Kompetisi</title>
</svelte:head>

<div class="flex flex-col gap-8 max-w-4xl mx-auto">
	<!-- Back link & Header Banner -->
	<div>
		<a
			href="/competitions"
			class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition mb-4"
		>
			<span>←</span>
			<span>Kembali ke Daftar Kompetisi</span>
		</a>

		<div class="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div>
				<div class="flex items-center gap-2 mb-2">
					<span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase {data.competition.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}">
						{data.competition.status === 'active' ? '🟢 Sedang Berlangsung' : '⚪ Selesai'}
					</span>
					<span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-950 text-slate-400 border border-slate-800">
						⏱️ {data.competition.duration} Detik
					</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-1">
					{data.competition.title}
				</h1>
				{#if data.competition.description}
					<p class="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
						{data.competition.description}
					</p>
				{/if}
			</div>

			<div class="text-right shrink-0">
				<span class="text-2xl font-mono font-bold text-amber-400 block">{data.leaderboard.length}</span>
				<span class="text-xs text-slate-500">Total Skor Masuk</span>
			</div>
		</div>
	</div>

	<!-- Typing Area or Result or Closed Notice -->
	{#if !session.ready}
		<div class="py-12 text-center text-slate-500 text-sm">
			Memuat sesi...
		</div>
	{:else if !session.name}
		<div class="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl text-center">
			<NameForm />
		</div>
	{:else if data.competition.status !== 'active'}
		<div class="p-8 bg-slate-900/80 border border-slate-800 rounded-3xl text-center">
			<span class="text-4xl mb-3 block">🏁</span>
			<h3 class="text-lg font-bold text-white mb-1">Kompetisi Ini Telah Berakhir</h3>
			<p class="text-xs text-slate-400 mb-4">
				Penerimaan skor untuk kompetisi ini sudah ditutup. Lihat podium juara dan papan peringkat akhir di bawah.
			</p>
		</div>
	{:else if submissionResult}
		<!-- Submission Success Card -->
		<div class="p-8 bg-slate-900 border border-amber-500/30 rounded-3xl text-center shadow-2xl backdrop-blur">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-4">
				<span>✓ Skor Kompetisi Tersimpan!</span>
			</div>

			<h2 class="text-2xl font-bold text-white mb-1">Kerja Bagus, {session.name}!</h2>
			{#if submissionResult.rank}
				<p class="text-sm font-semibold text-amber-400 mb-6">
					{#if submissionResult.rank === 1}
						🥇 Kamu memimpin di posisi Juara 1!
					{:else if submissionResult.rank === 2}
						🥈 Kamu berada di posisi Podium Juara 2!
					{:else if submissionResult.rank === 3}
						🥉 Kamu berada di posisi Podium Juara 3!
					{:else}
						🏅 Kamu berada di peringkat #{submissionResult.rank} di papan skor!
					{/if}
				</p>
			{/if}

			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-6 text-center">
				<div class="p-3 bg-slate-950 rounded-2xl border border-slate-800">
					<span class="text-[11px] text-slate-400 uppercase font-semibold">Kecepatan</span>
					<p class="text-2xl font-mono font-bold text-emerald-400">{submissionResult.wpm} <span class="text-xs text-slate-500">WPM</span></p>
				</div>
				<div class="p-3 bg-slate-950 rounded-2xl border border-slate-800">
					<span class="text-[11px] text-slate-400 uppercase font-semibold">Akurasi</span>
					<p class="text-2xl font-mono font-bold text-cyan-400">{submissionResult.accuracy}%</p>
				</div>
				<div class="p-3 bg-slate-950 rounded-2xl border border-slate-800">
					<span class="text-[11px] text-slate-400 uppercase font-semibold">Benar</span>
					<p class="text-2xl font-mono font-bold text-slate-200">{submissionResult.correctChars}</p>
				</div>
				<div class="p-3 bg-slate-950 rounded-2xl border border-slate-800">
					<span class="text-[11px] text-slate-400 uppercase font-semibold">Salah</span>
					<p class="text-2xl font-mono font-bold text-rose-400">{submissionResult.incorrectChars}</p>
				</div>
			</div>

			<button
				type="button"
				onclick={restart}
				class="py-3 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 text-sm"
			>
				Coba Lagi untuk Perbaiki Skor
			</button>
		</div>
	{:else}
		<!-- Active Test Arena -->
		{#key round}
			<TypingArea
				text={data.competition.customText}
				duration={data.competition.duration}
				mode="competition"
				onfinish={handleFinish}
				onrestart={restart}
			/>
		{/key}
	{/if}

	<!-- Podium Top 3 Display -->
	{#if data.leaderboard.length > 0}
		<section class="mt-6">
			<h3 class="text-center text-sm uppercase tracking-wider font-bold text-slate-400 mb-6">
				🏆 Podium Juara
			</h3>

			<div class="grid grid-cols-3 gap-3 sm:gap-4 items-end max-w-xl mx-auto pt-6 pb-2">
				<!-- 2nd Place (Silver) -->
				<div class="flex flex-col items-center">
					{#if topThree.second}
						<div class="text-center mb-2">
							<span class="text-2xl">🥈</span>
							<p class="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px] sm:max-w-[120px]">{topThree.second.userName}</p>
							<p class="text-xs font-mono font-bold text-emerald-400">{topThree.second.wpm} WPM</p>
						</div>
					{:else}
						<div class="text-xs text-slate-600 mb-2">—</div>
					{/if}
					<div class="w-full h-24 bg-gradient-to-t from-slate-800 to-slate-700/60 rounded-t-2xl flex items-center justify-center border-t-2 border-slate-400 text-slate-300 font-extrabold text-xl">
						2
					</div>
				</div>

				<!-- 1st Place (Gold, Highest) -->
				<div class="flex flex-col items-center">
					{#if topThree.first}
						<div class="text-center mb-2">
							<span class="text-3xl">🥇</span>
							<p class="text-sm sm:text-base font-extrabold text-amber-400 truncate max-w-[100px] sm:max-w-[140px]">{topThree.first.userName}</p>
							<p class="text-sm font-mono font-extrabold text-emerald-400">{topThree.first.wpm} WPM</p>
						</div>
					{:else}
						<div class="text-xs text-slate-600 mb-2">—</div>
					{/if}
					<div class="w-full h-32 bg-gradient-to-t from-amber-600/30 to-amber-500/20 rounded-t-2xl flex items-center justify-center border-t-2 border-amber-400 text-amber-400 font-extrabold text-3xl shadow-lg shadow-amber-500/10">
						1
					</div>
				</div>

				<!-- 3rd Place (Bronze) -->
				<div class="flex flex-col items-center">
					{#if topThree.third}
						<div class="text-center mb-2">
							<span class="text-2xl">🥉</span>
							<p class="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px] sm:max-w-[120px]">{topThree.third.userName}</p>
							<p class="text-xs font-mono font-bold text-emerald-400">{topThree.third.wpm} WPM</p>
						</div>
					{:else}
						<div class="text-xs text-slate-600 mb-2">—</div>
					{/if}
					<div class="w-full h-16 bg-gradient-to-t from-slate-800 to-amber-900/30 rounded-t-2xl flex items-center justify-center border-t-2 border-amber-700 text-amber-600 font-extrabold text-lg">
						3
					</div>
				</div>
			</div>
		</section>

		<!-- Full Leaderboard Table -->
		<section class="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl">
			<div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
				<h3 class="text-lg font-bold text-white">Papan Peringkat Kompetisi ({data.leaderboard.length})</h3>
				<span class="text-xs text-slate-400 font-mono">Disortir berdasarkan WPM & Akurasi</span>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead>
						<tr class="text-xs text-slate-400 uppercase border-b border-slate-800/80 font-mono">
							<th class="py-3 px-3">Peringkat</th>
							<th class="py-3 px-3">Nama Peserta</th>
							<th class="py-3 px-3 text-right">WPM</th>
							<th class="py-3 px-3 text-right">Akurasi</th>
							<th class="py-3 px-3 text-right">Karakter</th>
							<th class="py-3 px-3 text-right">Waktu</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/50">
						{#each data.leaderboard as entry, idx (entry.id)}
							<tr class="hover:bg-slate-800/30 transition {session.name.toLowerCase() === entry.userName.toLowerCase() ? 'bg-amber-500/5 font-semibold' : ''}">
								<td class="py-3 px-3 font-bold text-base">
									{#if idx === 0}
										🥇 1
									{:else if idx === 1}
										🥈 2
									{:else if idx === 2}
										🥉 3
									{:else}
										#{idx + 1}
									{/if}
								</td>
								<td class="py-3 px-3 text-slate-200">
									<div class="flex items-center gap-1.5">
										<span>{entry.userName}</span>
										{#if session.name.toLowerCase() === entry.userName.toLowerCase()}
											<span class="text-[10px] px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-semibold">Anda</span>
										{/if}
									</div>
								</td>
								<td class="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-base">
									{entry.wpm}
								</td>
								<td class="py-3 px-3 text-right font-mono text-cyan-400">
									{entry.accuracy}%
								</td>
								<td class="py-3 px-3 text-right font-mono text-slate-400 text-xs">
									<span class="text-emerald-400">{entry.correctChars}</span> / <span class="text-rose-400">{entry.incorrectChars}</span>
								</td>
								<td class="py-3 px-3 text-right font-mono text-slate-400 text-xs">
									{entry.timeTaken}s
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}
</div>
