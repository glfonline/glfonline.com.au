import { z } from 'zod';

export const ContactFormSchema = z.object({
	agree_to_privacy_policy: z
		.string()
		.transform(Boolean)
		.refine((val) => val, 'You must agree to the privacy policy'),
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
	phone_number: z.string().min(1, 'Phone number is required').min(8, 'Invalid phone number'),
	subject: z.string().min(1, 'Subject is required'),
	message: z.string().min(1, 'Message is required'),
	token: z.string(),
});
