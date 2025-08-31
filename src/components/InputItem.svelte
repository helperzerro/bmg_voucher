<!-- src/components/ItemInput.svelte -->
<script lang="ts">
	import type { Item } from '../lib/types';
	import { formatRupiahString, unformatRupiah } from '../lib/formatRupiah';
	import { onMount } from 'svelte';
	import flatpickr from 'flatpickr';
	import 'flatpickr/dist/flatpickr.min.css';

	export let item: Item;
	export let idx: number;
	export let tipeList: string[];
	export let lokasiList: string[];
	export let update: (index: number, key: keyof Item, value: string | number | null) => void;
	export let hapusInput: (index: number) => void;
	export let onInputChange;

	onMount(() => {
		// Jika belum ada tanggal, isi default ke tanggal hari ini (format d/m/Y)
		if (!item.tanggal) {
			const hariIni = new Date().toLocaleDateString('id-ID', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
			update(idx, 'tanggal', hariIni);
		}

		flatpickr(`#tanggal-${idx}`, {
			dateFormat: 'd/m/Y',
			defaultDate: item.tanggal, // sekarang sudah dipastikan ada nilainya
			onChange: (_, dateStr) => {
				update(idx, 'tanggal', dateStr);
			}
		});
	});
</script>

<!-- Header -->
<div class="mb-2 flex items-center justify-between">
	<div class="flex items-center gap-2">
		<h3 class="text-sm font-semibold text-emerald-700">
			<!-- {item.tipe.charAt(0).toUpperCase() + item.tipe.slice(1).toLowerCase()} -->
			Lembar ke
		</h3>
		<span
			class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700"
		>
			{idx + 1}
		</span>
	</div>
	<button
		on:click={() => hapusInput(idx)}
		class="ml-auto inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-red-600/10 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.99]"
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

<!-- Baris 1: Nama, JL, Harga -->
<div class="mb-4 flex flex-wrap gap-x-3 gap-y-2">
	<!-- Nama -->
	<input
		type="text"
		placeholder="NAMA PERUSAHAAN / PELANGGAN"
		value={item.nama}
		on:input={(e) => {
			update(idx, 'nama', (e.target! as HTMLInputElement).value);
			onInputChange();
		}}
		class="w-80 rounded border border-gray-300 px-2 py-1 text-sm uppercase focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
	/>

	<!-- JL -->
	<div class="flex items-center">
		<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm">JL</span
		>
		<input
			type="text"
			inputmode="numeric"
			pattern="[0-9]*"
			placeholder="-"
			value={item.jl.replace(/^JL/, '')}
			on:keypress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
			on:input={(e) => {
				const angka = (e.target! as HTMLInputElement).value.replace(/\D/g, '');
				const tipe = item.tipe?.toUpperCase();
				if (angka === '' && (tipe === 'TUNAI' || tipe === 'PETTY CASH')) {
					update(idx, 'jl', '');
				} else {
					update(idx, 'jl', 'JL' + angka);
				}
				onInputChange();
			}}
			class="w-20 rounded-r border border-gray-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
		/>
	</div>

	<!-- Harga -->
	<div class="flex items-center">
		<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm">Rp</span
		>
		<input
			type="text"
			inputmode="numeric"
			pattern="\d*"
			placeholder="-"
			value={formatRupiahString(String(item.harga ?? ''))}
			on:keydown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
			on:input={(e) => {
				const target = e.target as HTMLInputElement;
				const raw = target.value;
				const angka = unformatRupiah(raw);
				update(idx, 'harga', angka);
				target.value = formatRupiahString(raw);
				onInputChange();
			}}
			class="w-28 rounded-r border border-gray-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
		/>
	</div>
</div>

<!-- Baris 2: Tipe, Lokasi, Tanggal -->
<div class="mb-4 flex flex-wrap gap-x-3 gap-y-2">
	<!-- Tipe -->
	<select
		bind:value={item.tipe}
		on:change={(e) => {
			update(idx, 'tipe', (e.target as HTMLSelectElement).value as Item['tipe']);
			onInputChange();
		}}
		class="w-[185px] rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
	>
		<option value={item.tipe} selected disabled>{item.tipe}</option>
		{#each tipeList.filter((tipe) => tipe !== item.tipe) as tipe}
			<option value={tipe}>{tipe}</option>
		{/each}
	</select>

	<!-- Lokasi -->
	<select
		bind:value={item.lokasi}
		on:change={(e) => {
			update(idx, 'lokasi', (e.target as HTMLSelectElement).value as Item['lokasi']);
			onInputChange();
		}}
		class="w-[90px] rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
	>
		<option value={item.lokasi} selected disabled>{item.lokasi}</option>
		{#each lokasiList.filter((lokasi) => lokasi !== item.lokasi) as lokasi}
			<option value={lokasi}>{lokasi}</option>
		{/each}
	</select>

	<!-- Tanggal -->
	<input
		id={'tanggal-' + idx}
		type="text"
		placeholder="dd/mm/yyyy"
		on:change={(e) => {
			onInputChange();
		}}
		value={item.tanggal ??
			new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
		class="w-40 rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
	/>
</div>
