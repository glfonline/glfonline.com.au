import { clsx } from 'clsx';
import { forwardRef, useMemo } from 'react';

import { mergeIds } from '~/lib/merge-ids';

import { type FieldContextType, FieldContextProvider } from './context';
import { type FieldProps, FieldMessage, useFieldIds } from './field';

export const InlineField = forwardRef<HTMLDivElement, InlineFieldProps>(
	function Field(
		{
			children,
			className,
			description,
			disabled = false,
			id: idProp,
			label,
			message,
			tone = 'neutral',
			...consumerProps
		},
		forwardedRef
	) {
		const { descriptionId, inputId, messageId } = useFieldIds(idProp);
		const invalid = Boolean(message && tone === 'critical');
		const fieldContext: FieldContextType = useMemo(
			() => [
				{ disabled, invalid },
				{
					'aria-describedby': mergeIds(
						message && messageId,
						description && descriptionId
					),
					'aria-invalid': invalid || undefined,
					id: inputId,
				},
			],
			[
				description,
				descriptionId,
				disabled,
				inputId,
				invalid,
				message,
				messageId,
			]
		);
		return (
			<FieldContextProvider value={fieldContext}>
				<div
					{...consumerProps}
					ref={forwardedRef}
					className="flex flex-col gap-1"
				>
					<div className="relative flex items-start gap-3">
						{children}
						<div className="text-sm">
							<label
								htmlFor={inputId}
								className={clsx(
									'select-none',
									disabled ? 'text-gray-400' : 'text-gray-700'
								)}
							>
								{label}
							</label>
						</div>
					</div>
					{message && (
						<FieldMessage tone={tone} id={messageId} message={message} />
					)}
				</div>
			</FieldContextProvider>
		);
	}
);

export type InlineFieldProps = Omit<FieldProps, 'label'> & {
	label: React.ReactNode;
};