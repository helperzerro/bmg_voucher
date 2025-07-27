export function terbilang(n: number): string {
	const satuan = [
		'',
		'satu',
		'dua',
		'tiga',
		'empat',
		'lima',
		'enam',
		'tujuh',
		'delapan',
		'sembilan',
		'sepuluh',
		'sebelas'
	];

	function penyebut(n: number): string {
		if (n < 12) {
			return satuan[n];
		} else if (n < 20) {
			return penyebut(n - 10) + ' belas';
		} else if (n < 100) {
			return penyebut(Math.floor(n / 10)) + ' puluh ' + penyebut(n % 10);
		} else if (n < 200) {
			return 'seratus ' + penyebut(n - 100);
		} else if (n < 1000) {
			return penyebut(Math.floor(n / 100)) + ' ratus ' + penyebut(n % 100);
		} else if (n < 2000) {
			return 'seribu ' + penyebut(n - 1000);
		} else if (n < 1000000) {
			return penyebut(Math.floor(n / 1000)) + ' ribu ' + penyebut(n % 1000);
		} else if (n < 1000000000) {
			return penyebut(Math.floor(n / 1000000)) + ' juta ' + penyebut(n % 1000000);
		} else if (n < 1000000000000) {
			return penyebut(Math.floor(n / 1000000000)) + ' milyar ' + penyebut(n % 1000000000);
		} else {
			return 'angka terlalu besar';
		}
	}

	return (penyebut(n).replace(/\s+/g, ' ').trim() + ' rupiah').toUpperCase();
}
