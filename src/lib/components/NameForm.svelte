<script lang="ts">
	import { setName, session } from '$lib/stores/session.svelte';

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

<div class="w-full max-w-md mx-auto p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur text-center">
	<div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl">
		⌨️
	</div>
	<h2 class="text-2xl font-bold text-white mb-2">Siapa Namamu?</h2>
	<p class="text-sm text-slate-400 mb-6">
		Tanpa perlu login atau registrasi. Cukup isi nama untuk menyimpan skor dan rekor mengetikmu di papan peringkat.
	</p>

	<form onsubmit={submit} class="flex flex-col gap-4">
		<div class="relative">
			<input
				type="text"
				bind:value={inputName}
				maxlength="30"
				placeholder="Ketik namamu di sini..."
				class="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white rounded-2xl text-center text-lg placeholder-slate-500 outline-none transition"
			/>
		</div>

		{#if errorMsg}
			<p class="text-sm text-rose-400 font-medium">{errorMsg}</p>
		{/if}

		<button
			type="submit"
			class="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition transform active:scale-95"
		>
			Mulai Mengetik
		</button>
	</form>
</div>
