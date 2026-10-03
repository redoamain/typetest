<script lang="ts">
	let { data } = $props();

	let activeCompetitions = $derived(
		data.competitions.filter((c: { status: string }) => c.status === 'active')
	);
	let pastCompetitions = $derived(
		data.competitions.filter((c: { status: string }) => c.status !== 'active')
	);
</script>

<svelte:head>
	<title>Arena Kompetisi Mengetik — {data.appConfig?.companyName || 'Citilumb'}</title>
</svelte:head>

<div class="flex flex-col gap-8 max-w-5xl mx-auto">
	<!-- Hero Banner -->
	<div class="p-8 sm:p-10 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-3xl shadow-2xl relative overflow-hidden">
		<div class="relative z-10 max-w-2xl">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-4 border border-amber-400/30">
				<span>🏆 Arena Turnamen Mengetik {data.appConfig?.companyName || 'Citilumb'}</span>
			</div>
			<h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
				Tantang Pengetik Lain di <span class="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Kompetisi Resmi</span>
			</h1>
			<p class="text-sm text-slate-300 leading-relaxed">
				Setiap peserta mengetik materi teks yang sama persis dalam batas waktu yang seragam. Buktikan siapa yang tercepat dan raih podium juara!
			</p>
		</div>

		<!-- Background decorative icon -->
		<div class="absolute -right-6 -bottom-8 text-slate-800/40 text-9xl font-black select-none pointer-events-none">
			🏆
		</div>
	</div>

	<!-- Active Competitions Section -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
				<h2 class="text-xl font-bold text-white">Kompetisi Sedang Berlangsung ({activeCompetitions.length})</h2>
			</div>
		</div>

		{#if activeCompetitions.length === 0}
			<div class="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl text-center text-slate-500 text-sm">
				Belum ada kompetisi aktif saat ini. Anda dapat membuat kompetisi baru melalui <a href="/admin" class="text-amber-400 underline">Admin Panel</a>.
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each activeCompetitions as comp (comp.id)}
					<div class="p-6 bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-3xl shadow-xl transition flex flex-col justify-between group">
						<div>
							<div class="flex items-center justify-between mb-3">
								<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
									<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
									Aktif
								</span>
								<span class="text-xs font-mono text-slate-400 font-semibold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
									⏱️ {comp.duration} Detik
								</span>
							</div>

							<h3 class="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
								{comp.title}
							</h3>

							{#if comp.description}
								<p class="text-xs text-slate-400 mb-4 line-clamp-2">
									{comp.description}
								</p>
							{/if}

							<!-- Text preview box -->
							<div class="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4 font-mono text-xs text-slate-300 line-clamp-2 italic">
								"{comp.customText}"
							</div>
						</div>

						<div class="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-2">
							<span class="text-xs text-slate-400 font-medium">
								👥 {comp.entryCount ?? 0} peserta bertanding
							</span>
							<a
								href={`/competitions/${comp.slug}`}
								class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/10"
							>
								<span>Masuk Arena</span>
								<span>→</span>
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Past / Ended Competitions Section -->
	{#if pastCompetitions.length > 0}
		<section class="flex flex-col gap-4 mt-6">
			<h2 class="text-lg font-bold text-slate-400">Kompetisi Selesai / Arsip ({pastCompetitions.length})</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each pastCompetitions as comp (comp.id)}
					<div class="p-5 bg-slate-900/40 border border-slate-800/60 rounded-3xl flex items-center justify-between gap-4">
						<div class="min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
									Selesai
								</span>
								<span class="text-xs text-slate-500 font-mono">{comp.duration}s</span>
							</div>
							<h4 class="text-sm font-bold text-slate-300 truncate">{comp.title}</h4>
							<span class="text-xs text-slate-500">{comp.entryCount ?? 0} peserta</span>
						</div>

						<a
							href={`/competitions/${comp.slug}`}
							class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition shrink-0"
						>
							Papan Peringkat ↗
						</a>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
