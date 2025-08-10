// src/lib/types.ts
import { lokasiLabels } from './lokasi';

export type Item = {
	nama: string;
	jl: string;
	harga: number | null;
	tipe: 'TUNAI' | 'TRANSFER' | 'RETUR' | 'PETTY CASH' | 'P.PIUTANG' | 'P.PIUTANG TRANSFER';
	lokasi: keyof typeof lokasiLabels;
	tanggal: string;
};

export type ItemOrGroup = Item | Item[];

export type Row = {
	keteranganTransaksi: string;
	total: number | null;
	tipe: 'TUNAI' | 'TRANSFER' | 'RETUR' | 'PETTY CASH' | 'P.PIUTANG' | 'P.PIUTANG TRANSFER';
	lokasi: string;
	tanggal: string;
};

export const tipeList: Item['tipe'][] = [
	'TUNAI',
	'TRANSFER',
	'RETUR',
	'PETTY CASH',
	'P.PIUTANG',
	'P.PIUTANG TRANSFER'
];
