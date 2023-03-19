export function sortSizes(uniqueProductSizes: string[]) {
	const sortedSizes = [
		'AU6',
		'AU8',
		'AU10',
		'AU12',
		'AU14',
		'AU16',
		'AU18',
		'AU20',
		'AU22',
		'US0/AU4',
		'US2/AU6',
		'US4/AU8',
		'US6/AU10',
		'US8/AU12',
		'US10/AU14',
		'US12/AU16',
		'US14/AU18',
		'US16/AU20',
		'US18/AU22',
		'US 5-5.5',
		'US6',
		'US 6-6.5',
		'US6.5',
		'US7',
		'US 7-7.5',
		'US7.5',
		'US8',
		'US 8-8.5',
		'US8.5',
		'US8-8.5',
		'US9',
		'US 9-9.5',
		'US9-9.5',
		'US9.5',
		'US10',
		'US 10-10.5',
		'US10.5',
		'US11',
		'US11.5',
		'US 11-11.5',
		'US11-11.5',
		'US11/11.5',
		'US12',
		'US 12-12.5',
		'US12.5',
		'US13',
		'US13.5',
		'US 13-13.5',
		'US13/13.5',
		'US14/Au18',
		'XXS',
		'XS',
		'SS',
		'S',
		'S/M',
		'M',
		'M(33-35)',
		'ML',
		'L',
		'L(35-37)',
		'L/XL',
		'XL',
		'XXL',
		'XXXL',
		'2.125"/53mm',
		'2.75"/69mm',
		'3.25"/83mm',
		'4"/101mm',
		'8',
		'10',
		'12',
		'14',
		'16',
		'18',
		'28',
		'30',
		'30"',
		'32',
		'32"',
		'34',
		'34"',
		'36',
		'36"',
		'38',
		'38"',
		'40',
		'40"',
		'42',
		'42"',
		'One Size',
		'S/M 56cm',
		'M/L 58cm',
		'M/L',
		'L/XL 60cm',
		'L/XL 61cm',
		'XXL 63cm',
	].filter((size) => new Set(uniqueProductSizes).has(size));
	return sortedSizes;
}