<script lang="ts">
	import VoucherPreview from '../components/VoucherPreview.svelte';
	import InputItem from '../components/InputItem.svelte';
	import InputItemGroup from '../components/InputItemGroup.svelte';
	import flatpickr from 'flatpickr';
	import 'flatpickr/dist/flatpickr.min.css';
	import { onMount } from 'svelte';
	import { lokasiList, lokasiLabels } from '../lib/lokasi';
	import type { Item, Row } from '../lib/types';
	import { tipeList } from '../lib/types';
	import { tambahItem, tambahGrup } from '../lib/utils';
	import Rekap from '../components/Rekap.svelte';

	type ItemOrGroup = Item | Item[];
	let inputs: ItemOrGroup[] = [];
	let errorMessage: string | null = null;
	let voucherPengeluaranIndex: number[] = [];
	let showPreview = false;
	let rows: Row[][] = [];

	let tanggalValue: string = new Date()
		.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})
		.replace(/\//g, '/'); // hasil: "27/07/2025"

	$: tanggalDisplay = new Date(
		tanggalValue.split('/').reverse().join('-') // convert dd/mm/yyyy → yyyy-mm-dd
	).toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});

	onMount(() => {
		flatpickr('#tanggal', {
			dateFormat: 'd/m/Y',
			defaultDate: new Date(),
			onChange: (_, dateStr) => {
				tanggalValue = dateStr;
			}
		});
	});

	function tambahItemKeGrup(groupIndex: number) {
		if (Array.isArray(inputs[groupIndex])) {
			const newGroup = [...(inputs[groupIndex] as Item[])];
			newGroup.push({ nama: '', jl: '', harga: null, tipe: 'TRANSFER', lokasi: lokasiList[0] });
			inputs[groupIndex] = newGroup;
		}
	}

	// Fungsi update item di indeks tertentu (item biasa)
	function updateItem(index: number, key: keyof Item, value: string | number | null) {
		if (!Array.isArray(inputs[index])) {
			inputs[index] = { ...(inputs[index] as Item), [key]: value };
		}
	}

	// Fungsi update item di dalam grup
	function updateItemInGroup(
		groupIndex: number,
		itemIndex: number,
		key: keyof Item,
		value: string | number | null
	) {
		if (Array.isArray(inputs[groupIndex])) {
			const newGroup = [...(inputs[groupIndex] as Item[])];
			newGroup[itemIndex] = { ...newGroup[itemIndex], [key]: value };
			inputs[groupIndex] = newGroup;
		}
	}

	function getVoucherPengeluaranIndex(inputs: ItemOrGroup[]): number[] {
		const result: number[] = [];

		inputs.forEach((entry, i) => {
			const items = Array.isArray(entry) ? entry : [entry];

			const hasReturOrPettyCash = items.some(
				(item) => item.tipe === 'RETUR' || item.tipe === 'PETTY CASH'
			);

			if (hasReturOrPettyCash) {
				result.push(i + 1); // 1-based index
			}
		});

		return result;
	}

	function buatVoucher() {
		errorMessage = null;

		// Cek validasi
		const isValid = inputs.every((entry) => {
			if (Array.isArray(entry)) {
				return entry.every((item) => item.nama.trim() && item.jl.trim() && item.harga !== null);
			} else {
				return entry.nama.trim() && entry.jl.trim() && entry.harga !== null;
			}
		});

		if (!isValid) {
			errorMessage = 'Semua kolom wajib diisi.';
			return;
		}

		// Jika valid, lanjut generate rows
		rows = inputs.map((entry) => {
			if (Array.isArray(entry)) {
				return entry
					.filter((item): item is Item => !!item.nama && !!item.jl)
					.map((item) => ({
						keteranganTransaksi: `${item.nama} (${item.jl})`,
						total: item.harga,
						tipe: item.tipe,
						lokasi: lokasiLabels[item.lokasi]
					}));
			}

			if (entry.nama && entry.jl) {
				return [
					{
						keteranganTransaksi: `${entry.nama} (${entry.jl})`,
						total: entry.harga,
						tipe: entry.tipe,
						lokasi: lokasiLabels[entry.lokasi]
					}
				];
			}

			return [];
		});

		// ✅ Hitung voucher keberapa saja yang RETUR atau PETTY CASH
		voucherPengeluaranIndex = getVoucherPengeluaranIndex(inputs);

		showPreview = true;
	}

	function hapusInput(index: number) {
		inputs = inputs.filter((_, i) => i !== index);
	}
</script>

<div class="mb-4 space-x-2">
	<button
		on:click={() => (inputs = tambahItem(inputs))}
		class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Satuan</button
	>
	<button
		on:click={() => (inputs = tambahGrup(inputs))}
		class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Grup</button
	>
</div>

<label for="tanggal" class="mb-1 block font-semibold">Tanggal</label>
<input
	id="tanggal"
	type="text"
	bind:value={tanggalValue}
	class="rounded-md border px-3 py-[6px] text-sm shadow-sm"
/>

<!-- Render inputs -->
{#each inputs as input, idx}
	{#if Array.isArray(input)}
		<InputItemGroup
			{input}
			{idx}
			{tipeList}
			{lokasiList}
			{updateItemInGroup}
			{tambahItemKeGrup}
			{hapusInput}
		/>
	{:else}
		<InputItem {idx} item={input} {tipeList} {lokasiList} update={updateItem} {hapusInput} />
	{/if}
{/each}

<h1>{voucherPengeluaranIndex}</h1>

{#if errorMessage}
	<div class="mb-2 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
		{errorMessage}
	</div>
{/if}
<button class="mt-4 rounded bg-blue-500 px-4 py-2 text-white" on:click={buatVoucher}>
	Buat Voucher
</button>

{#if showPreview}
	<VoucherPreview {rows} {tanggalDisplay} />
	<Rekap {inputs} tanggal={tanggalValue} />
{/if}
