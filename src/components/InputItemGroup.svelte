<script lang="ts">
	import type { Item } from '../lib/types';
	import { formatRupiahString, unformatRupiah } from '../lib/formatRupiah';
	import { lokasiLabels } from '../lib/lokasi';
	import { onMount } from 'svelte';
	import flatpickr from 'flatpickr';
	import 'flatpickr/dist/flatpickr.min.css';

	export let input: Item[];
	export let idx: number;
	export let tipeList: Item['tipe'][];
	export let lokasiList: (keyof typeof lokasiLabels)[];
	export let updateItemInGroup: (
		groupIndex: number,
		itemIndex: number,
		key: keyof Item,
		value: string | number | null
	) => void;
	export let tambahItemKeGrup: (index: number) => void;
	export let hapusInput: (index: number) => void;
	export let onInputChange;

	let dateInputEl: HTMLInputElement;

	onMount(() => {
		if (input.length > 0) {
			if (!input[0].tanggal) {
				const now = new Date();
				const dd = String(now.getDate()).padStart(2, '0');
				const mm = String(now.getMonth() + 1).padStart(2, '0');
				const yyyy = now.getFullYear();
				const todayStr = `${dd}/${mm}/${yyyy}`;
				updateItemInGroup(idx, 0, 'tanggal', todayStr);
				if (input.length > 1) {
					updateItemInGroup(idx, 1, 'tanggal', todayStr);
				}
			}

			flatpickr(dateInputEl, {
				dateFormat: 'd/m/Y',
				defaultDate: input[0].tanggal,
				onChange: (_, dateStr) => {
					// update semua
					input.forEach((_, gidx) => {
						updateItemInGroup(idx, gidx, 'tanggal', dateStr);
					});
				}
			});
		}
	});

	function getJlPrefixByLokasi(lokasi: Item['lokasi']) {
		const year = new Date().getFullYear().toString().slice(-2);

		if (lokasi === 'BMG') return `BMG-${year}/i/`;
		if (lokasi === 'ST2') return `ST2-${year}/i/`;
	}
</script>

<div class="mb-3 flex items-center gap-2">
	<button
		on:click={() => {
			const tanggalSaatIni =
				input[0]?.tanggal ||
				new Date().toLocaleDateString('id-ID', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric'
				});
			tambahItemKeGrup(idx);
			// Set tanggal untuk item baru (posisi terakhir)
			updateItemInGroup(idx, input.length, 'tanggal', tanggalSaatIni);
		}}
		class="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white
		shadow-sm ring-1 ring-amber-500/10 transition ring-inset hover:bg-amber-600
		focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none active:scale-[0.99]"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-4 w-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
		Tambah Item ke Grup
	</button>

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

