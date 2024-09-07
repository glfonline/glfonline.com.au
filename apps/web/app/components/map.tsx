import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { Spinner } from './design-system/spinner';

export function StoreLocationMap() {
	const { ref, inView } = useInView({
		triggerOnce: true,
	});
	const [isLoaded, setIsLoaded] = useState(true);

	return (
		<div className="relative mx-auto flex h-96 w-full max-w-7xl items-center justify-center overflow-hidden" ref={ref}>
			{inView && (
				<iframe
					allowFullScreen
					className="absolute inset-0 h-96 w-full border-none"
					loading="lazy"
					onLoad={() => {
						setIsLoaded(false);
					}}
					referrerPolicy="no-referrer-when-downgrade"
					src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6808.96377872015!2d152.908439!3d-31.428397999999998!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x64a8efb0170dc7c7!2sGLF%20Online%20%2F%20GLF%20Golf%20%26%20Lifestyle!5e0!3m2!1sen!2sau!4v1671274957553!5m2!1sen!2sau"
					title="Golf Ladies First Port Macquarie Location"
				/>
			)}
			{isLoaded && <Spinner className="text-primary relative h-8 w-8" />}
		</div>
	);
}
