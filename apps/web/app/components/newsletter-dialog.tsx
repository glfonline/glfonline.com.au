import { useEffect } from 'react';
import { Dialog } from 'react-aria-components/Dialog';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
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
	}, [fetcher, onClose]);

	return (
		<ModalOverlay
			className="fixed inset-0 z-30 overflow-y-auto bg-gray-500/25 p-4 transition-opacity duration-300 ease-out data-entering:opacity-0 data-exiting:opacity-0 data-exiting:duration-200 motion-reduce:transition-none sm:p-6 md:p-20"
			isDismissable
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<Modal className="mx-auto max-w-xl transition duration-300 ease-out data-entering:scale-95 data-exiting:scale-95 data-entering:opacity-0 data-exiting:opacity-0 data-exiting:duration-200 motion-reduce:transition-none">
				<Dialog
					aria-label="Newsletter signup"
					className="transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-hidden"
				>
					<NewsletterSignup />
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
