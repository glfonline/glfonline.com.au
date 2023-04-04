import { Dialog, Transition } from '@headlessui/react';
import { useFetchers } from '@remix-run/react';
import { Fragment, useEffect } from 'react';

import { NewsletterSignup } from '../routes/api/newsletter';

export function NewsletterDialog({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const fetchers = useFetchers();
	const fetcher = fetchers.find((f) => f.formAction === '/api/newsletter');
	useEffect(() => {
		if (fetcher?.data?.ok) {
			setIsOpen(false);
		}
	}, [fetcher, setIsOpen]);

	return (
		<Transition.Root appear as={Fragment} show={isOpen}>
			<Dialog as="div" className="relative z-30" onClose={setIsOpen}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
							<NewsletterSignup />
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}
