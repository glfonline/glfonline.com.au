import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { useSearchHotkey } from './use-search-hotkey';

function Harness({ onTrigger }: { onTrigger: () => void }) {
	useSearchHotkey(onTrigger);
	return <div>ready</div>;
}

describe('useSearchHotkey (browser)', () => {
	it('fires on Cmd+K (Mac)', async () => {
		const onTrigger = vi.fn();
		await render(<Harness onTrigger={onTrigger} />);

		await userEvent.keyboard('{Meta>}k{/Meta}');

		expect(onTrigger).toHaveBeenCalledTimes(1);
	});

	it('fires on Ctrl+K (Windows/Linux)', async () => {
		const onTrigger = vi.fn();
		await render(<Harness onTrigger={onTrigger} />);

		await userEvent.keyboard('{Control>}k{/Control}');

		expect(onTrigger).toHaveBeenCalledTimes(1);
	});

	it('ignores the K key on its own', async () => {
		const onTrigger = vi.fn();
		await render(<Harness onTrigger={onTrigger} />);

		await userEvent.keyboard('k');

		expect(onTrigger).not.toHaveBeenCalled();
	});
});
