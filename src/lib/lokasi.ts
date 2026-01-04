// src/lib/lokasi.ts
export const lokasiLabels = {
	// Kalau mau tambahin data baru tingal tambahkan disini
	BMG: 'PT. BAJA MULTI GEMILANG.',
	ST2: 'TB. SINAR TERANG.'
} as const;

export const lokasiList = Object.keys(lokasiLabels) as (keyof typeof lokasiLabels)[];

// helper untuk dapatkan kepanjangan
export function getLokasiLabel(kode: string): string {
	return lokasiLabels[kode as keyof typeof lokasiLabels] ?? kode;
}
