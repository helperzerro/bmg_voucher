import ExcelJS from 'exceljs';

export async function exportToExcel(items: any[]) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Transfer');

	worksheet.columns = [
		{ key: 'col1', width: 20 }, // Kolom A
		{ key: 'col2', width: 15 }, // Kolom B
		{ key: 'col3', width: 20 }, // Kolom C
		{ key: 'col4', width: 20 }, // Kolom D
		{ key: 'col5', width: 15 }, // Kolom E
		{ key: 'col6', width: 5 }, // Kolom F
		{ key: 'col7', width: 20 } // Kolom G
	];

	worksheet.mergeCells('A1:G1');
	worksheet.getCell('A1').value = 'Sinar Terang 2';
	worksheet.getCell('A1').font = { bold: true };
	worksheet.getCell('A1').alignment = { horizontal: 'left' };

	worksheet.mergeCells('A2:D3');
	worksheet.getCell('A2').value = 'Voucher Penerimaan Kas / Bank';
	worksheet.getCell('A2').font = { bold: true };

	worksheet.getCell('E2').value = 'No';
	worksheet.getCell('F2').value = ':';
	worksheet.getCell('E3').value = 'Tanggal';
	worksheet.getCell('F3').value = ':';
	worksheet.getCell('G3').value = '21 July 2025';

	worksheet.mergeCells('A4:B4');
	worksheet.getCell('A4').value = 'Diterima dari';
	worksheet.mergeCells('C4:D4');
	worksheet.getCell('C4').value = 'TUNAI';
	worksheet.getCell('E4').value = 'No. Giro';
	worksheet.getCell('F4').value = ':';

	worksheet.getCell('A5').value = 'Rp.';
	worksheet.getCell('B5').value = '200000';
	worksheet.mergeCells('C5:G5');
	worksheet.getCell('C5').value = 'Sembilan Ratus tujuh pulu ribu rupiah';

	// worksheet.addRow(['Diterima dari', 'Tunai', 'No Giro']);
	// worksheet.addRow([`Total Harga: ...`, `Terbilang: ...`]);
	worksheet.addRow([]);

	worksheet.addRow(['Nama', 'JL', 'Harga']).font = { bold: true };

	items.forEach((item) => {
		worksheet.addRow([item.nama, item.jl, item.harga ?? 0]);
	});

	// Export to file
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = 'transferan.xlsx';
	a.click();
	URL.revokeObjectURL(url);
}
