export function NewsletterSignup() {
	return (
		<article className="mx-auto max-w-7xl bg-gray-100">
			<div className="mx-auto max-w-xl px-4 py-12 text-left sm:px-6 lg:py-16 lg:px-8">
				<h2 className="h2 text-center">Don't miss out, join the club</h2>
				<span className="sr-only">Sign up for our newsletter</span>
				<form
					method="POST"
					name="newsletter-signup-form"
					target="_blank"
					className="mt-8 w-full sm:flex"
				>
					<div className="grid w-full gap-6 sm:grid-cols-4">
						<div className="sm:col-span-2">
							<label
								htmlFor="newsletter-first_name"
								className="block text-sm leading-5 text-gray-700"
							>
								First name
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="text"
									id="newsletter-first_name"
									name="newsletter-first_name"
									defaultValue=""
									required
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="newsletter-last_name"
								className="block text-sm leading-5 text-gray-700"
							>
								Last name
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="text"
									id="newsletter-last_name"
									name="newsletter-last_name"
									defaultValue=""
									required
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="sm:col-span-4 ">
							<div className="sm:col-span-2">
								<label
									htmlFor="newsletter-email"
									className="block text-sm leading-5 text-gray-700"
								>
									Email address
								</label>
								<div className="relative mt-1 shadow-sm">
									<input
										type="email"
										id="newsletter-email"
										name="newsletter-email"
										defaultValue=""
										required
										pattern="^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$"
										className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
									/>
								</div>
							</div>
						</div>
						<button
							type="submit"
							className="focus:shadow-outline-primary relative inline-flex w-full items-center justify-center border border-transparent bg-gray-800 px-4 py-3 text-base font-bold uppercase leading-6 tracking-wide text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:border-blue-400 focus:bg-gray-600 focus:outline-none active:bg-gray-900 disabled:cursor-wait disabled:opacity-50 sm:col-span-1 sm:col-span-4 sm:w-auto"
						>
							<span className="">Join</span>
						</button>
					</div>
				</form>
				<p className="prose mt-6 text-center">
					* by clicking join, you agree to receive our newsletter as well as top
					tips to improve your game
				</p>
			</div>
		</article>
	);
}
