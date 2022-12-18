import { Fragment } from 'react';

export function SplitBackground() {
	return (
		<Fragment>
			<div
				data-theme="ladies"
				className="flex-1 bg-brand-primary after:absolute after:left-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform after:bg-brand-primary"
			/>
			<div
				data-theme="mens"
				className="flex-1 bg-brand-primary after:absolute after:right-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform after:bg-brand-primary"
			/>
		</Fragment>
	);
}
