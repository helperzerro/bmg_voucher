<script lang="ts">
	import type { ItemOrGroup, Item } from '../lib/types';
	import { printOnly } from '$lib/printUtils';
	import { getLokasiLabel } from '$lib/lokasi';
	import { formatRupiahString, unformatRupiah } from '$lib/formatRupiah';

	export let inputs: ItemOrGroup[];

	const isZero = (n: number | null | undefined) => (n ?? 0) === 0;

	// Flatten
	$: allItems = inputs.flatMap((entry) => (Array.isArray(entry) ? entry : [entry]));

	// Group by LOKASI -> TIPE
	type TipeMap = Record<string, Item[]>;
	type LokasiMap = Record<string, TipeMap>;

	$: groupedByLokasi = allItems.reduce((acc, it) => {
		const lokasi = it.lokasi ?? 'LAINNYA';
		const tipe = it.tipe ?? 'LAINNYA';
		acc[lokasi] ??= {};
		(acc[lokasi][tipe] ??= []).push(it);
		return acc;
	}, {} as LokasiMap);

	// Helpers subtotal
	const subtotal = (items: Item[]) => items.reduce((s, it) => s + (it.harga ?? 0), 0);
	const subtotalByType = (tm: TipeMap, tipe: string) => subtotal(tm[tipe] ?? []);

	// ========================== PER-LOKASI INPUT ==========================
	// angka murni untuk perhitungan
	let totalPenjualanByLokasi: Record<string, number> = {};
	// string tampilan untuk input (sudah diformat)
	let displayByLokasi: Record<string, string> = {};

	// Inisialisasi default: 0 untuk semua lokasi (angka & tampilan)
	$: {
		for (const lok of Object.keys(groupedByLokasi)) {
			if (totalPenjualanByLokasi[lok] == null) {
				totalPenjualanByLokasi[lok] = 0; // angka murni awal = 0
			}
			if (displayByLokasi[lok] == null) {
				displayByLokasi[lok] = ''; // tampilan awal = "0"
				// atau jika mau awali kosong:
				// displayByLokasi[lok] = '';
			}
		}
	}

	// Handler input: sanitasi → simpan angka → format tampilan
	const handleInputTotalPenjualan = (lokasi: string, raw: string) => {
		const angka = unformatRupiah(raw) ?? 0;
		totalPenjualanByLokasi[lokasi] = angka;
		displayByLokasi[lokasi] = formatRupiahString(String(angka));
	};

	// Rumus per-lokasi berdasarkan input user
	$: totalRekapLokasi = (tm: TipeMap, lokasi: string) =>
		totalPenjualanByLokasi[lokasi] - subtotalByType(tm, 'TRANSFER') - subtotalByType(tm, 'RETUR');

	$: totalSetorLokasi = (tm: TipeMap, lokasi: string) =>
		totalRekapLokasi(tm, lokasi) -
		subtotalByType(tm, 'PETTY CASH') +
		subtotalByType(tm, 'P.PIUTANG') +
		subtotalByType(tm, 'ONGKIR');

	function handlePrintAll() {
		// cetak seluruh rekapan
		printOnly('rekap');
	}

	// Group items by tanggal (per tipe) dan urutkan berdasarkan tanggal
	function groupByTanggal(items: Item[]) {
		const map = new Map<string, Item[]>();

		for (const item of items) {
			const tanggal = item.tanggal ?? '';
			if (!map.has(tanggal)) {
				map.set(tanggal, []);
			}
			map.get(tanggal)!.push(item);
		}

		return Array.from(map.entries())
			.sort(([a], [b]) => {
				// Pastikan format tanggal sudah konsisten (YYYY-MM-DD) biar bisa di-sort langsung
				return new Date(a).getTime() - new Date(b).getTime();
			})
			.map(([tanggal, items]) => ({
				tanggal,
				items
			}));
	}
</script>

<div
	class="mx-auto mb-1 flex w-full max-w-6xl flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between print:hidden"
>
	<h1 class="text-lg font-semibold tracking-tight text-gray-800">Preview Rekapan</h1>

	<div class="flex flex-wrap items-center gap-2">
		<button
			on:click={handlePrintAll}
			class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600
         px-5 py-2.5 text-sm font-medium text-white shadow-md transition
         hover:from-purple-700 hover:to-fuchsia-700
         focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none active:scale-[0.99]
         print:hidden"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12M9 22h6v-6H9v6z"
				/>
			</svg>
			Cetak Semua Rekapan
		</button>
	</div>
