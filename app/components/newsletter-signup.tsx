import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { validateField } from '~/lib/form-field-error';

import { Button } from './design-system/button';
import { Field } from './design-system/field';
import { Heading } from './design-system/heading';
import { TextInput } from './design-system/text-input';

const newsletterSchema = z.object({
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
});

type NewsletterSchema = z.infer<typeof newsletterSchema>;

export function NewsletterSignup() {
	const form = useForm<NewsletterSchema>({
		resolver: zodResolver(newsletterSchema),
	});
	const handleSubmit = form.handleSubmit((formValues) => {
		/** @todo Send form values to the server */
		console.log(formValues);
	});
	return (
		<article className="mx-auto max-w-7xl bg-gray-100">
			<div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
				<Heading level="2" className="text-center">
					Don't miss out, join the club
				</Heading>
				<span className="sr-only">Sign up for our newsletter</span>
				<form
					onSubmit={handleSubmit}
					name="newsletter-signup-form"
					className="w-full py-8 sm:flex"
				>
					<div className="grid w-full gap-6 sm:grid-cols-4">
						<Field
							label="First name"
							className="sm:col-span-2"
							{...validateField(form.formState.errors, 'first_name')}
						>
							<TextInput {...form.register('first_name')} />
						</Field>
						<Field
							label="Last name"
							className="sm:col-span-2"
							{...validateField(form.formState.errors, 'last_name')}
						>
							<TextInput {...form.register('last_name')} />
						</Field>
						<Field
							label="Email address"
							className="sm:col-span-4"
							{...validateField(form.formState.errors, 'email')}
						>
							<TextInput {...form.register('email')} />
						</Field>

						<Button type="submit" variant="neutral" className="sm:col-span-4">
							Join
						</Button>
					</div>
				</form>
				<p className="prose text-center">
					* by clicking join, you agree to receive our newsletter as well as top
					tips to improve your game
				</p>
			</div>
		</article>
	);
}
