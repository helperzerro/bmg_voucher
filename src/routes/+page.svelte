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

	$: voucherPengeluaranIndex = getVoucherPengeluaranIndex(inputs);

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

		showPreview = true;
	}

	function hapusInput(index: number) {
		inputs = inputs.filter((_, i) => i !== index);
	}
</script>

<main class="mx-auto max-w-5xl px-4 py-6">
	<!-- WRAPPER: Kontrol & Form (disembunyikan saat print) -->
	<section class="print:hidden">
		<!-- Header / Toolbar -->
		<div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-xl font-semibold tracking-tight text-gray-900">Input Voucher</h1>
				<p class="text-sm text-gray-500">
					Tambahkan item satuan/grup, pilih tanggal, lalu buat voucher.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<!-- Tombol: Satuan -->
				<button
					on:click={() => (inputs = tambahItem(inputs))}
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm
               ring-1 ring-blue-600/10 transition ring-inset hover:bg-blue-700
               focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none active:scale-[0.99]"
				>
					<span>➕</span>
					<span>Satuan</span>
				</button>

				<!-- Tombol: Grup -->
				<button
					on:click={() => (inputs = tambahGrup(inputs))}
					class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm
               ring-1 ring-emerald-600/10 transition ring-inset hover:bg-emerald-700
               focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none active:scale-[0.99]"
				>
					<span>📦</span>
					<span>Grup</span>
				</button>
			</div>
		</div>

		<!-- Card Form -->
		<div
			class="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm backdrop-blur
              md:p-5"
		>
			<!-- Tanggal -->
			<label for="tanggal" class="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
			<div class="mb-4">
				<input
					id="tanggal"
					type="text"
					bind:value={tanggalValue}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner
               transition outline-none placeholder:text-gray-400
               focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
				/>
			</div>

			<!-- Daftar Input Items -->
			<div class="space-y-3">
				{#each inputs as input, idx}
					{#if Array.isArray(input)}
						<div class="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
							<InputItemGroup
								{input}
								{idx}
								{tipeList}
								{lokasiList}
								{updateItemInGroup}
								{tambahItemKeGrup}
								{hapusInput}
							/>
						</div>
					{:else}
						<div class="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
							<InputItem
								{idx}
								item={input}
								{tipeList}
								{lokasiList}
								update={updateItem}
								{hapusInput}
							/>
						</div>
					{/if}
				{/each}
			</div>

			<!-- Badge Voucher Pengeluaran -->
			<div class="mt-4 flex flex-wrap items-center gap-2">
				<span
					class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-200"
				>
					<span>🧾</span>
					<span
						>Voucher pengeluaran lembar ke :
						{#if voucherPengeluaranIndex?.length}
							{voucherPengeluaranIndex.join(', ')}
						{:else}
							tidak ada
						{/if}
					</span>
				</span>

				{#if errorMessage}
					<span
						class="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-red-200"
					>
						{errorMessage}
					</span>
				{/if}
			</div>

			<!-- Tombol Buat Voucher -->
			<div class="mt-5 flex justify-end">
				<button
					class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-white shadow-md
               transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500
               focus-visible:outline-none active:scale-[0.99]"
					on:click={buatVoucher}
				>
					<span>🧩</span>
					<span>Buat Voucher</span>
				</button>
			</div>
		</div>
	</section>

	<!-- PREVIEW (boleh ikut diprint) -->
	{#if showPreview}
		<section class="mt-6 space-y-6">
			<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
				<VoucherPreview {rows} {tanggalDisplay} />
			</div>

			<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
				<Rekap {inputs} tanggal={tanggalValue} />
			</div>
		</section>
	{/if}
</main>
