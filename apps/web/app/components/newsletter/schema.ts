import { z } from 'zod';

export const NewsletterSchema = z.object({
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
	gender: z.string().min(1, 'Gender is required'),
	token: z.string(),
});