</div>

<div class="flex flex-col gap-3" id="rekap">
	{#each Object.entries(groupedByLokasi).filter( ([lokasi, tipeMap]) => Object.keys(tipeMap).some((t) => !['TUNAI', 'PETTY CASH', 'PETTY CASH VB'].includes(t)) ) as [lokasi, tipeMap]}
		<!-- id unik per lokasi untuk target print per lokasi -->
		<section id={'rekap-' + lokasi} class="print:break-after-page">
			<h2 class="mb-2 text-center font-[Calibri] text-[16px] font-bold uppercase">
				REKAPAN {getLokasiLabel(lokasi)}
			</h2>
			<div class="flex gap-10">
				<!-- KIRI: PER LOKASI -->
				<div class="flex w-full flex-col gap-8">
					<!-- Judul per lokasi -->
					<div class="flex flex-col gap-3">
						<!-- Loop tipe di dalam lokasi -->
						{#each Object.entries(tipeMap).filter(([t]) => !['TUNAI', 'PETTY CASH', 'ONGKIR', 'PETTY CASH VB'].includes(t)) as [tipe, items]}
							<table class="w-full table-fixed border font-[Calibri] text-[12px] font-bold">
								<colgroup>
									<col class="w-[45px] print:w-[45px]" />
									<!-- TGL -->
									<col />
									<!-- NAMA -->
									<col class="w-[60px] print:w-[60px]" />
									<!-- JL -->
									<col class="w-[110px] print:w-[110px]" />
									<!-- HARGA -->
								</colgroup>

								<thead>
									<tr>
										<th class="border px-2 py-1 text-center">TGL</th>
										<th class="border px-2 py-1 text-center" colspan="3">{tipe}</th>
									</tr>
								</thead>

								<tbody>
									{#each groupByTanggal(items) as group}
										{#each group.items as item, index}
											<tr>
												{#if index === 0}
													<td
														class="border px-2 py-1 text-center align-top"
														rowspan={group.items.length}
													>
														{group.tanggal.split('/').slice(0, 2).join('/')}
													</td>
												{/if}
												<td class="truncate border px-2 py-1 text-center uppercase">{item.nama}</td>
												<td class="border px-2 py-1 text-center whitespace-nowrap">{item.jl}</td>
												<td class="border px-2 py-1">
													<div class="flex min-w-0 items-center gap-1 px-1">
														<span class="pr-1">Rp</span>
														<span
															class="ml-auto truncate text-right whitespace-nowrap tabular-nums"
														>
															{(item.harga ?? 0).toLocaleString('id-ID')}
														</span>
													</div>
												</td>
											</tr>
										{/each}
									{/each}
									<!-- TOTAL per TIPE di lokasi ini -->
									<tr class="font-semibold">
										<td colspan="3" class="border px-2 py-1 text-center">TOTAL</td>
										<td class="border px-2 py-1">
											<div class="flex items-center gap-1 px-1">
												<span class="pr-1">Rp</span>
												<span class="ml-auto text-right whitespace-nowrap tabular-nums">
													{items
														.reduce((sum, it) => sum + (it.harga ?? 0), 0)
														.toLocaleString('id-ID')}
												</span>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						{/each}
					</div>
				</div>

				<!-- KANAN: Tabel tambahan (PER LOKASI, bukan global) -->
				<div class="w-[400px]">
					<table class="w-full table-fixed border font-[Calibri] text-[12px] font-bold">
						<colgroup>
							<col class="w-[58%]" />
							<col class="w-[42%]" />
						</colgroup>
						<tbody>
							<tr>
								<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap">
									TOTAL PENJUALAN
								</td>
								<td class="border print:px-1 print:py-0.5">
									<div class="relative flex min-w-0 items-center tabular-nums">
										<!-- Prefix Rp: tidak menghalangi interaksi -->
										<span
											class="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 font-[Calibri] text-[12px] font-bold select-none print:left-0"
										>
											Rp
										</span>

										<!-- INPUT: padding-left agar tidak nabrak Rp -->
										<input
											type="text"
											inputmode="numeric"
											autocomplete="off"
											placeholder="0"
											bind:value={displayByLokasi[lokasi]}
											on:input={(e: Event & { currentTarget: HTMLInputElement }) =>
												handleInputTotalPenjualan(lokasi, e.currentTarget.value)}
											class="ml-auto w-full rounded-xl border border-gray-300 bg-white pr-2
           pl-7 text-right font-[Calibri]
           text-[12px] font-bold
           focus:border-emerald-500 focus:ring-0 focus:outline-none
           print:hidden"
											aria-label="Total penjualan"
										/>

										<!-- Nilai saat print -->
										<span class="ml-auto hidden text-right print:inline">
											{displayByLokasi[lokasi]?.trim() || '0'}
										</span>
									</div>
								</td>
							</tr>

							<tr>
								<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
									>TRANSFER</td
								>
								<td class="border px-2 py-1 print:px-1 print:py-0.5">
									{#if !isZero(subtotalByType(tipeMap, 'TRANSFER'))}
										<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
											<span>Rp</span>
											<span class="ml-auto truncate text-right">
												{subtotalByType(tipeMap, 'TRANSFER').toLocaleString('id-ID')}
											</span>
										</div>
									{:else}
										<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
									{/if}
								</td>
							</tr>

							<tr>
								<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
									>RETUR</td
								>
								<td class="border px-2 py-1 print:px-1 print:py-0.5">
									{#if !isZero(subtotalByType(tipeMap, 'RETUR'))}
										<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
											<span>Rp</span>
											<span class="ml-auto truncate text-right">
												{subtotalByType(tipeMap, 'RETUR').toLocaleString('id-ID')}
											</span>
										</div>
									{:else}
										<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
									{/if}
								</td>
							</tr>

							<tr>
								<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
									>TOTAL</td
								>
								<td class="border px-2 py-1 print:px-1 print:py-0.5">
									<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
										<span>Rp</span>
										<span class="ml-auto truncate text-right"
											>{totalRekapLokasi(tipeMap, lokasi).toLocaleString('id-ID')}</span
										>
									</div>
								</td>
							</tr>

							<tr>
								<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
									>P.PIUTANG</td
								>
								<td class="border px-2 py-1 print:px-1 print:py-0.5">
									{#if !isZero(subtotalByType(tipeMap, 'P.PIUTANG'))}
										<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
											<span>Rp</span>
											<span class="ml-auto truncate text-right">
												{subtotalByType(tipeMap, 'P.PIUTANG').toLocaleString('id-ID')}
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
									{#if !isZero(subtotalByType(tipeMap, 'PETTY CASH'))}
										<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
											<span>Rp</span>
											<span class="ml-auto truncate text-right">
												{subtotalByType(tipeMap, 'PETTY CASH').toLocaleString('id-ID')}
											</span>
										</div>
									{:else}
										<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
									{/if}
								</td>
							</tr>

							<!-- ONGKIR -->
							{#if subtotalByType(tipeMap, 'ONGKIR') > 0}
								<tr>
									<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
										>ONGKIR</td
									>
									<td class="border px-2 py-1 print:px-1 print:py-0.5">
										{#if !isZero(subtotalByType(tipeMap, 'ONGKIR'))}
											<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
												<span>Rp</span>
												<span class="ml-auto truncate text-right">
													{subtotalByType(tipeMap, 'ONGKIR').toLocaleString('id-ID')}
												</span>
											</div>
										{:else}
											<div class="flex items-center"><span class="ml-auto text-right">-</span></div>
										{/if}
									</td>
								</tr>
							{/if}

							<tr>
								<td class="border px-2 py-1 print:px-1 print:py-0.5 print:whitespace-nowrap"
									>TOTAL SETOR</td
								>
								<td class="border px-2 py-1 print:px-1 print:py-0.5">
									{#if !isZero(totalSetorLokasi(tipeMap, lokasi))}
										<div class="flex min-w-0 items-center whitespace-nowrap tabular-nums">
											<span>Rp</span>
											<span class="ml-auto truncate text-right">
												{totalSetorLokasi(tipeMap, lokasi).toLocaleString('id-ID')}
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
		</section>
	{/each}
</div>
