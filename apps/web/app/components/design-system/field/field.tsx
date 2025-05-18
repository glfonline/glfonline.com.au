import { clsx } from 'clsx';
import { forwardRef, useId, useMemo } from 'react';
import { mergeIds } from '../../../lib/merge-ids';
import { CheckCircleIcon } from '../../vectors/check-circle-icon';
import { ExclamationCircleIcon } from '../../vectors/exclamation-circle-icon';
import { FieldContextProvider, type FieldContextType } from './context';

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
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
		<FieldContextProvider value={fieldContext}>
			<div {...consumerProps} className={clsx('flex flex-col gap-1', className)} ref={forwardedRef}>
				<label htmlFor={inputId}>
					<span className={clsx('text-sm', disabled ? 'text-gray-400' : 'text-gray-700')}>{label} </span>
				</label>
				{description && (
					<span className="text-gray-600" id={descriptionId}>
						{description}
					</span>
				)}
				{children}
				{message && <FieldMessage id={messageId} message={message} tone={tone} />}
			</div>
		</FieldContextProvider>
	);
});

export function useFieldIds(idProp?: string) {
	const id = useId();
	const inputId = idProp || id;
	const descriptionId = `${inputId}--description`;
	const messageId = `${inputId}--message`;

	return {
		inputId,
		descriptionId,
		messageId,
	};
}

const messageIconMap = {
	critical: ExclamationCircleIcon,
	neutral: null,
	positive: CheckCircleIcon,
};

type Tone = keyof typeof messageIconMap;

type FieldMessageProps = Required<Pick<FieldProps, 'message' | 'id' | 'tone'>>;
export function FieldMessage({ message, id, tone }: FieldMessageProps) {
	const Icon = messageIconMap[tone];

	return (
		<div
			className={clsx(
				tone === 'critical' && 'text-red-600',
				tone === 'positive' && 'text-green-600',
				tone === 'neutral' && 'text-gray-600',
				'flex items-center gap-1 text-sm',
			)}
		>
			{Icon && <Icon className="h-5 w-5" />}
			<span id={id}>{message}</span>
		</div>
	);
}

type NativeDivProps = React.HTMLAttributes<HTMLDivElement>;
export type FieldProps = NativeDivProps & {
	/**
	 * Indicates that the field is perceivable but disabled, so it is not editable
	 * or otherwise operable.
	 */
	disabled?: boolean;
	/** Provide additional information that will aid user input. */
	description?: string;
	/** Concisely label the field. */
	label: string;
	/** Provide a message, informing the user about changes in state. */
	message?: string;
	/** Provide a tone to influence elements of the field, and its input. */
	tone?: Tone;
};
