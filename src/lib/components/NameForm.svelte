<script lang="ts">
	import { setName, session } from '$lib/stores/session.svelte';
	import { Keyboard, ArrowRight } from '@lucide/svelte';

	interface Props {
		onsaved?: () => void;
	}

	let { onsaved }: Props = $props();

	let inputName = $state(session.name || '');
	let errorMsg = $state('');

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!inputName.trim()) {
			errorMsg = 'Silakan masukkan namamu terlebih dahulu';
			return;
		}

		if (setName(inputName)) {
			errorMsg = '';
			onsaved?.();
		} else {
			errorMsg = 'Nama tidak valid';
		}
	}
</script>

<div class="w-full max-w-md mx-auto p-8 bg-card text-card-foreground border border-border rounded-3xl shadow-lg text-center">
	<div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
		<Keyboard class="w-7 h-7" />
	</div>
	<h2 class="text-2xl font-bold text-foreground mb-2">Siapa Namamu?</h2>
	<p class="text-sm text-muted-foreground mb-6">
		Tanpa perlu login atau registrasi. Cukup isi nama untuk menyimpan skor dan rekor mengetikmu di papan peringkat.
	</p>

	<form onsubmit={submit} class="flex flex-col gap-4">
		<div class="relative">
			<input
				type="text"
				bind:value={inputName}
				maxlength="30"
				placeholder="Ketik namamu di sini..."
				class="w-full px-5 py-3.5 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground rounded-2xl text-center text-lg placeholder:text-muted-foreground/60 outline-none transition"
			/>
		</div>

		{#if errorMsg}
			<p class="text-sm text-destructive font-medium">{errorMsg}</p>
		{/if}

		<button
			type="submit"
			class="w-full py-3.5 px-6 bg-primary text-primary-foreground font-bold rounded-2xl shadow-sm hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-2"
		>
			<span>Mulai Mengetik</span>
			<ArrowRight class="w-4 h-4" />
		</button>
	</form>
</div>
