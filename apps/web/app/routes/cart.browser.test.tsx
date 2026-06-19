import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { QuantityPicker } from './cart';

describe('QuantityPicker (browser)', () => {
	it('exposes accessible names for the decrement and increment buttons', async () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () => <QuantityPicker quantity={2} quantityAvailable={5} variantId="gid://variant/1" />,
			},
		]);

		const screen = await render(<Stub initialEntries={['/']} />);

		await expect
			.element(
				screen.getByRole('button', {
					name: 'Decrease quantity',
				}),
			)
			.toBeVisible();
		await expect
			.element(
				screen.getByRole('button', {
					name: 'Increase quantity',
				}),
			)
			.toBeVisible();
	});
});
