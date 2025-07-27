<script lang="ts">
	import VoucherPreview from '../routes/voucherPreview.svelte';
	import flatpickr from 'flatpickr';
	import 'flatpickr/dist/flatpickr.min.css';
	import { onMount } from 'svelte';
	import { lokasiList, lokasiLabels } from '../lib/lokasi';

	type Item = {
		nama: string;
		jl: string;
		harga: number | null;
		tipe: 'TUNAI' | 'TRANSFER' | 'RETUR';
		lokasi: keyof typeof lokasiLabels;
	};
	const tipeList: Item['tipe'][] = ['TUNAI', 'TRANSFER', 'RETUR'];

	type ItemOrGroup = Item | Item[];

	let inputs: ItemOrGroup[] = [];

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

	function formatRupiahString(str: string): string {
		const cleaned = str.replace(/[^\d]/g, '');
		if (!cleaned) return '';
		return parseInt(cleaned).toLocaleString('id-ID');
	}

	function unformatRupiah(str: string): number | null {
		const cleaned = str.replace(/[^\d]/g, '');
		const num = parseInt(cleaned);
		return isNaN(num) ? null : num;
	}

	type Row = {
		keteranganTransaksi: string;
		total: number | null;
		tipe: 'TUNAI' | 'TRANSFER' | 'RETUR';
		lokasi: string; // sekarang ini label panjang
	};

	let showPreview = false;
	let rows: Row[][] = [];

	// Fungsi buat nambah item biasa
	function tambahItem() {
		inputs = [
			...inputs,
			{ nama: '', jl: '', harga: null, tipe: 'TRANSFER', lokasi: lokasiList[0] }
		];
	}

	// Fungsi buat nambah grup item (misal 2 item di grup)
	function tambahGrup() {
		inputs = [
			...inputs,
			[
				{ nama: '', jl: '', harga: null, tipe: 'TRANSFER', lokasi: lokasiList[0] },
				{ nama: '', jl: '', harga: null, tipe: 'TRANSFER', lokasi: lokasiList[0] }
			]
		];
	}

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

	function buatVoucher() {
		rows = inputs.map((entry) => {
			// Jika grup (array of Item)
			if (Array.isArray(entry)) {
				return entry
					.filter((item): item is Item => !!item.nama && !!item.jl)
					.map((item) => ({
						keteranganTransaksi: `${item.nama} (${item.jl})`,
						total: item.harga,
						tipe: item.tipe,
						lokasi: lokasiLabels[item.lokasi] // ubah singkatan ke label panjang
					}));
			}

			// Jika single item
			if (entry.nama && entry.jl) {
				return [
					{
						keteranganTransaksi: `${entry.nama} (${entry.jl})`,
						total: entry.harga,
						tipe: entry.tipe,
						lokasi: lokasiLabels[entry.lokasi] // ubah singkatan ke label panjang
					}
				];
			}

			return []; // kalau tidak valid
		});

		showPreview = true;
	}
</script>

