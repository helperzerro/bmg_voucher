<script lang="ts">
	import type { ItemOrGroup, Item } from '../lib/types';
	import { formatRupiahString, unformatRupiah } from '../lib/formatRupiah';
	import { printOnly } from '$lib/printUtils';

	export let inputs: ItemOrGroup[];
	export let tanggal: string; // Kamu bisa kirim tanggal dari komponen induk
	const isZero = (n: number | null | undefined) => (n ?? 0) === 0;

	let totalPenjualanRaw: number = 0;

	let namaLokasi = '';

	$: allItems = inputs.flatMap((entry) => (Array.isArray(entry) ? entry : [entry]));

	// Kelompokkan berdasarkan tipe
	$: groupedByTipe = (() => {
		const result: Record<string, Item[]> = {};
		for (const item of allItems) {
			if (!result[item.tipe]) {
				result[item.tipe] = [];
			}
			result[item.tipe].push(item);
		}
		return result;
	})();

	// Subtotal per tipe (kanan)
	$: transferTotal =
		groupedByTipe['TRANSFER']?.reduce((sum, item) => sum + (item.harga ?? 0), 0) ?? 0;

	$: returTotal = groupedByTipe['RETUR']?.reduce((sum, item) => sum + (item.harga ?? 0), 0) ?? 0;
	$: ppiutangTotal =
		groupedByTipe['P.PIUTANG']?.reduce((sum, item) => sum + (item.harga ?? 0), 0) ?? 0;
	$: pettyCashTotal =
		groupedByTipe['PETTY CASH']?.reduce((sum, item) => sum + (item.harga ?? 0), 0) ?? 0;
	// TOTAL rekap kanan = TOTAL PENJUALAN (input) - TRANSFER - RETUR
	$: totalRekap = totalPenjualanRaw - transferTotal - returTotal;
	$: totalSetor = totalRekap - pettyCashTotal + ppiutangTotal;

	$: totalLokasiBMG = groupedByTipe['BMG'];
</script>

<input
	type="text"
	inputmode="numeric"
	pattern="\d*"
	placeholder="0"
	value={formatRupiahString(String(totalPenjualanRaw))}
	on:input={(e: Event & { currentTarget: HTMLInputElement }) => {
		const target = e.currentTarget;
		const raw = target.value;
		const angka = unformatRupiah(raw) ?? 0;
		totalPenjualanRaw = angka;
	}}
	class="w-full rounded-xl pl-8 text-right font-[Calibri] text-[12px]
                     font-bold focus:ring-0 focus:outline-none print:pl-6 print:text-[14px]"
/>

<input
	type="text"
	placeholder="Ketik nama lokasi"
	bind:value={namaLokasi}
	class="w-full rounded-md border px-3 py-[6px] text-sm shadow-sm"
/>
<button on:click={() => printOnly(`rekap`)}>Print</button>

