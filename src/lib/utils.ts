// src/lib/utils.ts
import type { Item, ItemOrGroup } from './types';
import { lokasiList } from './lokasi';

function createEmptyItem(): Item {
	return {
		nama: '',
		jl: '',
		harga: null,
		tipe: 'TRANSFER',
		lokasi: lokasiList[0],
		tanggal: ''
	};
}

export function tambahItem(inputs: ItemOrGroup[]): ItemOrGroup[] {
	return [...inputs, createEmptyItem()];
}

export function tambahGrup(inputs: ItemOrGroup[]): ItemOrGroup[] {
	return [...inputs, [createEmptyItem(), createEmptyItem()]];
}
