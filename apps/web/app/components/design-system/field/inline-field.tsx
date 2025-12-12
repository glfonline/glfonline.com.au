import { clsx } from 'clsx';
import { forwardRef, useMemo } from 'react';
import { mergeIds } from '../../../lib/merge-ids';
import { FieldContext, type FieldContextType } from './context';
import { FieldMessage, type FieldProps, useFieldIds } from './field';

export const InlineField = forwardRef<HTMLDivElement, InlineFieldProps>(function Field(
	{
		children,
		className,
		description,
		disabled = false,
		id: idProp,
		label,
		message,
		tone = 'critical',
		...consumerProps
	},
	forwardedRef,
) {
	const { descriptionId, inputId, messageId } = useFieldIds(idProp);
	const invalid = Boolean(message && tone === 'critical');
	const fieldContext: FieldContextType = useMemo(
		() => [
			{
				disabled,
				invalid,
			},
			{
				'aria-describedby': mergeIds(message && messageId, description && descriptionId),
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
		],
	);
	return (
		<FieldContext value={fieldContext}>
			<div {...consumerProps} className={clsx('flex flex-col gap-1', className)} ref={forwardedRef}>
				<div className="relative flex items-start gap-3">
					{children}
					<div className="text-sm">
						<label className={clsx('select-none', disabled ? 'text-gray-400' : 'text-gray-700')} htmlFor={inputId}>
							{label}
						</label>
					</div>
				</div>
				{message && <FieldMessage id={messageId} message={message} tone={tone} />}
			</div>
		</FieldContext>
	);
});

export type InlineFieldProps = Omit<FieldProps, 'label'> & {
	label: React.ReactNode;
};