<div class="flex flex-col gap-3" id={'rekap'}>
	<h2 class="text-center font-[Calibri] text-[18px] font-bold uppercase">REKAPAN {namaLokasi}</h2>
	<div class="flex gap-4">
		<!-- KIRI: Tipe-tipe -->
		<div class="flex w-full flex-col gap-4">
			{#each Object.entries(groupedByTipe) as [tipe, items]}
				<table
					class="w-full table-auto border border-gray-400 font-[Calibri] text-[12px] font-bold"
				>
					<thead class="bg-gray-100">
						<tr>
							<th class="w-[70px] border px-2 py-1 text-center">TGL TF</th>
							<th class="border px-2 py-1 text-center" colspan="3">{tipe}</th>
						</tr>
					</thead>
					<tbody>
						{#each items as item, i}
							<tr>
								{#if i === 0}
									<td class="border px-2 py-1 text-center" rowspan={items.length + 1}>
										{tanggal}
									</td>
								{/if}
								<td class="border px-2 py-1 text-center uppercase">{item.nama}</td>
								<td class="w-[90px] border px-2 py-1 text-center">{item.jl}</td>

								<!-- HARGA ITEM: Rp kiri, angka kanan -->
								<td class="border px-2 py-1">
									<div class="flex items-center">
										<span>Rp</span>
										<span class="ml-auto text-right">
											{(item.harga ?? 0).toLocaleString('id-ID')}
										</span>
									</div>
								</td>
							</tr>
						{/each}

						<!-- TOTAL: Rp kiri, angka kanan -->
						<tr class="bg-gray-100 font-bold">
							<td colspan="2" class="border px-2 py-1 text-center">TOTAL</td>
							<td class="border px-2 py-1">
								<div class="flex items-center">
									<span>Rp</span>
									<span class="ml-auto text-right">
										{items
											.reduce((sum, item) => sum + (item.harga ?? 0), 0)
											.toLocaleString('id-ID')}
									</span>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			{/each}
		</div>

		<!-- KANAN: Tabel tambahan (lebih rapat & anti-wrap saat print) -->
		<div class="w-[300px]">
			<table class="w-full table-fixed border border-gray-400 font-[Calibri] text-[12px] font-bold">
				<colgroup>
					<!-- kolom label -->
					<col class="w-[58%]" />
					<!-- kolom nilai -->
					<col class="w-[42%]" />
				</colgroup>
				<tbody>
					<tr>
						<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap">
							TOTAL PENJUALAN
						</td>
						<td class="border px-2 py-1 print:px-1 print:py-0.5">
							<div class="relative flex min-w-0 items-center whitespace-nowrap tabular-nums">
								<span> Rp </span>
								<span class="ml-auto truncate text-right">
									{totalPenjualanRaw.toLocaleString('id-ID')}
								</span>
							</div>
						</td>
					</tr>

					<tr>
						<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
							>TRANSFER</td
						>
						<td class="border px-2 py-1 print:px-1 print:py-0.5">
							{#if !isZero(transferTotal)}
								<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
									<span>Rp</span>
									<span class="ml-auto truncate text-right">
										{transferTotal.toLocaleString('id-ID')}
									</span>
								</div>
							{:else}
								<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
							{/if}
						</td>
					</tr>

					<tr>
						<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap">RETUR</td>
						<td class="border px-2 py-1 print:px-1 print:py-0.5">
							{#if !isZero(returTotal)}
								<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
									<span>Rp</span>
									<span class="ml-auto truncate text-right">
										{returTotal.toLocaleString('id-ID')}
									</span>
								</div>
							{:else}
								<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
							{/if}
						</td>
					</tr>

					<tr>
						<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap">TOTAL</td>
						<td class="border px-2 py-1 print:px-1 print:py-0.5">
							{#if !isZero(totalRekap)}
								<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
									<span>Rp</span>
									<span class="ml-auto truncate text-right">
										{totalRekap.toLocaleString('id-ID')}
									</span>
								</div>
							{:else}
								<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
							{/if}
						</td>
					</tr>

					<tr>
						<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
							>P.PIUTANG</td
						>
						<td class="border px-2 py-1 print:px-1 print:py-0.5">
							{#if !isZero(ppiutangTotal)}
								<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
									<span>Rp</span>
									<span class="ml-auto truncate text-right">
										{ppiutangTotal.toLocaleString('id-ID')}
									</span>
								</div>
							{:else}
								<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
							{/if}
						</td>
					</tr>

					<tr>
						<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
							>PETTY CASH</td
						>
						<td class="border px-2 py-1 print:px-1 print:py-0.5">
							{#if !isZero(pettyCashTotal)}
								<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
									<span>Rp</span>
									<span class="ml-auto truncate text-right">
										{pettyCashTotal.toLocaleString('id-ID')}
									</span>
								</div>
							{:else}
								<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
							{/if}
						</td>
					</tr>

					<tr>
						<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
							>TOTAL SETOR</td
						>
						<td class="border px-2 py-1 print:px-1 print:py-0.5">
							{#if !isZero(totalSetor)}
								<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
									<span>Rp</span>
									<span class="ml-auto truncate text-right">
										{totalSetor.toLocaleString('id-ID')}
									</span>
								</div>
							{:else}
								<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
