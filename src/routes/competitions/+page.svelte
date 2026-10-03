<script lang="ts">
	import { Trophy, Clock, Users, ArrowRight, ExternalLink, Sparkles } from '@lucide/svelte';

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
	<div class="p-8 sm:p-10 bg-card text-card-foreground border border-border rounded-3xl shadow-md relative overflow-hidden">
		<div class="relative z-10 max-w-2xl">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20">
				<Trophy class="w-3.5 h-3.5" />
				<span>Arena Turnamen Mengetik {data.appConfig?.companyName || 'Citilumb'}</span>
			</div>
			<h1 class="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
				Tantang Pengetik Lain di <span class="bg-gradient-to-r from-primary to-amber-600 dark:to-amber-400 bg-clip-text text-transparent">Kompetisi Resmi</span>
			</h1>
			<p class="text-sm text-muted-foreground leading-relaxed">
				Setiap peserta mengetik materi teks yang sama persis dalam batas waktu yang seragam. Buktikan siapa yang tercepat dan raih podium juara!
			</p>
		</div>

		<!-- Background decorative icon -->
		<Trophy class="w-64 h-64 text-primary/10 -rotate-12 absolute -right-12 -bottom-16 pointer-events-none" />
	</div>

	<!-- Active Competitions Section -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
				<h2 class="text-xl font-bold text-foreground">Kompetisi Sedang Berlangsung ({activeCompetitions.length})</h2>
			</div>
		</div>

		{#if activeCompetitions.length === 0}
			<div class="p-8 bg-card border border-border rounded-3xl text-center text-muted-foreground text-sm">
				Belum ada kompetisi aktif saat ini. Anda dapat membuat kompetisi baru melalui <a href="/admin" class="text-primary underline font-semibold">Admin Panel</a>.
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each activeCompetitions as comp (comp.id)}
					<div class="p-6 bg-card text-card-foreground border border-border hover:border-primary/50 rounded-3xl shadow-sm transition flex flex-col justify-between group">
						<div>
							<div class="flex items-center justify-between mb-3">
								<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
									<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
									Aktif
								</span>
								<span class="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-lg border border-border">
									<Clock class="w-3.5 h-3.5 text-primary" />
									<span>{comp.duration} Detik</span>
								</span>
							</div>

							<h3 class="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition">
								{comp.title}
							</h3>

							{#if comp.description}
								<p class="text-xs text-muted-foreground mb-4 line-clamp-2">
									{comp.description}
								</p>
							{/if}

							<!-- Text preview box -->
							<div class="p-3 bg-muted/40 border border-border rounded-2xl mb-4 font-mono text-xs text-foreground/80 line-clamp-2 italic">
								"{comp.customText}"
							</div>
						</div>

						<div class="flex items-center justify-between pt-4 border-t border-border mt-2">
							<span class="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
								<Users class="w-3.5 h-3.5 text-primary" />
								<span>{comp.entryCount ?? 0} peserta bertanding</span>
							</span>
							<a
								href={`/competitions/${comp.slug}`}
								class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl text-xs transition shadow-sm"
							>
								<span>Masuk Arena</span>
								<ArrowRight class="w-3.5 h-3.5" />
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
			<h2 class="text-lg font-bold text-muted-foreground">Kompetisi Selesai / Arsip ({pastCompetitions.length})</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each pastCompetitions as comp (comp.id)}
					<div class="p-5 bg-card text-card-foreground border border-border/80 rounded-3xl flex items-center justify-between gap-4">
						<div class="min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground border border-border">
									Selesai
								</span>
								<span class="text-xs text-muted-foreground font-mono">{comp.duration}s</span>
							</div>
							<h4 class="text-sm font-bold text-foreground truncate">{comp.title}</h4>
							<span class="text-xs text-muted-foreground">{comp.entryCount ?? 0} peserta</span>
						</div>

						<a
							href={`/competitions/${comp.slug}`}
							class="inline-flex items-center gap-1 px-3.5 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-xl text-xs font-semibold transition shrink-0 shadow-sm"
						>
							<span>Papan Peringkat</span>
							<ExternalLink class="w-3 h-3 text-muted-foreground" />
						</a>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
