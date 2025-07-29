<script lang="ts">
	import VoucherTable from './VoucherTable.svelte';
	import { printOnly, printAll } from '../lib/printUtils';

	export let rows: {
		keteranganTransaksi: string;
		total: number | null;
		tipe: 'TUNAI' | 'TRANSFER' | 'RETUR' | 'PETTY CASH' | 'P.PIUTANG' | 'P.PIUTANG TRANSFER';
		lokasi: string;
	}[][];

	export let tanggalDisplay: string;

	$: totalGroups = rows.map((group) => group.reduce((sum, row) => sum + (row.total ?? 0), 0));

	function handlePrintAll() {
		printAll(rows);
	}
</script>

<button on:click={handlePrintAll} class="mb-4 rounded bg-blue-500 px-4 py-2 text-white">
	Cetak Semua Voucher
</button>

<div id="print-area">
	{#each rows as group, i}
		<VoucherTable {group} {tanggalDisplay} total={totalGroups[i]} index={i} onPrint={printOnly} />
	{/each}
</div>
