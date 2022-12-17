import { TextArea } from './text-area';
import { TextInput } from './text-input';

export function ContactForm() {
	return (
		<article className="relative mx-auto max-w-7xl overflow-hidden bg-white">
			<div
				aria-hidden="true"
				className="absolute inset-0 flex h-full w-full overflow-hidden"
			>
				<div className="w-1/2 bg-brand-pink">
					<div className="h-full -skew-x-12 transform bg-brand-pink" />
				</div>
				<div className="w-1/2 bg-brand-blue">
					<div className="h-full -skew-x-12 transform bg-brand-blue" />
				</div>
			</div>
			<div className="relative mx-auto max-w-xl bg-gray-50 px-4 py-12 sm:px-6 lg:my-12 lg:px-8">
				<div className="text-center">
					<h2 className="h2">Get in touch with our team</h2>
				</div>
				<div className="mt-12">
					<form
						action="/success/"
						className="row-gap-6 sm:col-gap-8 grid grid-cols-1 sm:grid-cols-2"
						method="POST"
						name="contact_form"
					>
						<input type="hidden" name="form-name" defaultValue="contact" />
						<div hidden>
							<label htmlFor="bot-field">
								Don’t fill this out: <input id="bot-field" name="bot-field" />
							</label>
						</div>
						<div className="">
							<label
								htmlFor="first_name"
								className="block text-sm leading-5 text-gray-700"
							>
								First name
							</label>
							<div className="relative mt-1 shadow-sm">
								<TextInput
									type="text"
									id="first_name"
									name="first_name"
									defaultValue=""
									required
								/>
							</div>
						</div>
						<div className="">
							<label
								htmlFor="last_name"
								className="block text-sm leading-5 text-gray-700"
							>
								Last name
							</label>
							<div className="relative mt-1 shadow-sm">
								<TextInput
									type="text"
									id="last_name"
									name="last_name"
									defaultValue=""
									required
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="email"
								className="block text-sm leading-5 text-gray-700"
							>
								Email
							</label>
							<div className="relative mt-1 shadow-sm">
								<TextInput
									type="email"
									id="email"
									name="email"
									defaultValue=""
									required
									pattern="^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$"
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="phone_number"
								className="block text-sm leading-5 text-gray-700"
							>
								Phone number
							</label>
							<div className="relative mt-1 shadow-sm">
								<TextInput
									type="tel"
									id="phone_number"
									name="phone_number"
									defaultValue=""
									required
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="subject"
								className="block text-sm leading-5 text-gray-700"
							>
								Subject
							</label>
							<div className="relative mt-1 shadow-sm">
								<TextInput
									type="text"
									id="subject"
									name="subject"
									defaultValue=""
									required
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="message"
								className="block text-sm leading-5 text-gray-700"
							>
								Message
							</label>
							<div className="relative mt-1 shadow-sm">
								<TextArea
									id="message"
									name="message"
									rows={4}
									required
									defaultValue={''}
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<span
										role="checkbox"
										aria-checked="false"
										tabIndex={0}
										className=" focus:shadow-outline relative inline-block h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition duration-200 ease-in-out focus:outline-none"
									>
										<span className="sr-only">Agree to privacy policy</span>
										<span
											aria-hidden="true"
											className="inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
										/>
									</span>
								</div>
								<div id="signup" className="ml-3">
									<p className="text-base leading-6 text-gray-600">
										By selecting this, you agree to the{/* */}{' '}
										<a
											className="focus:shadow-outline-primary text-gray-700 underline focus:outline-none"
											href="/privacy-policy/"
										>
											Privacy Policy
										</a>
										.
									</p>
								</div>
							</div>
						</div>
						<div className="sm:col-span-2">
							<span className="inline-flex w-full shadow-sm">
								<button
									type="submit"
									className="focus:shadow-outline-primary inline-flex w-full items-center justify-center rounded-none border border-transparent bg-gray-800 px-6 py-3 text-base font-bold uppercase leading-6 tracking-wide text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:border-gray-900 focus:outline-none active:bg-gray-900"
								>
									Submit
								</button>
							</span>
						</div>
					</form>
				</div>
			</div>
		</article>
	);
}
