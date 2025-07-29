export function printOnly(id: string) {
	const element = document.getElementById(id);
	if (!element) return;

	const printWindow = window.open('', '', 'width=800,height=600');
	if (!printWindow) return;

	// Ambil semua <style> dan <link> dari <head>
	const headContent = document.head.innerHTML;
	const bodyContent = element.outerHTML;

	printWindow.document.write(`
		<html>
			<head>
				${headContent}
			</head>
			<body onload="window.print(); window.close();">
				${bodyContent}
			</body>
		</html>
	`);

	printWindow.document.close();
	printWindow.focus();
}

export function printAll(rows: any[][]) {
	const printWindow = window.open('', '', 'width=800,height=600');
	if (!printWindow) return;

	const headContent = document.head.innerHTML;

	const allContent = rows
		.map((_, i) => {
			const el = document.getElementById(`voucher-${i}`);
			if (!el) return '';
			return `<div class="print-page">${el.outerHTML}</div>`;
		})
		.join('');

	printWindow.document.write(`
		<html>
			<head>
				${headContent}
				<style>
					@media print {
						.print-page {
							page-break-after: always;
							break-after: page;
							margin-bottom: 20px;
						}
					}
				</style>
			</head>
			<body onload="window.print(); window.close();">
				${allContent}
			</body>
		</html>
	`);

	printWindow.document.close();
	printWindow.focus();
}
