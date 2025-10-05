<script lang="ts">
	import VoucherTable from './VoucherTable.svelte';
	import { printOnly, printAll } from '../lib/printUtils';

	import 'flatpickr/dist/flatpickr.min.css';

	export let rows: {
		keteranganTransaksi: string;
		total: number | null;
		tipe:
			| 'TUNAI'
			| 'TRANSFER'
			| 'RETUR'
			| 'PETTY CASH'
			| 'ONGKIR'
			| 'P.PIUTANG'
			| 'P.PIUTANG TRANSFER'
			| 'PETTY CASH VB';
		lokasi: string;
		tanggal: string;
	}[][];

	$: totalGroups = rows.map((group) => group.reduce((sum, row) => sum + (row.total ?? 0), 0));

	function handlePrintAll() {
		printAll(rows);
	}
</script>

<!-- Toolbar / Actions -->
<div class="mx-auto mb-5 flex w-full max-w-6xl items-center justify-between px-4 print:hidden">
	<h1 class="text-lg font-semibold tracking-tight text-gray-800">Preview Voucher</h1>

	<button
		on:click={handlePrintAll}
		class="inline-flex items-center gap-2 rounded-xl bg-purple-600 bg-gradient-to-r from-purple-600 to-fuchsia-600
  px-5 py-2.5 text-sm font-medium text-white shadow-md transition
  hover:from-purple-700 hover:to-fuchsia-700
  focus:outline-none active:scale-95 print:hidden"
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
		Cetak Semua Voucher
	</button>
</div>

<!-- KONTEN -->
<div id="print-area" class="mx-auto w-full max-w-6xl px-4">
	{#each rows as group, i}
		<!-- Kartu voucher -->
		<section
			class="mb-6 break-inside-avoid rounded-2xl border border-gray-200 bg-white p-4 shadow-sm
             md:p-5 print:mb-0 print:break-after-page print:rounded-none print:border-0 print:p-0
             print:shadow-none"
		>
			<!-- Komponen voucher -->
			<VoucherTable {group} total={totalGroups[i]} index={i} onPrint={printOnly} />
		</section>
	{/each}
</div>