<div class="mb-4 rounded p-4">
	<div class="mb-2 flex items-center justify-between font-semibold">
		<div class="inline-flex items-center gap-2">
			<h3 class="text-sm font-semibold text-emerald-700">
				<!-- {input[0].tipe.charAt(0).toUpperCase() + input[0].tipe.slice(1).toLowerCase()} -->
				Lembar ke
			</h3>
			<span
				class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700"
			>
				{idx + 1}
			</span>
		</div>
	</div>

	<!-- Input Nama, JL, Harga -->
	{#each input as groupItem, gidx}
		<div class="mb-2 flex gap-3">
			<!-- Nama -->
			<input
				type="text"
				placeholder="NAMA PERUSAHAAN / PELANGGAN"
				value={groupItem.nama}
				on:input={(e) => {
					updateItemInGroup(idx, gidx, 'nama', (e.target! as HTMLInputElement).value);
					onInputChange();
				}}
				class="w-80 rounded-r border border-gray-300 px-2 py-1 text-sm uppercase focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
			/>

			<!-- JL -->
			<div class="flex items-center">
				<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm">
					{getJlPrefixByLokasi(groupItem.lokasi)}
				</span>

				<input
					type="text"
					inputmode="numeric"
					pattern="[0-9]*"
					placeholder="-"
					value={groupItem.jl}
					on:keypress={(e) => {
						if (!/[0-9]/.test(e.key)) e.preventDefault();
					}}
					on:input={(e) => {
						const angka = (e.target as HTMLInputElement).value.replace(/\D/g, '');
						const tipe = groupItem.tipe?.toUpperCase();

						if (angka === '' && (tipe === 'TUNAI' || tipe === 'PETTY CASH')) {
							updateItemInGroup(idx, gidx, 'jl', '');
						} else {
							updateItemInGroup(idx, gidx, 'jl', angka);
						}

						onInputChange();
					}}
					class="w-24 rounded-r border border-gray-300 px-2 py-1 text-right text-sm
		       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
				/>
			</div>

			<!-- Harga -->
			<div class="flex items-center">
				<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm"
					>Rp</span
				>
				<input
					type="text"
					inputmode="numeric"
					pattern="\d*"
					placeholder="-"
					value={formatRupiahString(String(groupItem.harga ?? ''))}
					on:input={(e) => {
						const target = e.target as HTMLInputElement;
						const raw = target.value;
						const angka = unformatRupiah(raw);
						updateItemInGroup(idx, gidx, 'harga', angka);

						// Format ulang tampilan (biar tetap ada titiknya)
						target.value = formatRupiahString(raw);
						onInputChange();
					}}
					class="w-28 rounded-r border border-gray-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
				/>
			</div>
		</div>
	{/each}

	<!-- Select hanya sekali untuk tiap group -->
	{#if input.length > 0}
		<select
			bind:value={input[0].tipe}
			on:change={(e) => {
				const val = (e.target as HTMLSelectElement).value as Item['tipe'];
				input.forEach((_, gidx) => updateItemInGroup(idx, gidx, 'tipe', val));
				onInputChange();
			}}
			class="focus:ring-opacity-50 w-[185px] rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
		>
			{#each tipeList.filter((t) => !input.some((item) => item.tipe === t)) as tipe}
				<option value={tipe}>
					{tipe.charAt(0).toUpperCase() + tipe.slice(1)}
				</option>
			{/each}
			<option value={input[0].tipe} disabled selected>
				{input[0].tipe.charAt(0).toUpperCase() + input[0].tipe.slice(1)}
			</option>
		</select>
	{/if}

	<!-- Select lokasi hanya sekali untuk tiap group -->
	{#if input.length > 0}
		<select
			bind:value={input[0].lokasi}
			on:change={(e) => {
				const val = (e.target as HTMLSelectElement).value as Item['lokasi'];
				input.forEach((_, gidx) => updateItemInGroup(idx, gidx, 'lokasi', val));
				onInputChange();
			}}
			class="mt-2 w-[90px] rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
		>
			<!-- Menampilkan opsi selain yang sedang dipilih -->
			{#each lokasiList.filter((lok) => lok !== input[0].lokasi) as lokasi}
				<option value={lokasi}>
					{lokasi}
				</option>
			{/each}

			<!-- Menampilkan opsi yang sedang dipilih -->
			<option value={input[0].lokasi} selected disabled>
				{input[0].lokasi}
			</option>
		</select>
	{/if}

	<!-- Bagian tanggal pakai flatpickr -->
	{#if input.length > 0}
		<div class="mt-2">
			<!-- Input untuk user -->
			<input
				type="text"
				placeholder="Pilih tanggal"
				bind:this={dateInputEl}
				value={input[0].tanggal ??
					new Date().toLocaleDateString('id-ID', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					})}
				on:change={(e) => {
					onInputChange();
				}}
				class="rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
			/>

			<!-- Input hidden yang ikut disamakan nilainya -->
			<input type="hidden" value={input[1]?.tanggal ?? ''} />
		</div>
	{/if}
</div>
