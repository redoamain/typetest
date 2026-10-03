<script lang="ts">
	import { Trophy, Medal } from '@lucide/svelte';

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
</script>

<div class="w-full max-w-4xl mx-auto p-6 bg-card text-card-foreground border border-border rounded-3xl shadow-sm">
	<div class="flex items-center gap-3 pb-4 border-b border-border mb-4">
		<div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
			<Trophy class="w-5 h-5" />
		</div>
		<div>
			<h3 class="text-lg font-bold text-foreground">Papan Peringkat Global</h3>
			<p class="text-xs text-muted-foreground">Skor mengetik tercepat sepanjang masa</p>
		</div>
	</div>

	{#if entries.length === 0}
		<div class="py-6 text-center text-muted-foreground text-sm">
			Belum ada data skor. Mulai tes untuk mencatatkan rekor pertamamu!
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="text-xs text-muted-foreground uppercase border-b border-border font-mono font-semibold">
						<th class="py-3 px-3">Rank</th>
						<th class="py-3 px-3">Nama</th>
						<th class="py-3 px-3 text-right">WPM</th>
						<th class="py-3 px-3 text-right">Akurasi</th>
						<th class="py-3 px-3 text-right">Durasi</th>
						<th class="py-3 px-3 text-center">Bahasa</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border/60">
					{#each entries as entry, i (entry.id)}
						<tr class="hover:bg-muted/50 transition">
							<td class="py-3 px-3 font-bold text-sm">
								{#if i === 0}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
										<Medal class="w-3.5 h-3.5" />
										<span>1</span>
									</span>
								{:else if i === 1}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/25">
										<Medal class="w-3.5 h-3.5" />
										<span>2</span>
									</span>
								{:else if i === 2}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-700/15 text-amber-700 dark:text-amber-500 border border-amber-700/25">
										<Medal class="w-3.5 h-3.5" />
										<span>3</span>
									</span>
								{:else}
									<span class="text-muted-foreground font-mono text-xs pl-2">#{i + 1}</span>
								{/if}
							</td>
							<td class="py-3 px-3 font-semibold text-foreground">
								{entry.userName}
							</td>
							<td class="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
								{entry.wpm}
							</td>
							<td class="py-3 px-3 text-right font-mono text-sky-600 dark:text-sky-400">
								{entry.accuracy}%
							</td>
							<td class="py-3 px-3 text-right font-mono text-muted-foreground">
								{entry.duration}s
							</td>
							<td class="py-3 px-3 text-center">
								<span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase border {entry.language === 'id' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'}">
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
