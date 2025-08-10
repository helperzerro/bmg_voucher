<script lang="ts">
	import 'flatpickr/dist/flatpickr.min.css';

	import VoucherPreview from '../components/VoucherPreview.svelte';
	import Rekap from '../components/Rekap.svelte';
	import InputItem from '../components/InputItem.svelte';
	import InputItemGroup from '../components/InputItemGroup.svelte';

	import { lokasiList, lokasiLabels } from '../lib/lokasi';
	import { tambahItem, tambahGrup } from '../lib/utils';
	import { tipeList } from '../lib/types';
	import type { Item, Row } from '../lib/types';

	type ItemOrGroup = Item | Item[];

	let inputs: ItemOrGroup[] = [];
	let rows: Row[][] = [];
	let showPreview = false;
	let errorMessage: string | null = null;
	let voucherPengeluaranIndex: number[] = [];

	// Tambah item ke dalam grup
	function tambahItemKeGrup(groupIndex: number) {
		if (Array.isArray(inputs[groupIndex])) {
			const newGroup = [...(inputs[groupIndex] as Item[])];
			newGroup.push({
				nama: '',
				jl: '',
				harga: null,
				tipe: 'TRANSFER',
				lokasi: lokasiList[0],
				tanggal: ''
			});
			inputs[groupIndex] = newGroup;
		}
	}

	// Update item biasa
	function updateItem(index: number, key: keyof Item, value: string | number | null) {
		if (!Array.isArray(inputs[index])) {
			inputs[index] = { ...(inputs[index] as Item), [key]: value };
		}
	}

	// Update item dalam grup
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

	// Hitung index voucher pengeluaran
	$: voucherPengeluaranIndex = (() => {
		const hasil: number[] = [];
		let posisiDariBawah = 1;

		for (let i = inputs.length - 1; i >= 0; i--) {
			const entry = inputs[i];
			const items = Array.isArray(entry) ? entry : [entry];

			if (items.some((item) => item.tipe === 'RETUR' || item.tipe === 'PETTY CASH')) {
				hasil.unshift(posisiDariBawah);
			}

			posisiDariBawah++;
		}

		return hasil.sort((a, b) => a - b);
	})();

	// Buat voucher (validasi + proses data)
	function buatVoucher() {
		errorMessage = null;

		const isValid = inputs.every((entry) =>
			Array.isArray(entry)
				? entry.every(
						(item) =>
							item.nama.trim() &&
							(item.tipe === 'TUNAI' || item.tipe === 'PETTY CASH' || item.jl.trim()) &&
							item.harga !== null
					)
				: entry.nama.trim() &&
					(entry.tipe === 'TUNAI' || entry.tipe === 'PETTY CASH' || entry.jl.trim()) &&
					entry.harga !== null
		);

		if (!isValid) {
			errorMessage = 'Semua kolom wajib diisi.';
			showPreview = false;
			rows = [];
			return;
		}

		rows = inputs.map((entry) => {
			const items = Array.isArray(entry) ? entry : [entry];
			return items
				.filter(
					(item) => item.nama && (item.tipe === 'TUNAI' || item.tipe === 'PETTY CASH' || item.jl)
				)

				.map((item) => ({
					keteranganTransaksi:
						item.tipe === 'TUNAI' || item.tipe === 'PETTY CASH' || !item.jl || item.jl === 'JL'
							? item.nama
							: `${item.nama} (${item.jl})`,
					total: item.harga,
					tipe: item.tipe,
					lokasi: lokasiLabels[item.lokasi],
					tanggal: item.tanggal
				}));
		});

		showPreview = true;
	}

	function hapusInput(index: number) {
		inputs = inputs.filter((_, i) => i !== index);
	}
</script>

<main class="mx-auto max-w-5xl px-4 py-6">
	<!-- SECTION: Form Input (non-print) -->
	<section class="print:hidden">
		<!-- Header -->
		<div
			class="mb-6 flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between"
		>
			<div>
				<div class="flex items-center gap-2">
					<!-- Icon (pakai lucide atau heroicons jika tersedia) -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-emerald-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 17v-2a4 4 0 018 0v2m-6-6h.01M12 12h.01M16 12h.01M12 6a9 9 0 110 18 9 9 0 010-18z"
						/>
					</svg>
					<h1 class="text-xl font-semibold tracking-tight text-gray-900">Input Voucher</h1>
				</div>
				<p class="mt-1 text-sm text-gray-500">
					Tambahkan item satuan atau grup, lalu cetak voucher penjualan Anda.
				</p>
			</div>

			<div class="hidden md:block">
				<span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
					📅 Hari ini: {new Date().toLocaleDateString('id-ID', {
						weekday: 'long',
						day: 'numeric',
						month: 'long',
						year: 'numeric'
					})}
				</span>
			</div>
		</div>

		<!-- Form Card -->
		<div class="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm backdrop-blur md:p-5">
			<!-- Input Items -->
			<div class="space-y-3">
				{#each inputs as input, idx}
					<div class="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
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
							<InputItem
								{idx}
								item={input}
								{tipeList}
								{lokasiList}
								update={updateItem}
								{hapusInput}
							/>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Badge Info + Error -->
			<div class="mt-4 flex flex-wrap items-center gap-2">
				<span
					class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-200"
				>
					🧾 Voucher pengeluaran lembar ke:
					{#if voucherPengeluaranIndex.length}
						{voucherPengeluaranIndex.join(', ')}
					{:else}
						tidak ada
					{/if}
				</span>

				{#if errorMessage}
					<span
						class="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-red-200"
					>
						{errorMessage}
					</span>
				{/if}
			</div>

			<!-- Tombol Aksi -->
			<div class="mt-4 flex flex-wrap items-center gap-2">
				<button
					on:click={() => (inputs = tambahItem(inputs))}
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm ring-1 ring-blue-600/10 transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.99]"
				>
					➕ Satuan
				</button>

				<button
					on:click={() => (inputs = tambahGrup(inputs))}
					class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm ring-1 ring-emerald-600/10 transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99]"
				>
					📦 Grup
				</button>
			</div>

			<!-- Tombol Generate -->
			<div class="mt-5 flex justify-end">
				<button
					on:click={buatVoucher}
					class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-white shadow-md transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.99]"
				>
					🧩 Buat Voucher
				</button>
			</div>
		</div>
	</section>

	<!-- SECTION: Preview (boleh diprint) -->
	{#if showPreview}
		<section class="mt-6 space-y-6">
			<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
				<Rekap {inputs} />
			</div>

			<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
				<VoucherPreview {rows} />
			</div>
		</section>
	{/if}

	<div class="fixed right-6 bottom-6 z-50 flex flex-col gap-4 print:hidden">
		<!-- Scroll ke atas -->
		<button
			on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			class="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl active:scale-95"
			aria-label="Scroll to top"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 transition-transform group-hover:-translate-y-1"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
			</svg>
		</button>

		<!-- Scroll ke bawah -->
		<button
			on:click={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
			class="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl active:scale-95"
			aria-label="Scroll to bottom"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 transition-transform group-hover:translate-y-1"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	</div>
</main>
