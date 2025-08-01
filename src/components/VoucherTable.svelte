<!-- src/lib/components/VoucherTable.svelte -->
<script lang="ts">
	import { formatTanggalIndo } from '$lib/formatTanggal';
	import { terbilang } from '../lib/terbilang';

	export let group: {
		keteranganTransaksi: string;
		total: number | null;
		tipe: 'TUNAI' | 'TRANSFER' | 'RETUR' | 'PETTY CASH' | 'P.PIUTANG' | 'P.PIUTANG TRANSFER';
		lokasi: string;
		tanggal: string;
	}[];

	export let total: number;
	export let index: number;
	export let onPrint: (id: string) => void;
</script>

<button
	on:click={() => onPrint(`voucher-${index}`)}
	class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium
         text-slate-700 shadow-sm transition hover:bg-slate-50
         focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none active:scale-[0.99]
         print:hidden"
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
			d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12M9 22h6v-6H9v6z"
		/>
	</svg>
	Print Voucher {index + 1}
</button>

<div id={'voucher-' + index} class="mt-1 overflow-x-auto rounded font-[Calibri]">
	<table class="table-auto border-collapse">
		<thead class="text-left">
			<tr>
				<th class="w-[850px] pl-2 text-[28px] font-bold" colspan="8">{group[0].lokasi}</th>
			</tr>
		</thead>

		<tbody class="border text-[16px]">
			<tr>
				<td class="w-[600px] pl-2 text-[20px] font-bold" rowspan="2" colspan="6">
					VOUCHER <span
						>{['RETUR', 'PETTY CASH'].includes(group[0].tipe) ? 'PENGELUARAN' : 'PENERIMAAN'}</span
					> KAS / BANK
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
						<span>{formatTanggalIndo(group[0].tanggal)}</span>
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
				<td colspan="2" class="w-[190px]">
					<div class="flex items-center">
						<span class="pl-1">Rp</span>
						<span class="ml-auto pr-10 text-right tabular-nums">
							{total.toLocaleString('id-ID')}
						</span>
					</div>
				</td>
				<td colspan="6" class="w-[660px] border pl-2">
					{terbilang(total)}
				</td>
			</tr>

			<tr>
				<td class="w-[340px] border text-center" colspan="4">KETERANGAN TRANSAKSI</td>
				<td class="w-[260px] border text-center" colspan="2">TOTAL</td>
				<td class="w-[260px] border text-center" colspan="2">PERKIRAAN DIKREDIT</td>
			</tr>

			{#each Array(6) as _}
				<tr>
					<td colspan="4" class="w-[340px] border-x">&nbsp;</td>
					<td colspan="2" class="w-[260px] border-x">&nbsp;</td>
					<td colspan="2" class="w-[260px] border-x">&nbsp;</td>
				</tr>
			{/each}

			{#each group as row}
				<tr>
					<td class="w-[340px] border-x text-center uppercase" colspan="4"
						>{row.keteranganTransaksi}</td
					>
					<td class="w-[260px] border-x text-center" colspan="2"
						>{row.total?.toLocaleString('id-ID') ?? ''}</td
					>
					<td class="w-[260px] border-x text-center" colspan="2"></td>
				</tr>
			{/each}

			{#each Array(6) as _}
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
