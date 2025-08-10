// src/lib/utils.ts
import type { Item, ItemOrGroup } from './types';
import { lokasiList } from './lokasi';

// Fungsi buat nambah item biasa
export function tambahItem(inputs: ItemOrGroup[]): ItemOrGroup[] {
	return [...inputs, { nama: '', jl: '', harga: null, tipe: 'TRANSFER', lokasi: lokasiList[0] }];
}

// Fungsi buat nambah grup item (misal 2 item di grup)
export function tambahGrup(inputs: ItemOrGroup[]): ItemOrGroup[] {
	return [
		...inputs,
		[
			{ nama: '', jl: '', harga: null, tipe: 'TRANSFER', lokasi: lokasiList[0] },
			{ nama: '', jl: '', harga: null, tipe: 'TRANSFER', lokasi: lokasiList[0] }
		]
	];
}
