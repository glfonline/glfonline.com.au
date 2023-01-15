export function Map() {
	return (
		<article className="relative mx-auto w-full max-w-7xl overflow-hidden">
			<iframe
				src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6808.96377872015!2d152.908439!3d-31.428397999999998!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x64a8efb0170dc7c7!2sGLF%20Online%20%2F%20GLF%20Golf%20%26%20Lifestyle!5e0!3m2!1sen!2sau!4v1671274957553!5m2!1sen!2sau"
				title="Golf Ladies First Port Macquarie Location"
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
				allowFullScreen
				className="h-96 w-full border-none"
			/>
			<div className="absolute inset-0 flex h-full w-full items-center justify-center">
				<svg
					height="2em"
					width="2em"
					style={{ animationDuration: '900ms' }}
					className="__react-svg-spinner_circle"
					role="img"
					aria-labelledby="title desc"
					viewBox="0 0 32 32"
				>
					<title id="title">Circle loading spinner</title>
					<desc id="desc">Image of a partial circle indicating "loading."</desc>
					<style
						dangerouslySetInnerHTML={{
							__html:
								'\n      .__react-svg-spinner_circle{\n          transition-property: transform;\n          animation-name: __react-svg-spinner_infinite-spin;\n          animation-iteration-count: infinite;\n          animation-timing-function: linear;\n      }\n      @keyframes __react-svg-spinner_infinite-spin {\n          from {transform: rotate(0deg)}\n          to {transform: rotate(360deg)}\n      }\n    ',
						}}
					/>
					<circle
						role="presentation"
						cx={16}
						cy={16}
						r="12.5"
						stroke="var(--brand-color)"
						fill="none"
						strokeWidth={3}
						strokeDasharray="43.982297150257104"
						strokeLinecap="round"
					/>
				</svg>
			</div>
		</article>
	);
}
