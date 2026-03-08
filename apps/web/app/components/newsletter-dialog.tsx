import { useEffect } from 'react';
import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
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
			className="data-entering:fade-in data-exiting:fade-out fixed inset-0 z-30 bg-gray-500/25 duration-300 ease-out data-entering:animate-in data-exiting:animate-out"
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<Modal className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
				<Dialog className="data-entering:fade-in data-entering:zoom-in-95 data-exiting:fade-out data-exiting:zoom-out-95 mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 duration-300 ease-out data-entering:animate-in data-exiting:animate-out">
					<NewsletterSignup />
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