<div class="mb-4 space-x-2">
	<button on:click={tambahItem} class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
		>Satuan</button
	>
	<button on:click={tambahGrup} class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
		>Grup</button
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
		<button
			on:click={() => tambahItemKeGrup(idx)}
			class="mt-2 rounded bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
		>
			Tambah Item ke Grup {idx + 1}
		</button>

		<div class="mb-4 rounded border border-green-500 p-4">
			<div class="mb-2 font-semibold">Transfer {idx + 1}</div>

			<!-- Input Nama, JL, Harga -->
			{#each input as groupItem, gidx}
				<div class="mb-2 flex gap-3">
					<!-- Nama -->
					<input
						type="text"
						placeholder="Nama"
						value={groupItem.nama}
						on:input={(e) =>
							updateItemInGroup(idx, gidx, 'nama', (e.target! as HTMLInputElement).value)}
						class="w-64 rounded-r border border-gray-300 px-2 py-1 text-sm uppercase"
					/>

					<!-- JL -->
					<div class="flex items-center">
						<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm"
							>JL</span
						>
						<input
							type="text"
							inputmode="numeric"
							pattern="[0-9]*"
							placeholder="123"
							value={groupItem.jl.replace(/^JL/, '')}
							on:keypress={(e) => {
								if (!/[0-9]/.test(e.key)) e.preventDefault();
							}}
							on:input={(e) => {
								const angka = (e.target! as HTMLInputElement).value.replace(/\D/g, '');
								updateItemInGroup(idx, gidx, 'jl', 'JL' + angka);
							}}
							class="w-20 rounded-r border border-gray-300 px-2 py-1 text-sm"
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
							placeholder="Harga"
							value={formatRupiahString(String(groupItem.harga ?? ''))}
							on:input={(e) => {
								const target = e.target as HTMLInputElement;
								const raw = target.value;
								const angka = unformatRupiah(raw);
								updateItemInGroup(idx, gidx, 'harga', angka);

								// Format ulang tampilan (biar tetap ada titiknya)
								target.value = formatRupiahString(raw);
							}}
							class="w-28 rounded-r border border-gray-300 px-2 py-1 text-sm"
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
					}}
					class="focus:ring-opacity-50 w-32 rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
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
					}}
					class="mt-2 w-40 rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm"
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
		</div>
	{:else}
		<div class="mb-2 font-semibold">Transfer {idx + 1}</div>
		<div class="mb-4 flex gap-3">
			<input
				type="text"
				placeholder="Nama"
				value={input.nama}
				on:input={(e) => updateItem(idx, 'nama', (e.target! as HTMLInputElement).value)}
				class="w-64 rounded-r border border-gray-300 px-2 py-1 text-sm uppercase"
			/>
			<div class="flex items-center">
				<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm"
					>JL</span
				>
				<input
					type="text"
					inputmode="numeric"
					pattern="[0-9]*"
					placeholder="123"
					value={input.jl.replace(/^JL/, '')}
					on:keypress={(e) => {
						if (!/[0-9]/.test(e.key)) e.preventDefault();
					}}
					on:input={(e) => {
						const angka = (e.target! as HTMLInputElement).value.replace(/\D/g, '');
						updateItem(idx, 'jl', 'JL' + angka);
					}}
					class="w-20 rounded-r border border-gray-300 px-2 py-1 text-sm"
				/>
			</div>

			<div class="flex items-center">
				<span class="rounded-l border border-r-0 border-gray-300 bg-gray-100 px-2 py-1 text-sm"
					>Rp</span
				>
				<input
					type="text"
					inputmode="numeric"
					placeholder="Harga"
					pattern="\d*"
					value={formatRupiahString(String(input.harga ?? ''))}
					on:keydown={(e) => {
						if (['e', 'E', '+', '-'].includes(e.key)) {
							e.preventDefault();
						}
					}}
					on:input={(e) => {
						const target = e.target as HTMLInputElement;
						const raw = target.value;
						const angka = unformatRupiah(raw);
						updateItem(idx, 'harga', angka);
						target.value = formatRupiahString(raw);
					}}
					class="w-28 rounded-r border border-gray-300 px-2 py-1 text-sm"
				/>
			</div>

			<select
				bind:value={input.tipe}
				on:change={(e) =>
					updateItem(idx, 'tipe', (e.target as HTMLSelectElement).value as Item['tipe'])}
				class="focus:ring-opacity-50 w-32 rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
			>
				{#each tipeList.filter((tipe) => tipe !== input.tipe) as tipe}
					<option value={tipe}>{tipe.charAt(0).toUpperCase() + tipe.slice(1)}</option>
				{/each}

				<!-- Tampilkan current value sebagai selected dan disabled -->
				<option value={input.tipe} selected disabled>
					{input.tipe.charAt(0).toUpperCase() + input.tipe.slice(1)}
				</option>
			</select>

			<select
				bind:value={input.lokasi}
				on:change={(e) =>
					updateItem(idx, 'lokasi', (e.target as HTMLSelectElement).value as Item['lokasi'])}
				class="w-40 rounded-md border border-gray-300 px-3 py-[6px] text-sm shadow-sm"
			>
				<!-- Menampilkan opsi selain yang sedang dipilih -->
				{#each lokasiList.filter((lokasi) => lokasi !== input.lokasi) as lokasi}
					<option value={lokasi}>
						{lokasi}
					</option>
				{/each}

				<!-- Menampilkan opsi yang sedang dipilih, tapi tidak bisa dipilih lagi -->
				<option value={input.lokasi} selected disabled>
					{input.lokasi}
				</option>
			</select>
		</div>
	{/if}
{/each}

<button class="mt-4 rounded bg-blue-500 px-4 py-2 text-white" on:click={buatVoucher}>
	Buat Voucher
</button>

{#if showPreview}
	<VoucherPreview {rows} {tanggalDisplay} />
{/if}
