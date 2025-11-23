import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useFetchers } from 'react-router';
import { noop } from '../lib/noop';
import { NewsletterSignup } from './newsletter/form';

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function NewsletterDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const fetchers = useFetchers();
	const fetcher = fetchers.find((f) => f.formAction === '/api/newsletter');
	useEffect(() => {
		if (fetcher?.data?.ok) {
			wait(2000)
				.then(() => {
					onClose();
				})
				.catch(noop);
		}
	}, [
		fetcher,
		onClose,
	]);

	return (
		<Transition appear show={isOpen}>
			<Dialog as="div" className="relative z-30" onClose={onClose}>
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
				</TransitionChild>

				<div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<DialogPanel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
							<NewsletterSignup />
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
}
