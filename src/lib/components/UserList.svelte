<script lang="ts">
	import type { UserRecord } from '$lib/types';
	import { session, clearName } from '$lib/stores/session.svelte';
	import { Users, UserCheck } from '@lucide/svelte';

	interface Props {
		users: UserRecord[];
		onchangeName?: () => void;
	}

	let { users, onchangeName }: Props = $props();

	function handleClear() {
		clearName();
		onchangeName?.();
	}
</script>

<section class="w-full max-w-4xl mx-auto mt-4 p-6 bg-card text-card-foreground border border-border rounded-3xl shadow-sm">
	<div class="flex items-center justify-between pb-4 border-b border-border mb-6">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
				<Users class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-lg font-bold text-foreground">Daftar Pengguna ({users.length})</h3>
				<p class="text-xs text-muted-foreground">Pengguna yang pernah mencoba tes mengetik di sistem</p>
			</div>
		</div>

		{#if session.name}
			<button
				type="button"
				onclick={handleClear}
				class="px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-xl border border-border transition shadow-sm"
			>
				Ganti Nama ({session.name})
			</button>
		{/if}
	</div>

	{#if users.length === 0}
		<div class="py-8 text-center text-muted-foreground text-sm">
			Belum ada data pengetik. Jadilah yang pertama!
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
			{#each users as u (u.name)}
				<div class="flex items-center justify-between p-3.5 bg-muted/30 border border-border rounded-2xl hover:border-primary/40 hover:bg-muted/60 transition {session.name.toLowerCase() === u.name.toLowerCase() ? 'ring-1 ring-primary/40 border-primary/40 bg-primary/5' : ''}">
					<div class="flex items-center gap-3 min-w-0">
						<div class="w-9 h-9 rounded-xl bg-secondary text-secondary-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
							{u.name.slice(0, 2).toUpperCase()}
						</div>
						<div class="min-w-0">
							<div class="flex items-center gap-1.5">
								<span class="font-bold text-sm text-foreground truncate">{u.name}</span>
								{#if session.name.toLowerCase() === u.name.toLowerCase()}
									<span class="text-[10px] px-1.5 py-0.2 bg-primary/15 text-primary border border-primary/25 rounded font-semibold">Anda</span>
								{/if}
							</div>
							<span class="text-xs text-muted-foreground">{u.testCount}x tes</span>
						</div>
					</div>

					<div class="text-right shrink-0">
						<span class="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{u.bestWpm}</span>
						<span class="text-[11px] text-muted-foreground block font-mono">WPM</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
