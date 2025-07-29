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

<div class="mb-2 flex items-center justify-between font-semibold">
	<span>Transfer {idx + 1}</span>
	<button
		on:click={() => hapusInput(idx)}
		class="rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
	>
		Hapus
	</button>
</div>

<div class="mb-4 flex gap-3">
	<input
		type="text"
		placeholder="Nama"
		value={item.nama}
		on:input={(e) => update(idx, 'nama', (e.target! as HTMLInputElement).value)}
		class="w-64 rounded-r border border-gray-300 px-2 py-1 text-sm uppercase"
	/>
	<div class="flex items-center">
		<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm">JL</span
		>
		<input
			type="text"
			inputmode="numeric"
			pattern="[0-9]*"
			placeholder="123"
			value={item.jl.replace(/^JL/, '')}
			on:keypress={(e) => {
				if (!/[0-9]/.test(e.key)) e.preventDefault();
			}}
			on:input={(e) => {
				const angka = (e.target! as HTMLInputElement).value.replace(/\D/g, '');
				update(idx, 'jl', 'JL' + angka);
			}}
			class="w-20 rounded-r border border-gray-300 px-2 py-1 text-sm"
		/>
	</div>

	<div class="flex items-center">
		<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm">Rp</span
		>
		<input
			type="text"
			inputmode="numeric"
			placeholder="Harga"
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
			class="w-28 rounded-r border border-gray-300 px-2 py-1 text-sm"
		/>
	</div>

	<select
		bind:value={item.tipe}
		on:change={(e) => update(idx, 'tipe', (e.target as HTMLSelectElement).value as Item['tipe'])}
		class="focus:ring-opacity-50 w-[185px] rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
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
		class="w-[90px] rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm"
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
