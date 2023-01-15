import {
	sanityClient,
	TESTIMONIALS_PAGE_QUERY,
} from '@glfonline/sanity-client';
import { json } from '@remix-run/node';
import { NavLink, useLoaderData } from '@remix-run/react';
import { z } from 'zod';

import { getHeadingStyles } from '~/components/design-system/heading';
import { Divider } from '~/components/divider';
import { Hero } from '~/components/hero';
import { Map } from '~/components/map';
import { NewsletterSignup } from '~/components/newsletter-signup';
import { imageWithAltSchema } from '~/lib/image-with-alt-schema';
import { urlFor } from '~/lib/sanity-image';

const TestimonialsSchema = z.object({
	heroImage: imageWithAltSchema,
	testimonials: z
		.object({
			_key: z.string(),
			author: z.string().min(1),
			quoteRaw: z.any(),
			testimonialImage: z.nullable(imageWithAltSchema),
		})
		.array(),
});

export async function loader() {
	const { TestimonialsPage } = await sanityClient(TESTIMONIALS_PAGE_QUERY, {
		id: 'testimonials',
	});
	const { testimonials, heroImage } =
		TestimonialsSchema.parse(TestimonialsPage);
	return json({ heroImage, testimonials });
}

export default function AboutPage() {
	const { heroImage } = useLoaderData<typeof loader>();
	return (
		<div className="flex w-full flex-col pb-16 sm:pb-24">
			<div className="flex w-full flex-col gap-10">
				<Hero
					title="About Us"
					image={{
						url: urlFor({
							_ref: heroImage.asset._id,
							crop: heroImage.asset.crop,
							hotspot: heroImage.asset.hotspot,
						})
							.auto('format')
							.width(1280)
							.height(385)
							.focalPoint(0.5, 0.5)
							.dpr(3)
							.url(),
						alt: heroImage.asset.altText ?? '',
					}}
				/>
			</div>
			<AboutGLFOnline />
			<Hero
				image={{
					url: urlFor({
						_ref: heroImage.asset._id,
						crop: heroImage.asset.crop,
						hotspot: heroImage.asset.hotspot,
					})
						.auto('format')
						.width(1280)
						.height(385)
						.focalPoint(0.5, 0.5)
						.dpr(3)
						.url(),
					alt: heroImage.asset.altText ?? '',
				}}
			/>
			<GLFOnlineTeam />
			<NewsletterSignup />
			<Map />
		</div>
	);
}

const sections = [
	{
		type: 'content',
		title: 'About GLF Online',
		content: <AboutGLFOnline />,
	},
	{
		type: 'image',
		content: <GLFOnlineTeam />,
	},
];

function AboutGLFOnline() {
	return (
		<AboutSection
			heading={{
				level: 'h1',
				text: 'A Little About GLF Online',
			}}
		>
			<p>
				GLF Online was established in 2016 by enthusiasts and professionals
				Chantale and Gordon McCallum, opening a retail shop in Port Macquarie,
				NSW, Australia.
			</p>
			<p>
				GLF Online began life as Golf Ladies First, with an aim to support and
				encourage women golfers to take up and enjoy the sport. Our mission is
				to facilitate a relaxed and friendly in-store atmosphere, providing
				options beyond what’s generally available at most male-centric golf
				shops.
			</p>
			<p>
				GLF Online stocks a diverse range of apparel, accessories, and
				everything golfing ladies require for competitive and casual play.
			</p>
			<p>
				As of 2020, in addition to our premier collection for women,GLF Online
				has evolved into offering quality attire and accessories for men.
			</p>
			<p>
				GLF Online stocks outerwear, shirts, shoes, socks, shorts, skorts,
				skirts, capris, pants, dresses, headwear, and golfing accessories. Want
				to buy a gift for your fellow golf lover? Not sure what to pick?{' '}
				<NavLink to="/ladies/collections/gift-certificate">Click here</NavLink>{' '}
				to buy a gift voucher!
			</p>
			<p>
				GLF Online is proud to retail the finest quality and world-renowned golf
				brands available in our store and online. GLF Online stocks gear from
				top brands such as Annika, Greg Norman, Nivo, Bermuda Sands, Travis
				Matthew, Cutter & Buck, and more.{' '}
				<NavLink to="/ladies/collections/clearance-items">Check here</NavLink>{' '}
				for our current collections and clearance sales.
			</p>
			<p>
				Our fast dispatch system ensures you can hit the links sooner, shipping
				orders throughout the day.
			</p>
			<p>
				We’re always on hand to lend advice, share tips on play, and use our
				knowledge to understand your clubs’ dress code requirements and
				recommend apparel accordingly. We stock attire for traditional clubs as
				well as more relaxed and contemporary designs – whatever your playing
				style and wherever you play, GLF Online has you covered.
			</p>
			<p>
				Click through to shop from our extensive range for{' '}
				<NavLink to="/ladies">women</NavLink> and{' '}
				<NavLink to="/mens">men</NavLink>.
			</p>
		</AboutSection>
	);
}

function GLFOnlineTeam() {
	return (
		<AboutSection
			heading={{
				level: 'h2',
				text: 'The team behind GLF Online',
			}}
		>
			<p>
				Chantale and Gordon McCallum are accredited PGA Professional Golfers
				with over 30 years of experience in golfing in Scotland, Germany, and
				Australia.
			</p>
			<p>
				Chantale and Gordon recognised that options for women golfers in
				traditional golf stores weren’t balanced for both men and women golfers.
				This led to the creation of Golf Ladies First, a shop focused on
				assisting women golfers with a larger range of apparel, fashion, and
				accessories.
			</p>
			<p>
				Chantale and Gordon continue this tradition in GLF Online, giving all
				golfers, men and women, opportunities to ask questions, discuss their
				needs, and get a helping hand when it comes to the finer points of the
				game.
			</p>
			<p>
				The team at GLF Online curate a highly expansive and diverse range of
				golf apparel and accessories from the world’s best brands based on their
				own experiences as pro golfers. GLF Online’s team are always on hand to
				order special items to improve your game.
			</p>
			<p>
				GLF Online uses a collaborative approach when customers approach us with
				fitting, sizing, and other queries. Chantale and Gordon draw on their
				experience to come up with a solution, keeping in constant communication
				with new and cherished return customers until they find your perfect
				product or accessory.
			</p>
			<p>
				Want to improve your game? Chantale and Gordon also write a monthly
				newsletter with tips they’ve picked up on the links both in Australia
				and across the world. <NavLink to="#signup">Click here</NavLink> to sign
				up.
			</p>
		</AboutSection>
	);
}

function AboutSection({
	children,
	heading,
}: {
	children: React.ReactNode;
	heading: {
		level: 'h1' | 'h2';
		text: string;
	};
}) {
	return (
		<div className="flex flex-col gap-10 py-12 px-4 sm:px-6 lg:px-8">
			<div className="prose max-w-none gap-8 md:columns-2 lg:columns-3">
				<div>
					<heading.level className={getHeadingStyles({ size: '2' })}>
						{heading.text}
					</heading.level>
					<Divider />
				</div>
			</div>
			<div className="prose prose-a:font-bold max-w-none gap-8 md:columns-2 lg:columns-3">
				{children}
			</div>
		</div>
	);
}
