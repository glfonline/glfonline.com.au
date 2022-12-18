import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@remix-run/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { validateField } from '~/lib/form-field-error';

import { Button } from './design-system/button';
import { Checkbox } from './design-system/checkbox';
import { Field, InlineField } from './design-system/field';
import { Heading } from './design-system/heading';
import { TextArea } from './design-system/text-area';
import { TextInput } from './design-system/text-input';
import { SplitBackground } from './split-background';

const contactFormSchema = z.object({
	'agree_to_privacy_policy': z
		.boolean()
		.refine((val) => val === true, 'You must agree to the privacy policy'),
	'bot-field': z.string().optional(),
	'first_name': z.string().min(1, 'First name is required'),
	'last_name': z.string().min(1, 'Last name is required'),
	'email': z.string().trim().min(1, 'Email is required').email('Invalid email'),
	'phone_number': z
		.string()
		.min(1, 'Phone number is required')
		.min(8, 'Invalid phone number'),
	'subject': z.string().min(1, 'Subject is required'),
	'message': z.string().min(1, 'Message is required'),
});

type ContactFormSchema = z.infer<typeof contactFormSchema>;

export function ContactForm() {
	const form = useForm<ContactFormSchema>({
		resolver: zodResolver(contactFormSchema),
	});
	const handleSubmit = form.handleSubmit((formValues) => {
		/** @todo Send form values to the server */
		console.log(formValues);
	});
	return (
		<article className="relative mx-auto max-w-7xl overflow-hidden bg-white">
			<div
				aria-hidden="true"
				className="absolute inset-0 flex h-full w-full overflow-hidden"
			>
				<SplitBackground />
			</div>
			<div className="relative mx-auto flex max-w-xl flex-col gap-12 bg-gray-50 px-4 py-12 sm:px-6 lg:my-12 lg:px-8">
				<div className="text-center">
					<Heading level="2">Get in touch with our team</Heading>
				</div>
				<div>
					<form
						className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
						name="contact_form"
						onSubmit={handleSubmit}
					>
						<input type="hidden" name="form-name" defaultValue="contact" />
						<div hidden>
							<label htmlFor="bot-field">
								Don’t fill this out: <input id="bot-field" name="bot-field" />
							</label>
						</div>
						<Field
							label="First name"
							{...validateField(form.formState.errors, 'first_name')}
						>
							<TextInput {...form.register('first_name')} />
						</Field>
						<Field
							label="Last name"
							{...validateField(form.formState.errors, 'last_name')}
						>
							<TextInput {...form.register('last_name')} />
						</Field>
						<Field
							label="Email"
							className="sm:col-span-2"
							{...validateField(form.formState.errors, 'email')}
						>
							<TextInput {...form.register('email')} />
						</Field>
						<Field
							label="Phone number"
							className="sm:col-span-2"
							{...validateField(form.formState.errors, 'phone_number')}
						>
							<TextInput {...form.register('phone_number')} />
						</Field>
						<Field
							label="Subject"
							className="sm:col-span-2"
							{...validateField(form.formState.errors, 'subject')}
						>
							<TextInput {...form.register('subject')} />
						</Field>
						<Field
							label="Message"
							className="sm:col-span-2"
							{...validateField(form.formState.errors, 'message')}
						>
							<TextArea {...form.register('message')} />
						</Field>

						<div className="sm:col-span-2">
							<InlineField
								label={<PrivacyPolicyLabel />}
								{...validateField(
									form.formState.errors,
									'agree_to_privacy_policy'
								)}
							>
								<Checkbox {...form.register('agree_to_privacy_policy')} />
							</InlineField>
						</div>
						<Button type="submit" variant="neutral" className="sm:col-span-2">
							Submit
						</Button>
					</form>
				</div>
			</div>
		</article>
	);
}

function PrivacyPolicyLabel() {
	return (
		<Fragment>
			By selecting this, you agree to the{' '}
			<Link to="/privacy-policy/" className="underline">
				Privacy Policy
			</Link>
			.
		</Fragment>
	);
}
