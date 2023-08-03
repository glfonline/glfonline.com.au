import { XMarkIcon } from '@heroicons/react/20/solid';
import { Fragment, useState } from 'react';

import { Button } from './design-system/button';
import { Heading } from './design-system/heading';
import { NewsletterDialog } from './newsletter-dialog';

export function SignupBanner() {
	const [showBanner, setShowBanner] = useState(true);
	const [isDialogOpen, setDialogOpen] = useState(false);
	if (!showBanner) return null;
	const onClose = () => {
		setDialogOpen(false);
		setShowBanner(false);
	};
	return (
		<Fragment>
			<NewsletterDialog isOpen={isDialogOpen} onClose={onClose} />
			<div className="fixed inset-x-0 bottom-0 isolate flex gap-x-6 overflow-hidden bg-[#006747] p-6 sm:before:flex-1">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					<div className="flex flex-col items-start gap-4 text-white">
						<div className="flex flex-col gap-2">
							<Heading color="light" size="3">
								US Masters Now On
							</Heading>
							<p>Sign up to our email newsletter for 10% off your first order</p>
						</div>
						<Button
							aria-label="Sign up to our email newsletter for 10% off your first order"
							onClick={() => setDialogOpen(true)}
							variant="neutral"
						>
							Sign up <span aria-hidden="true">&rarr;</span>
						</Button>
					</div>
				</div>
				<div className="flex flex-1 justify-end">
					<button
						className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
						onClick={() => setShowBanner(false)}
						type="button"
					>
						<span className="sr-only">Dismiss</span>
						<XMarkIcon aria-hidden="true" className="h-5 w-5 text-white" />
					</button>
				</div>
			</div>
		</Fragment>
	);
}
