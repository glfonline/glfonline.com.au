import { useEffect } from 'react';
import { useFetchers } from 'react-router';
import { CenterModal } from './design-system/center-modal';
import { NewsletterSignup } from './newsletter/form';

export function NewsletterDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const fetchers = useFetchers();
	const fetcher = fetchers.find((f) => f.formAction === '/api/newsletter');
	useEffect(() => {
		if (fetcher?.data?.ok) {
			const timeout = setTimeout(onClose, 2000);
			return () => clearTimeout(timeout);
		}
	}, [fetcher, onClose]);

	return (
		<CenterModal
			aria-label="Newsletter signup"
			className="transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-hidden"
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<NewsletterSignup />
		</CenterModal>
	);
}
