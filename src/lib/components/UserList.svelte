<script lang="ts">
	import type { UserRecord } from '$lib/types';
	import { session, clearName } from '$lib/stores/session.svelte';

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

<section class="w-full max-w-4xl mx-auto mt-12 p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur">
	<div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
		<div class="flex items-center gap-3">
			<span class="text-xl">👥</span>
			<div>
				<h3 class="text-lg font-bold text-white">Daftar Pengguna ({users.length})</h3>
				<p class="text-xs text-slate-400">Pengguna yang pernah mencoba tes mengetik di sistem</p>
			</div>
		</div>

		{#if session.name}
			<button
				type="button"
				onclick={handleClear}
				class="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition"
			>
				Ganti Nama ({session.name})
			</button>
		{/if}
	</div>

	{#if users.length === 0}
		<div class="py-8 text-center text-slate-500 text-sm">
			Belum ada data pengetik. Jadilah yang pertama!
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
			{#each users as u (u.name)}
				<div class="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition {session.name.toLowerCase() === u.name.toLowerCase() ? 'ring-1 ring-amber-400/40 border-amber-400/30' : ''}">
					<div class="flex items-center gap-3 min-w-0">
						<div class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
							{u.name.slice(0, 2).toUpperCase()}
						</div>
						<div class="min-w-0">
							<div class="flex items-center gap-1.5">
								<span class="font-bold text-sm text-slate-200 truncate">{u.name}</span>
								{#if session.name.toLowerCase() === u.name.toLowerCase()}
									<span class="text-[10px] px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-semibold">Anda</span>
								{/if}
							</div>
							<span class="text-xs text-slate-500">{u.testCount}x tes</span>
						</div>
					</div>

					<div class="text-right shrink-0">
						<span class="text-sm font-mono font-bold text-emerald-400">{u.bestWpm}</span>
						<span class="text-[11px] text-slate-500 block">WPM</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
