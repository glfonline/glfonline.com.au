import { clsx } from 'clsx';
import { CheckCircleIcon } from '../../vectors/check-circle-icon';
import { ExclamationCircleIcon } from '../../vectors/exclamation-circle-icon';

const messageIconMap = {
	critical: ExclamationCircleIcon,
	neutral: null,
	positive: CheckCircleIcon,
};

export type Tone = keyof typeof messageIconMap;

export type FieldMessageProps = {
	message: string;
	id?: string;
	tone: Tone;
};

/**
 * A standalone status/validation message. Used for form-level messages that are
 * not associated with a single field control (field-level errors are rendered
 * by the React Aria field components via `<FieldError>`).
 */
export function FieldMessage({ message, id, tone }: FieldMessageProps) {
	const Icon = messageIconMap[tone];

	return (
		<div
			className={clsx(
				tone === 'critical' && 'text-red-600',
				tone === 'positive' && 'text-green-600',
				tone === 'neutral' && 'text-gray-600',
				'flex items-start gap-1 text-sm',
			)}
			role={tone === 'critical' ? 'alert' : undefined}
		>
			{Icon && <Icon className="h-5 w-5 shrink-0" />}
			<span id={id}>{message}</span>
		</div>
	);
}
