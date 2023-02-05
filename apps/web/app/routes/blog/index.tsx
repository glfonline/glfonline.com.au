import { Link } from '@remix-run/react';
import { Fragment } from 'react';

import { ButtonLink } from '~/components/design-system/button';
import { getHeadingStyles } from '~/components/design-system/heading';
import { Hero } from '~/components/hero';
import { type Theme } from '~/types';

const posts = [
	{
		author: 'Gordon McCallum',
		heading: 'GLF Pro Tip 19: Distance For Slower Swing Speeds',
		excerpt:
			'If your golf game is distance challenged it could be for many reasons, perhaps due to lack of strength, getting older, taking the game up later in life infact there are many, many explanations for not hitting the ball very far off the tee.',
		href: '/blogs/tips/golf-ladies-first-tip-no-19-distance-for-slower-swing-speeds',
		source:
			'https://cdn.sanity.io/images/elu2en5k/production/1f65c6aa3f12b19e730666474ed50bb44953fbe5-283x178.jpg',
		publishDate: '2020-12-30',
		isFeatured: true,
	},
];

export default function Blog() {
	return (
		<Fragment>
			<Hero
				title="Blog"
				image={{
					url: 'https://www.glfonline.com.au/static/9a328f78e40c139b626f4e1ffe4e2f7f/385a5/blog-hero.webp',
				}}
			/>
			<div className="relative mx-auto flex w-full justify-center gap-4 px-4 sm:px-6 lg:gap-16 lg:px-8">
				<div className="flex min-w-0 max-w-4xl flex-auto flex-col py-16 lg:max-w-none">
					<article className="flex-1">
						<PostList />
					</article>
				</div>
				<div className="hidden lg:sticky lg:top-[6.625rem] lg:-mr-6 lg:block lg:h-[calc(100vh-6.625rem)] lg:flex-none lg:overflow-y-auto lg:py-16 lg:pr-6">
					<Sidebar />
				</div>
			</div>
		</Fragment>
	);
}

function PostList() {
	return (
		<div className="mx-auto max-w-7xl">
			<div className="flex">
				<h1 className={getHeadingStyles({ size: '2' })}>
					Stay connected with our blogs
				</h1>
			</div>
			<section className="mt-8 pb-16" aria-labelledby="gallery-heading">
				<h2 id="gallery-heading" className="sr-only">
					Recently viewed
				</h2>
				<ul role="list" className="flex flex-col gap-8">
					{posts.map((post, index) => (
						<Post key={index} post={post} />
					))}
				</ul>
			</section>
		</div>
	);
}

function Post({ post }: { post: (typeof posts)[number] }) {
	return (
		<li key={post.source} className="flex">
			<Link to={post.href} className="flex flex-col sm:flex-row">
				<div className="flex h-48 sm:h-auto sm:w-64">
					<img
						className="h-full w-full object-cover"
						src={post.source}
						alt=""
					/>
				</div>
				<div className="flex min-w-0 flex-1 flex-col justify-between bg-white p-6">
					<div className="flex-1">
						<h3 className={getHeadingStyles({ size: '3' })}>{post.heading}</h3>
						<div className="prose mt-4">
							<p className="line-clamp-3">{post.excerpt}</p>
						</div>
					</div>
					<div className="mt-6 max-w-prose">
						<p className="text-sm font-bold leading-5 text-gray-900">
							{post.author}
						</p>
						<div className="text-sm font-bold italic text-gray-700">
							<time dateTime={post.publishDate}>
								{new Date(post.publishDate).toDateString()}
							</time>
						</div>
					</div>
				</div>
			</Link>
		</li>
	);
}

function Sidebar() {
	const featuredPost = posts.find((post) => post.isFeatured);
	return (
		<aside
			aria-labelledby="featured-posts"
			className="flex w-80 flex-col gap-8"
		>
			{featuredPost && <FeaturedPost featuredPost={featuredPost} />}
			<CTA
				heading="Shop ladies clothing and accessories"
				image={{
					src: 'https://www.glfonline.com.au/static/d56361304f93d4458132ff614006fb17/596e5/blog-sidebar-ladies.webp',
				}}
				subHeading="Head to our online store"
				theme="ladies"
				cta={{
					text: 'Shop now',
					href: '/ladies',
				}}
			/>
			<CTA
				heading="Shop mens clothing and accessories"
				image={{
					src: 'https://www.glfonline.com.au/static/571c3c636479496cc71e4d95e7326491/596e5/blog-sidebar-mens.webp',
				}}
				subHeading="Head to our online store"
				theme="mens"
				cta={{
					text: 'Shop now',
					href: '/mens',
				}}
			/>
		</aside>
	);
}

function FeaturedPost({
	featuredPost,
}: {
	featuredPost: (typeof posts)[number];
}) {
	return (
		<article className="flex flex-col gap-8">
			<h2 id="featured-posts" className={getHeadingStyles({ size: '2' })}>
				Featured Post
			</h2>
			<div className="flex flex-col gap-6">
				<img
					src={featuredPost.source}
					alt=""
					className="aspect-video object-cover"
				/>
				<div className="prose">
					<p className="line-clamp-3">{featuredPost.excerpt}</p>
				</div>
				<div className="flex text-sm">
					<span className="font-bold">{featuredPost.author}</span>
					<span aria-hidden className="mx-2">
						|
					</span>
					<span className="text-sm font-bold italic text-gray-700">
						<time dateTime={featuredPost.publishDate}>
							{new Date(featuredPost.publishDate).toDateString()}
						</time>
					</span>
				</div>
			</div>
		</article>
	);
}

function CTA({
	cta,
	heading,
	subHeading,
	image,
	theme,
}: {
	cta: { text: string; href: string };
	heading: string;
	subHeading: string;
	image: {
		src: string;
		alt?: string;
	};
	theme: Theme;
}) {
	return (
		<div className="relative flex">
			<img
				className="absolute inset-0 h-full w-full object-cover"
				src={image.src}
				alt={image.alt ?? ''}
			/>
			<div
				data-theme={theme}
				className="bg-true-black/50 relative flex flex-1 flex-col items-center gap-2 px-8 py-16 text-center text-white"
			>
				<h2 className={getHeadingStyles({ size: '2', color: 'light' })}>
					{heading}
				</h2>
				<p className="tex-lg font-bold uppercase">{subHeading}</p>
				<ButtonLink href={cta.href} variant="brand">
					{cta.text}
				</ButtonLink>
			</div>
		</div>
	);
}
