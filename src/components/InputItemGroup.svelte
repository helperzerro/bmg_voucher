<script lang="ts">
	import type { Item } from '../lib/types';
	import { formatRupiahString, unformatRupiah } from '../lib/formatRupiah';

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

	import { lokasiLabels } from '../lib/lokasi';
</script>

<button
	on:click={() => tambahItemKeGrup(idx)}
	class="mt-2 rounded bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
>
	Tambah Item ke Grup {idx + 1}
</button>

<div class="mb-4 rounded border border-green-500 p-4">
	<div class="mb-2 flex items-center justify-between font-semibold">
		<span>Transfer {idx + 1}</span>
		<button
			on:click={() => hapusInput(idx)}
			class="rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
		>
			Hapus
		</button>
	</div>

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
