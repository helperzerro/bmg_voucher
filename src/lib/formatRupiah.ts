export const formatRupiahString = (str: string): string => {
	const cleaned = str.replace(/[^\d]/g, '');
	if (!cleaned) return '';
	return parseInt(cleaned).toLocaleString('id-ID');
};

export const unformatRupiah = (str: string): number | null => {
	const cleaned = str.replace(/[^\d]/g, '');
	const num = parseInt(cleaned);
	return isNaN(num) ? null : num;
};
