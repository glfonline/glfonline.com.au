import { SplitBackground } from './split-background';

export function Divider() {
	return (
		<div aria-hidden="true" className="relative grid h-3 grid-cols-2 overflow-hidden">
			<SplitBackground />
		</div>
	);
}
