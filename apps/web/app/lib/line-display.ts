export type LineDisplay = {
	compareAt: number | null;
	discountLabels: Array<{ amount: number | null; label: string }>;
	pricePerUnit: number;
	showWasNow: boolean;
};

type LineDisplayAllocation = {
	[key: string]: unknown;
	code?: string | null;
	discountedAmount?: {
		amount: number;
	} | null;
	title?: string | null;
};

export type LineDisplayInput = {
	cost: {
		compareAtAmountPerQuantity?: {
			amount: number;
		} | null;
		totalAmount: {
			amount: number;
		};
	};
	discountAllocations?: Array<LineDisplayAllocation> | null;
	quantity: number;
};

export function getLineDisplay(node: LineDisplayInput): LineDisplay {
	const pricePerUnit = Number(node.cost.totalAmount.amount) / node.quantity;
	const compareAtRaw = node.cost.compareAtAmountPerQuantity?.amount;
	const compareAt = compareAtRaw != null ? Number(compareAtRaw) : null;
	const hasCompareAt = compareAt != null;
	const hasAllocations = (node.discountAllocations?.length ?? 0) > 0;
	const showWasNow = hasCompareAt || hasAllocations;
	const discountLabels: Array<{ amount: number | null; label: string }> = [];
	for (const allocation of node.discountAllocations ?? []) {
		const label = allocation.title ?? allocation.code ?? null;
		if (label == null) continue;

		const amount = allocation.discountedAmount != null ? Number(allocation.discountedAmount.amount) : null;
		discountLabels.push({ amount, label });
	}
	return { compareAt, discountLabels, pricePerUnit, showWasNow };
}
