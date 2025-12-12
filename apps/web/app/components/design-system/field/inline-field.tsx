import { clsx } from 'clsx';
import { useMemo } from 'react';
import { mergeIds } from '../../../lib/merge-ids';
import { FieldContext, type FieldContextType } from './context';
import { FieldMessage, type FieldProps, useFieldIds } from './field';

export function InlineField({
	children,
	className,
	description,
	disabled = false,
	id: idProp,
	label,
	message,
	ref,
	tone = 'critical',
	...consumerProps
}: InlineFieldProps) {
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
			<div {...consumerProps} className={clsx('flex flex-col gap-1', className)} ref={ref}>
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
}

export type InlineFieldProps = Omit<FieldProps, 'label'> & {
	label: React.ReactNode;
};
