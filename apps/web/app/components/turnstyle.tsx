import { Turnstile as ReactTurnstile } from '@marsidev/react-turnstile';

export function Turnstile() {
	return (
		<ReactTurnstile
			options={{
				size: 'invisible',
			}}
			siteKey="0x4AAAAAAAC-VGG5RS47Tgsn"
		/>
	);
}
