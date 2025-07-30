<!-- src/components/ItemInput.svelte -->
<script lang="ts">
	import type { Item } from '../lib/types';
	import { formatRupiahString, unformatRupiah } from '../lib/formatRupiah';

	export let item: Item;
	export let idx: number;
	export let tipeList: string[];
	export let lokasiList: string[];
	export let update: (index: number, key: keyof Item, value: string | number | null) => void;
	export let hapusInput: (index: number) => void;
</script>

<div class="mb-3 flex items-center justify-between">
	<div class="inline-flex items-center gap-2">
		<h3 class="text-sm font-semibold tracking-wide text-gray-800">Transfer</h3>
		<span
			class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700"
		>
			{idx + 1}
		</span>
	</div>

	<!-- "Hapus" terdorong ke kanan -->
	<button
		on:click={() => hapusInput(idx)}
		class="ml-auto inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white
           shadow-sm ring-1 ring-red-600/10 transition ring-inset hover:bg-red-700
           focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none active:scale-[0.99]"
		aria-label="Hapus baris ini"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-4 w-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"
			/>
		</svg>
		Hapus
	</button>
</div>

<div class="mb-4 flex gap-3">
	<input
		type="text"
		placeholder="NAMA PERUSAHAAN / PELANGGAN"
		value={item.nama}
		on:input={(e) => update(idx, 'nama', (e.target! as HTMLInputElement).value)}
		class="w-80 rounded border border-gray-300 px-2 py-1 text-sm uppercase focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
	/>
	<div class="flex items-center">
		<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm">JL</span
		>
		<input
			type="text"
			inputmode="numeric"
			pattern="[0-9]*"
			placeholder="-"
			value={item.jl.replace(/^JL/, '')}
			on:keypress={(e) => {
				if (!/[0-9]/.test(e.key)) e.preventDefault();
			}}
			on:input={(e) => {
				const angka = (e.target! as HTMLInputElement).value.replace(/\D/g, '');
				update(idx, 'jl', 'JL' + angka);
			}}
			class="w-20 rounded-r border border-gray-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
		/>
	</div>

	<div class="flex items-center">
		<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm">Rp</span
		>
		<input
			type="text"
			inputmode="numeric"
			placeholder="-"
			pattern="\d*"
			value={formatRupiahString(String(item.harga ?? ''))}
			on:keydown={(e) => {
				if (['e', 'E', '+', '-'].includes(e.key)) {
					e.preventDefault();
				}
			}}
			on:input={(e) => {
				const target = e.target as HTMLInputElement;
				const raw = target.value;
				const angka = unformatRupiah(raw);
				update(idx, 'harga', angka);
				target.value = formatRupiahString(raw);
			}}
			class="w-28 rounded-r border border-gray-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
		/>
	</div>

	<select
		bind:value={item.tipe}
		on:change={(e) => update(idx, 'tipe', (e.target as HTMLSelectElement).value as Item['tipe'])}
		class="focus:ring-opacity-50 w-[185px] rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
	>
		{#each tipeList.filter((tipe) => tipe !== item.tipe) as tipe}
			<option value={tipe}>{tipe.charAt(0).toUpperCase() + tipe.slice(1)}</option>
		{/each}

		<!-- Tampilkan current value sebagai selected dan disabled -->
		<option value={item.tipe} selected disabled>
			{item.tipe.charAt(0).toUpperCase() + item.tipe.slice(1)}
		</option>
	</select>

	<select
		bind:value={item.lokasi}
		on:change={(e) =>
			update(idx, 'lokasi', (e.target as HTMLSelectElement).value as Item['lokasi'])}
		class="w-[90px] rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
	>
		<!-- Menampilkan opsi selain yang sedang dipilih -->
		{#each lokasiList.filter((lokasi) => lokasi !== item.lokasi) as lokasi}
			<option value={lokasi}>
				{lokasi}
			</option>
		{/each}

		<!-- Menampilkan opsi yang sedang dipilih, tapi tidak bisa dipilih lagi -->
		<option value={item.lokasi} selected disabled>
			{item.lokasi}
		</option>
	</select>
</div>
