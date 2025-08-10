// src/lib/lokasi.ts
export const lokasiLabels = {
	// Kalau mau tambahin data baru tingal tambahkan disini
	BMG2: 'PT. BAJA MULTI GEMILANG 2',
	ST2: 'SINAR TERANG 2'
} as const;

export const lokasiList = Object.keys(lokasiLabels) as (keyof typeof lokasiLabels)[];

// helper untuk dapatkan kepanjangan
export function getLokasiLabel(kode: string): string {
	return lokasiLabels[kode as keyof typeof lokasiLabels] ?? kode;
}
