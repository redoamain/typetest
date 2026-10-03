<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import confetti from 'canvas-confetti';
	import TypingArea from '$lib/components/TypingArea.svelte';
	import NameForm from '$lib/components/NameForm.svelte';
	import { session, loadSession } from '$lib/stores/session.svelte';
	import type { CompetitionLeaderboardEntry } from '$lib/types';
	import {
		Trophy,
		Medal,
		Award,
		Clock,
		ArrowLeft,
		CheckCircle2,
		Flag,
		RotateCcw,
		Zap,
		Target,
		Check,
		X
	} from '@lucide/svelte';

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
			class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition mb-4"
		>
			<ArrowLeft class="w-3.5 h-3.5" />
			<span>Kembali ke Daftar Kompetisi</span>
		</a>

		<div class="p-6 sm:p-8 bg-card text-card-foreground border border-border rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div>
				<div class="flex items-center gap-2 mb-2">
					<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase {data.competition.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}">
						<span class="w-1.5 h-1.5 rounded-full {data.competition.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'}"></span>
						<span>{data.competition.status === 'active' ? 'Sedang Berlangsung' : 'Selesai'}</span>
					</span>
					<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-muted text-muted-foreground border border-border">
						<Clock class="w-3.5 h-3.5 text-primary" />
						<span>{data.competition.duration} Detik</span>
					</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
					{data.competition.title}
				</h1>
				{#if data.competition.description}
					<p class="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
						{data.competition.description}
					</p>
				{/if}
			</div>

			<div class="text-right shrink-0">
				<span class="text-2xl font-mono font-bold text-primary block">{data.leaderboard.length}</span>
				<span class="text-xs text-muted-foreground">Total Skor Masuk</span>
			</div>
		</div>
	</div>

	<!-- Typing Area or Result or Closed Notice -->
	{#if !session.ready}
		<div class="py-12 text-center text-muted-foreground text-sm">
			Memuat sesi...
		</div>
	{:else if !session.name}
		<div class="p-6 bg-card border border-border rounded-3xl text-center shadow-sm">
			<NameForm />
		</div>
	{:else if data.competition.status !== 'active'}
		<div class="p-8 bg-card border border-border rounded-3xl text-center shadow-sm">
			<Flag class="w-10 h-10 text-muted-foreground mx-auto mb-3" />
			<h3 class="text-lg font-bold text-foreground mb-1">Kompetisi Ini Telah Berakhir</h3>
			<p class="text-xs text-muted-foreground mb-4">
				Penerimaan skor untuk kompetisi ini sudah ditutup. Lihat podium juara dan papan peringkat akhir di bawah.
			</p>
		</div>
	{:else if submissionResult}
		<!-- Submission Success Card -->
		<div class="p-8 bg-card text-card-foreground border border-primary/30 rounded-3xl text-center shadow-lg">
			<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-4">
				<CheckCircle2 class="w-4 h-4" />
				<span>Skor Kompetisi Tersimpan!</span>
			</div>

			<h2 class="text-2xl font-bold text-foreground mb-1">Kerja Bagus, {session.name}!</h2>
			{#if submissionResult.rank}
				<div class="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary mb-6">
					{#if submissionResult.rank === 1}
						<Trophy class="w-4 h-4 text-amber-500" />
						<span>Kamu memimpin di posisi Juara 1!</span>
					{:else if submissionResult.rank === 2}
						<Medal class="w-4 h-4 text-slate-400" />
						<span>Kamu berada di posisi Podium Juara 2!</span>
					{:else if submissionResult.rank === 3}
						<Medal class="w-4 h-4 text-amber-700" />
						<span>Kamu berada di posisi Podium Juara 3!</span>
					{:else}
						<Award class="w-4 h-4 text-primary" />
						<span>Kamu berada di peringkat #{submissionResult.rank} di papan skor!</span>
					{/if}
				</div>
			{/if}

			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-6 text-center">
				<div class="p-3 bg-muted/40 rounded-2xl border border-border">
					<span class="text-[11px] text-muted-foreground uppercase font-semibold">Kecepatan</span>
					<p class="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{submissionResult.wpm} <span class="text-xs text-muted-foreground">WPM</span></p>
				</div>
				<div class="p-3 bg-muted/40 rounded-2xl border border-border">
					<span class="text-[11px] text-muted-foreground uppercase font-semibold">Akurasi</span>
					<p class="text-2xl font-mono font-bold text-sky-600 dark:text-sky-400">{submissionResult.accuracy}%</p>
				</div>
				<div class="p-3 bg-muted/40 rounded-2xl border border-border">
					<span class="text-[11px] text-muted-foreground uppercase font-semibold">Benar</span>
					<p class="text-2xl font-mono font-bold text-foreground">{submissionResult.correctChars}</p>
				</div>
				<div class="p-3 bg-muted/40 rounded-2xl border border-border">
					<span class="text-[11px] text-muted-foreground uppercase font-semibold">Salah</span>
					<p class="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400">{submissionResult.incorrectChars}</p>
				</div>
			</div>

			<button
				type="button"
				onclick={restart}
				class="py-3 px-8 bg-primary text-primary-foreground font-bold rounded-2xl shadow-sm hover:opacity-90 transition transform active:scale-95 text-sm inline-flex items-center gap-2"
			>
				<RotateCcw class="w-4 h-4" />
				<span>Coba Lagi untuk Perbaiki Skor</span>
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
			<div class="flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-bold text-muted-foreground mb-6">
				<Trophy class="w-4 h-4 text-primary" />
				<span>Podium Juara</span>
			</div>

			<div class="grid grid-cols-3 gap-3 sm:gap-4 items-end max-w-xl mx-auto pt-6 pb-2">
				<!-- 2nd Place (Silver) -->
				<div class="flex flex-col items-center">
					{#if topThree.second}
						<div class="text-center mb-2">
							<Medal class="w-6 h-6 text-slate-400 mx-auto mb-1" />
							<p class="text-xs sm:text-sm font-bold text-foreground truncate max-w-[90px] sm:max-w-[120px]">{topThree.second.userName}</p>
							<p class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{topThree.second.wpm} WPM</p>
						</div>
					{:else}
						<div class="text-xs text-muted-foreground mb-2">—</div>
					{/if}
					<div class="w-full h-24 bg-slate-500/15 border-t-4 border-slate-400 rounded-t-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-extrabold text-xl shadow-sm">
						2
					</div>
				</div>

				<!-- 1st Place (Gold, Highest) -->
				<div class="flex flex-col items-center">
					{#if topThree.first}
						<div class="text-center mb-2">
							<Trophy class="w-7 h-7 text-amber-500 mx-auto mb-1" />
							<p class="text-sm sm:text-base font-extrabold text-primary truncate max-w-[100px] sm:max-w-[140px]">{topThree.first.userName}</p>
							<p class="text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{topThree.first.wpm} WPM</p>
						</div>
					{:else}
						<div class="text-xs text-muted-foreground mb-2">—</div>
					{/if}
					<div class="w-full h-32 bg-amber-500/20 border-t-4 border-amber-500 rounded-t-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold text-3xl shadow-sm">
						1
					</div>
				</div>

				<!-- 3rd Place (Bronze) -->
				<div class="flex flex-col items-center">
					{#if topThree.third}
						<div class="text-center mb-2">
							<Medal class="w-6 h-6 text-amber-700 dark:text-amber-500 mx-auto mb-1" />
							<p class="text-xs sm:text-sm font-bold text-foreground truncate max-w-[90px] sm:max-w-[120px]">{topThree.third.userName}</p>
							<p class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{topThree.third.wpm} WPM</p>
						</div>
					{:else}
						<div class="text-xs text-muted-foreground mb-2">—</div>
					{/if}
					<div class="w-full h-16 bg-amber-700/15 border-t-4 border-amber-700 dark:border-amber-600 rounded-t-2xl flex items-center justify-center text-amber-700 dark:text-amber-500 font-extrabold text-lg shadow-sm">
						3
					</div>
				</div>
			</div>
		</section>

		<!-- Full Leaderboard Table -->
		<section class="p-6 bg-card text-card-foreground border border-border rounded-3xl shadow-sm">
			<div class="flex items-center justify-between pb-4 border-b border-border mb-4">
				<h3 class="text-lg font-bold text-foreground">Papan Peringkat Kompetisi ({data.leaderboard.length})</h3>
				<span class="text-xs text-muted-foreground font-mono">Disortir berdasarkan WPM & Akurasi</span>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead>
						<tr class="text-xs text-muted-foreground uppercase border-b border-border font-mono font-semibold">
							<th class="py-3 px-3">Peringkat</th>
							<th class="py-3 px-3">Nama Peserta</th>
							<th class="py-3 px-3 text-right">WPM</th>
							<th class="py-3 px-3 text-right">Akurasi</th>
							<th class="py-3 px-3 text-right">Karakter</th>
							<th class="py-3 px-3 text-right">Waktu</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/60">
						{#each data.leaderboard as entry, idx (entry.id)}
							<tr class="hover:bg-muted/50 transition {session.name.toLowerCase() === entry.userName.toLowerCase() ? 'bg-primary/5 font-semibold' : ''}">
								<td class="py-3 px-3 font-bold text-sm">
									{#if idx === 0}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
											<Medal class="w-3.5 h-3.5" />
											<span>1</span>
										</span>
									{:else if idx === 1}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/25">
											<Medal class="w-3.5 h-3.5" />
											<span>2</span>
										</span>
									{:else if idx === 2}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-700/15 text-amber-700 dark:text-amber-500 border border-amber-700/25">
											<Medal class="w-3.5 h-3.5" />
											<span>3</span>
										</span>
									{:else}
										<span class="text-muted-foreground font-mono text-xs pl-2">#{idx + 1}</span>
									{/if}
								</td>
								<td class="py-3 px-3 text-foreground">
									<div class="flex items-center gap-1.5">
										<span>{entry.userName}</span>
										{#if session.name.toLowerCase() === entry.userName.toLowerCase()}
											<span class="text-[10px] px-1.5 py-0.2 bg-primary/15 text-primary border border-primary/25 rounded font-semibold">Anda</span>
										{/if}
									</div>
								</td>
								<td class="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
									{entry.wpm}
								</td>
								<td class="py-3 px-3 text-right font-mono text-sky-600 dark:text-sky-400">
									{entry.accuracy}%
								</td>
								<td class="py-3 px-3 text-right font-mono text-muted-foreground text-xs">
									<span class="text-emerald-600 dark:text-emerald-400">{entry.correctChars}</span> / <span class="text-rose-600 dark:text-rose-400">{entry.incorrectChars}</span>
								</td>
								<td class="py-3 px-3 text-right font-mono text-muted-foreground text-xs">
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
