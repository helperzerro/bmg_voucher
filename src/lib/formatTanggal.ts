export function formatTanggalIndo(tanggal: string | undefined | null): string {
	if (!tanggal) return '';

	const parts = tanggal.split('/');
	if (parts.length !== 3) return tanggal;

	const [hariStr, bulanStr, tahunStr] = parts;
	const hari = parseInt(hariStr);
	const bulan = parseInt(bulanStr);
	const tahun = parseInt(tahunStr);

	const namaBulan = [
		'Januari',
		'Februari',
		'Maret',
		'April',
		'Mei',
		'Juni',
		'Juli',
		'Agustus',
		'September',
		'Oktober',
		'November',
		'Desember'
	];

	if (
		isNaN(hari) ||
		isNaN(bulan) ||
		isNaN(tahun) ||
		bulan < 1 ||
		bulan > 12 ||
		hari < 1 ||
		hari > 31
	) {
		return tanggal;
	}

	return `${hari} ${namaBulan[bulan - 1]} ${tahun}`;
}
