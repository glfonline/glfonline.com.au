import { Hero } from '~/components/hero';
import { Map } from '~/components/map';
import { NewsletterSignup } from '~/components/newsletter-signup';

export default function TestimonialsPage() {
	return (
		<div className="flex w-full flex-col gap-10 pb-16 sm:pb-24">
			<Hero
				title="Testimonials"
				image={{
					url: 'https://www.glfonline.com.au/static/c0d6f5766ed635dca57e0209383d99cf/6833b/testimonials-hero.webp',
				}}
			/>
			<Testimonials />
			<NewsletterSignup />
			<Map />
		</div>
	);
}

function Testimonials() {
	return (
		<ul className="grid grid-flow-row-dense gap-10 md:grid-cols-2">
			{testimonials.map(({ id, author, quote, image }) =>
				image ? (
					<li
						key={id}
						className="relative flex w-full flex-col-reverse md:col-span-2 md:grid md:grid-cols-12"
					>
						<img
							src={image.src}
							alt={image.alt ?? ''}
							className="h-full max-h-80 w-full object-cover md:absolute md:inset-0 md:col-span-6 md:col-start-1 md:max-h-fit"
						/>
						<div className="md:col-span-7 md:col-start-6 md:py-16">
							<div className="prose relative mx-auto w-full max-w-lg bg-white px-16 py-12 md:mx-0">
								<OpenQuote className="text-brand-primary absolute top-8 left-5 h-8 w-8" />
								<p
									data-after="”"
									className="italic after:content-[attr(data-after)]"
								>
									{quote}
								</p>
								<p className="font-bold">{author}</p>
							</div>
						</div>
					</li>
				) : (
					<li key={id} className="border px-8 py-10">
						<div className="prose mx-auto">
							<p
								data-before="“"
								data-after="”"
								className="italic before:content-[attr(data-before)] after:content-[attr(data-after)]"
							>
								{quote}
							</p>
							<p className="font-bold">{author}</p>
						</div>
					</li>
				)
			)}
		</ul>
	);
}

function OpenQuote(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg fill="currentColor" viewBox="0 0 32 32" {...props}>
			<path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
		</svg>
	);
}

const testimonials: Array<{
	id: string;
	author: string;
	quote: string;
	image?: {
		src: string;
		alt?: string;
	};
}> = [
	{
		id: '1',
		author: 'Thanks again, Colleen',
		quote:
			'Here is a photo of our team on the champagne hole. The tops looked great and we won Best Dressed team!! We also won this the year before with the other tops I got from you which were also Corsican. Very happy and many ladies commented on how great we looked.',
		image: {
			src: 'https://www.glfonline.com.au/static/5f3a062bc5ba0ba3ce01fee2e082343d/61162/colleen.webp',
		},
	},
	{
		id: '2',
		author: 'Christine, Kingston, ACT',
		quote:
			'I just wanted to say thank you for your very efficient service. I ordered a top on line yesterday, and it was in my post office box this morning. Thanks again.',
	},
	{
		id: '3',
		author: 'Regards Janelle',
		quote:
			'Just visited your shop and I was delighted to discover you sell elephant sizes. Well done Gordon and Chantale. Great selection and excellent service, I’ll be back.',
	},
	{
		id: '4',
		author: 'Colleen V',
		quote:
			'Hi Chantale, Just thought you’d like to know we won best dressed team & had so many people complimenting us on our shirts and asking where we got them — so a great success thank you.',
	},
	{
		id: '5',
		author: 'Maureen, Kiama',
		quote:
			'I visited your shop when staying in Port last week. It was the best range of womens golf wear I have seen (including oseas). Congratulations, my friends in Kiama will be visiting your site once I give them your card and hear of my experience there. Looking forward to future contact.',
	},
	{
		id: '6',
		author: 'Thanks, Jules',
		quote:
			'Hi Gordon, I wanted to thank you for the advice on the fit of the shirt I ordered, and the terrific service. The shirt was in Adelaide within 2 days, well before we got there. It fit and was blessedly cool in the ridiculous 40C plus weather. So even when I felt like I was melting, I still felt like I looked snazzy. I’ll order again.',
	},
];
