<!-- VoucherPreview.svelte -->
<script lang="ts">
	import { terbilang } from '../lib/terbilang';

	export let rows: {
		keteranganTransaksi: string;
		total: number | null;
		tipe: 'TUNAI' | 'TRANSFER' | 'RETUR';
		lokasi: string;
	}[][];

	export let tanggalDisplay: string;

	$: totalGroups = rows.map((group) => group.reduce((sum, row) => sum + (row.total ?? 0), 0));

	function printOnly(id: string) {
		const element = document.getElementById(id);
		if (!element) return;

		const printWindow = window.open('', '', 'width=800,height=600');
		if (!printWindow) return;

		// Ambil semua <style> dan <link> dari <head>
		const headContent = document.head.innerHTML;
		const bodyContent = element.outerHTML;

		printWindow.document.write(`
		<html>
			<head>
				${headContent}
			</head>
			<body onload="window.print(); window.close();">
				${bodyContent}
			</body>
		</html>
	`);

		printWindow.document.close();
		printWindow.focus();
	}

	function printAll() {
		const printWindow = window.open('', '', 'width=800,height=600');
		if (!printWindow) return;

		const headContent = document.head.innerHTML;

		const allContent = rows
			.map((_, i) => {
				const el = document.getElementById(`voucher-${i}`);
				if (!el) return '';
				return `<div class="print-page">${el.outerHTML}</div>`;
			})
			.join('');

		printWindow.document.write(`
		<html>
			<head>
				${headContent}
				<style>
					@media print {
						.print-page {
							page-break-after: always;
							break-after: page;
							margin-bottom: 20px;
						}
					}
				</style>
			</head>
			<body onload="window.print(); window.close();">
				${allContent}
			</body>
		</html>
	`);

		printWindow.document.close();
		printWindow.focus();
	}
</script>

<button on:click={printAll} class="mb-4 rounded bg-blue-500 px-4 py-2 text-white">
	Cetak Semua Voucher
</button>

<div id="print-area">
	{#if rows.length > 0}
		{#each rows as group, i}
			<button on:click={() => printOnly(`voucher-${i}`)}>Print Voucher {i + 1}</button>
			<div
				id={'voucher-' + i}
				class="mt-10 overflow-x-auto rounded border border-gray-300 font-[Calibri] text-[12px]"
			>
				<table class="table-auto border-collapse">
					<thead class="text-left">
						<tr>
							<th class="w-[850px] border pl-2 text-[22px] font-bold" colspan="8"
								>{group[0].lokasi}</th
							>
						</tr>
					</thead>

					<tbody class="border text-sm">
						<tr>
							<td class="w-[600px] pl-2 text-[15px] font-bold" rowspan="2" colspan="6">
								VOUCHER PENERIMAAN KAS / BANK
							</td>
							<td colspan="2" class="align-top">
								<div class="flex items-start">
									<span class="min-w-[70px]">No</span>
									<span class="mr-2">:</span>
									<span></span>
								</div>
							</td>
						</tr>

						<tr>
							<td colspan="2">
								<div class="flex items-start">
									<span class="min-w-[70px]">Tanggal</span>
									<span class="mr-2">:</span>
									<span>{tanggalDisplay}</span>
								</div>
							</td>
						</tr>

						<tr>
							<td colspan="2" class="w-[200px] border pl-2">Diterima dari</td>
							<td colspan="4" class="w-[400px] pl-2">{group[0].tipe}</td>
							<td colspan="2">
								<div class="flex items-start">
									<span class="min-w-[70px]">No. Giro</span>
									<span class="mr-2">:</span>
									<span></span>
								</div>
							</td>
						</tr>

						<tr>
							<td class="w-[60px] text-center">Rp.</td>
							<td class="w-[130px]">{totalGroups[i].toLocaleString('id-ID')}</td>
							<td colspan="6" class="w-[660px] border pl-2">
								{terbilang(totalGroups[i])}
							</td>
						</tr>

						<tr>
							<td class="w-[340px] border text-center" colspan="4">KETERANGAN TRANSAKSI</td>
							<td class="w-[260px] border text-center" colspan="2">TOTAL</td>
							<td class="w-[260px] border text-center" colspan="2">PERKIRAAN DIKREDIT</td>
						</tr>

						{#each Array(4) as _}
							<tr>
								<td colspan="4" class="w-[340px] border-x">&nbsp;</td>
								<td colspan="2" class="w-[260px] border-x">&nbsp;</td>
								<td colspan="2" class="w-[260px] border-x">&nbsp;</td>
							</tr>
						{/each}

						{#each group as row}
							<tr>
								<td class="w-[340px] border-x text-center" colspan="4">{row.keteranganTransaksi}</td
								>
								<td class="w-[260px] border-x text-center" colspan="2"
									>{row.total?.toLocaleString('id-ID') ?? ''}</td
								>
								<td class="w-[260px] border-x text-center" colspan="2"></td>
							</tr>
						{/each}

						{#each Array(4) as _}
							<tr>
								<td colspan="4" class="w-[340px] border-x">&nbsp;</td>
								<td colspan="2" class="w-[260px] border-x">&nbsp;</td>
								<td colspan="2" class="w-[260px] border-x">&nbsp;</td>
							</tr>
						{/each}

						<tr>
							<td class="w-[170px] border text-center" colspan="2">Disetujui Oleh</td>
							<td class="w-[170px] border text-center" colspan="2">Diverifikasi Oleh</td>
							<td class="w-[260px] border pl-2" colspan="2">Dibukukan Oleh:</td>
							<td class="w-[260px] border pl-2" colspan="2">Dikode Oleh:</td>
						</tr>

						<tr>
							<td class="w-[170px] border-x" colspan="2">&nbsp;</td>
							<td class="w-[170px] border-x" colspan="2">&nbsp;</td>
							<td class="w-[260px] border-x text-center" colspan="2">Diterima Oleh:</td>
							<td class="w-[260px] border-x text-center" colspan="2">Disetor Oleh:</td>
						</tr>

						{#each Array(2) as _}
							<tr>
								<td class="w-[170px] border-x" colspan="2">&nbsp;</td>
								<td class="w-[170px] border-x" colspan="2">&nbsp;</td>
								<td class="w-[260px] border-x" colspan="2">&nbsp;</td>
							</tr>
						{/each}

						<tr>
							<td class="w-[170px] border-x text-center" colspan="2">Direktur/Manager</td>
							<td class="w-[170px] border-x" colspan="2">&nbsp;</td>
							<td class="w-[260px] border-x" colspan="2">&nbsp;</td>
						</tr>
					</tbody>
				</table>
			</div>
		{/each}
	{/if}
</div>
