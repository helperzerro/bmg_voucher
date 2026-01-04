import type { Item } from './types';

export function formatJl(item: Item) {
	if (!item.jl) return '-';

	const angka = item.jl.replace(/\D/g, '');
	if (!angka) return '-';

	const year = new Date().getFullYear().toString().slice(-2);

	switch (item.lokasi) {
		case 'BMG':
			return `BMG-${year}/i/${angka}`;
		case 'ST2':
			return `ST2-${year}/i/${angka}`;
		default:
			return angka;
	}
}
