<!-- src/lib/components/VoucherTable.svelte -->
<script lang="ts">
	import { terbilang } from '../lib/terbilang';

	export let group: {
		keteranganTransaksi: string;
		total: number | null;
		tipe: 'TUNAI' | 'TRANSFER' | 'RETUR' | 'PETTY CASH' | 'P.PIUTANG' | 'P.PIUTANG TRANSFER';
		lokasi: string;
	}[];

	export let tanggalDisplay: string;
	export let total: number;
	export let index: number;
	export let onPrint: (id: string) => void;
</script>

<button on:click={() => onPrint(`voucher-${index}`)}>Print Voucher {index + 1}</button>
<div
	id={'voucher-' + index}
	class="mt-10 overflow-x-auto rounded border border-gray-300 font-[Calibri]"
>
	<table class="table-auto border-collapse text-[40px]">
		<thead class="text-left">
			<tr>
				<th class="w-[850px] border pl-2 text-[36px] font-bold" colspan="8">{group[0].lokasi}</th>
			</tr>
		</thead>

		<tbody class="border text-[20px]">
			<tr>
				<td class="w-[600px] pl-2 text-[26px] font-bold" rowspan="2" colspan="6">
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
				<td class="w-[130px]">{total.toLocaleString('id-ID')}</td>
				<td colspan="6" class="w-[660px] border pl-2">
					{terbilang(total)}
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
					<td class="w-[340px] border-x text-center uppercase" colspan="4"
						>{row.keteranganTransaksi}</td
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
