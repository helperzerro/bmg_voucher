<script lang="ts">
	import { exportToExcel } from '../routes/exportExcel';
	type Item = {
		nama: string;
		jl: string;
		harga: number | null;
	};

	type ItemOrGroup = Item | Item[];

	let inputs: ItemOrGroup[] = [];

	// Fungsi buat nambah item biasa
	function tambahItem() {
		inputs = [...inputs, { nama: '', jl: '', harga: null }];
	}

	// Fungsi buat nambah grup item (misal 2 item di grup)
	function tambahGrup() {
		inputs = [
			...inputs,
			[
				{ nama: '', jl: '', harga: null },
				{ nama: '', jl: '', harga: null }
			]
		];
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
</script>

<div class="mb-4 space-x-2">
	<button on:click={tambahItem} class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
		>Tambah Item</button
	>
	<button on:click={tambahGrup} class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
		>Tambah Grup</button
	>
</div>

<!-- Render inputs -->
{#each inputs as input, idx}
	{#if Array.isArray(input)}
		<div class="mb-4 rounded border border-green-500 p-4">
			<div class="mb-2 font-semibold">Transfer {idx + 1}</div>
			{#each input as groupItem, gidx}
				<div class="mb-2 flex gap-3">
					<input
						type="text"
						placeholder="Nama"
						value={groupItem.nama}
						on:input={(e) =>
							updateItemInGroup(idx, gidx, 'nama', (e.target! as HTMLInputElement).value)}
						class="w-32 rounded border border-gray-300 px-2 py-1"
					/>
					<input
						type="text"
						placeholder="JL"
						value={groupItem.jl}
						on:input={(e) =>
							updateItemInGroup(idx, gidx, 'jl', (e.target! as HTMLInputElement).value)}
						class="w-24 rounded border border-gray-300 px-2 py-1"
					/>
					<input
						type="number"
						placeholder="Harga"
						min="0"
						value={groupItem.harga ?? ''}
						on:input={(e) =>
							updateItemInGroup(
								idx,
								gidx,
								'harga',
								parseInt((e.target! as HTMLInputElement).value) || null
							)}
						class="w-24 rounded border border-gray-300 px-2 py-1"
					/>
				</div>
			{/each}
		</div>
	{:else}
		<div class="mb-2 font-semibold">Transfer {idx + 1}</div>
		<div class="mb-4 flex gap-3">
			<input
				type="text"
				placeholder="Nama"
				value={input.nama}
				on:input={(e) => updateItem(idx, 'nama', (e.target! as HTMLInputElement).value)}
				class="w-32 rounded border border-gray-300 px-2 py-1"
			/>
			<input
				type="text"
				placeholder="JL"
				value={input.jl}
				on:input={(e) => updateItem(idx, 'jl', (e.target! as HTMLInputElement).value)}
				class="w-24 rounded border border-gray-300 px-2 py-1"
			/>
			<input
				type="number"
				placeholder="Harga"
				min="0"
				value={input.harga ?? ''}
				on:input={(e) =>
					updateItem(idx, 'harga', parseInt((e.target! as HTMLInputElement).value) || null)}
				class="w-24 rounded border border-gray-300 px-2 py-1"
			/>
		</div>
	{/if}
{/each}

<!-- <button
	on:click={() => exportToExcel(inputs)}
	class="mt-4 rounded bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
>
	Export ke Excel
</button> -->

<!-- <pre class="mt-6 max-h-64 overflow-auto rounded bg-gray-100 p-4 text-sm">
  {JSON.stringify(inputs, null, 2)}
  </pre> -->

<!-- Tabel Preview -->
{#if inputs.length >= 0}
	<div class="mt-10 overflow-x-auto rounded border border-gray-300">
		<table class="min-w-full table-auto border-collapse">
			<thead class="bg-gray-200 text-left text-sm font-semibold text-gray-700">
				<tr class="border px-4 py-2">
					<th class="">SINAR TERANG 2</th>
				</tr>
			</thead>
			<tbody class="text-sm">
				<tr class="even:bg-gray-50">
					<!-- Kolom 1 -->
					<td class="border px-4 py-2 align-top font-semibold" rowspan="2"
						>VOUCHER PENERIMAAN KAS / BANK</td
					>

					<!-- Kolom 2: Berisi dua baris -->
					<td class="border px-4 py-2">
						<div class="flex flex-col gap-1">
							<span>No</span>
							<span>Tanggal</span>
						</div>
					</td>
					<td class="border px-4 py-2">
						<div class="flex flex-col gap-1">
							<span>:</span>
							<span>:</span>
						</div>
					</td>
					<td class="border px-4 py-2">
						<div class="flex flex-col gap-1">
							<span></span>
							<span>22 July 2025</span>
						</div>
					</td>
				</tr>
				<tr>
					<td>Diterima dari</td>
					<td>TUNAI</td>
					<td>No. Giro</td>
					<td>:</td>
					<td></td>
				</tr>
			</tbody>
		</table>
	</div>
{/if}
