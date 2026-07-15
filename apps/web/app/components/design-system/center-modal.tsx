import type { ReactNode } from 'react';
import { Dialog } from 'react-aria-components/Dialog';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';

type CenterModalProps = {
	children: ReactNode;
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	'aria-label': string;
	className?: string;
};

export function CenterModal({ children, isOpen, onOpenChange, ...dialogProps }: CenterModalProps) {
	return (
		<ModalOverlay
			className="fixed inset-0 z-30 overflow-y-auto bg-gray-500/25 p-4 transition-opacity duration-300 ease-out data-entering:opacity-0 data-exiting:opacity-0 data-exiting:duration-200 motion-reduce:transition-none sm:p-6 md:p-20"
			isDismissable
			isOpen={isOpen}
			onOpenChange={onOpenChange}
		>
			<Modal className="mx-auto max-w-xl transition duration-300 ease-out data-entering:scale-95 data-exiting:scale-95 data-entering:opacity-0 data-exiting:opacity-0 data-exiting:duration-200 motion-reduce:transition-none">
				<Dialog aria-label={dialogProps['aria-label']} className={dialogProps.className}>
					{children}
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
