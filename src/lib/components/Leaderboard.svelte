<script lang="ts">
	interface LeaderboardRow {
		id: number;
		userName: string;
		wpm: number;
		accuracy: number;
		duration: number;
		language: string;
		mode: string;
		createdAt: Date | number;
	}

	interface Props {
		entries: LeaderboardRow[];
	}

	let { entries }: Props = $props();

	function getMedal(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}
</script>

<div class="w-full max-w-4xl mx-auto p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur">
	<div class="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
		<span class="text-xl">🏆</span>
		<div>
			<h3 class="text-lg font-bold text-white">Papan Peringkat Global</h3>
			<p class="text-xs text-slate-400">Skor mengetik tercepat sepanjang masa</p>
		</div>
	</div>

	{#if entries.length === 0}
		<div class="py-6 text-center text-slate-500 text-sm">
			Belum ada data skor. Mulai tes untuk mencatatkan rekor pertamamu!
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="text-xs text-slate-400 uppercase border-b border-slate-800/80 font-mono">
						<th class="py-3 px-3">Rank</th>
						<th class="py-3 px-3">Nama</th>
						<th class="py-3 px-3 text-right">WPM</th>
						<th class="py-3 px-3 text-right">Akurasi</th>
						<th class="py-3 px-3 text-right">Durasi</th>
						<th class="py-3 px-3 text-center">Bahasa</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/50">
					{#each entries as entry, i (entry.id)}
						<tr class="hover:bg-slate-800/30 transition">
							<td class="py-3 px-3 font-bold text-base">
								{getMedal(i + 1)}
							</td>
							<td class="py-3 px-3 font-semibold text-slate-200">
								{entry.userName}
							</td>
							<td class="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-base">
								{entry.wpm}
							</td>
							<td class="py-3 px-3 text-right font-mono text-cyan-400">
								{entry.accuracy}%
							</td>
							<td class="py-3 px-3 text-right font-mono text-slate-400">
								{entry.duration}s
							</td>
							<td class="py-3 px-3 text-center">
								<span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase {entry.language === 'id' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}">
									{entry.language}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
