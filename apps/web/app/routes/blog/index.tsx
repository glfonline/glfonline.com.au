import { json, type MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';

import { Button, ButtonLink } from '~/components/design-system/button';
import { getHeadingStyles } from '~/components/design-system/heading';
import { Hero } from '~/components/hero';
import { fetchPosts, usePosts } from '~/lib/fetch-blog-posts';
import { type PortableTextProps } from '~/lib/portable-text';
import { PortableText } from '~/lib/portable-text';
import { urlFor } from '~/lib/sanity-image';
import { getSeoMeta } from '~/seo';
import { type Theme } from '~/types';

const POSTS_LIMIT = 5;
const POSTS_OFFSET = 0;

export async function loader() {
	const allPosts = await fetchPosts({
		limit: POSTS_LIMIT,
		offset: POSTS_OFFSET,
	});
	return json({ allPosts, title: 'Blog' });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const seoMeta = getSeoMeta({
		title: data.title,
	});
	return { ...seoMeta };
};

export default function Blog() {
	const { allPosts, title } = useLoaderData<typeof loader>();
	const posts = usePosts({
		limit: POSTS_LIMIT,
		offset: POSTS_OFFSET,
		initialData: allPosts,
	});

	return (
		<Fragment>
			<Hero
				title={title}
				image={{
					url: 'https://www.glfonline.com.au/static/9a328f78e40c139b626f4e1ffe4e2f7f/385a5/blog-hero.webp',
				}}
			/>
			<div className="relative mx-auto flex w-full justify-center gap-4 px-4 sm:px-6 lg:gap-16 lg:px-8">
				<div className="flex min-w-0 max-w-4xl flex-auto flex-col py-16 lg:max-w-none">
					<article className="flex-1">
						<PostList {...posts} />
					</article>
				</div>
				<div className="hidden lg:sticky lg:top-[6.625rem] lg:-mr-6 lg:block lg:h-[calc(100vh-6.625rem)] lg:flex-none lg:overflow-y-auto lg:py-16 lg:pr-6">
					<Sidebar />
				</div>
			</div>
		</Fragment>
	);
}

function PostList({
	data,
	fetchNextPage,
	isFetching,
}: Pick<ReturnType<typeof usePosts>, 'data' | 'fetchNextPage' | 'isFetching'>) {
	const hasNextPage = data?.pages.at(-1)?.length === POSTS_LIMIT;

	return (
		<div className="mx-auto flex max-w-7xl flex-col gap-8">
			<div className="flex">
				<h1 className={getHeadingStyles({ size: '2' })}>
					Stay connected with our blogs
				</h1>
			</div>
			<section aria-labelledby="gallery-heading">
				<h2 id="gallery-heading" className="sr-only">
					Recently viewed
				</h2>
				<ul role="list" className="grid grid-flow-row auto-rows-fr gap-8">
					{data?.pages.map((posts, pageIndex) => (
						<Fragment key={pageIndex}>
							{posts.map((post, postIndex) => (
								<Post
									key={postIndex}
									imgSrc={urlFor({
										_ref: post.mainImage.asset._id,
										crop: post.mainImage.asset.crop,
										hotspot: post.mainImage.asset.hotspot,
									})
										.auto('format')
										.height(256)
										.width(256)
										.focalPoint(0.5, 0.5)
										.dpr(3)
										.url()}
									href={`/blog/${post.slug.current}`}
									excerpt={post.bodyRaw[0]}
									heading={post.title}
									author={post.author.name}
									publishDate={post.publishedAt}
								/>
							))}
						</Fragment>
					))}
				</ul>
				<div className="flex items-center justify-center pt-16">
					{hasNextPage && (
						<Button
							size="regular"
							variant="neutral"
							onClick={() => fetchNextPage()}
							isLoading={isFetching}
						>
							{isFetching ? 'Loading' : 'Load More'}
						</Button>
					)}
				</div>
			</section>
		</div>
	);
}

type PostProps = {
	imgSrc: string;
	href: string;
	heading: string;
	excerpt: PortableTextProps['value'];
	author: string;
	publishDate: string;
};

function Post({
	imgSrc,
	href,
	heading,
	excerpt,
	author,
	publishDate,
}: PostProps) {
	return (
		<li key={imgSrc} className="flex">
			<Link to={href} className="flex w-full flex-col sm:flex-row">
				<div className="relative flex h-48 sm:h-auto sm:w-64">
					<img
						className="h-full w-full object-cover sm:absolute sm:inset-0"
						src={imgSrc}
						alt=""
					/>
				</div>
				<div className="flex min-w-0 flex-1 flex-col justify-between bg-white p-6">
					<div className="flex flex-1 flex-col gap-4">
						<h3 className={getHeadingStyles({ size: '3' })}>{heading}</h3>
						<div className="prose line-clamp-3">
							<PortableText value={excerpt} />
						</div>
					</div>
					<div className="mt-6 max-w-prose">
						<p className="text-sm font-bold leading-5 text-gray-900">
							{author}
						</p>
						<div className="text-sm font-bold italic text-gray-700">
							<time dateTime={publishDate}>
								{new Date(publishDate).toDateString()}
							</time>
						</div>
					</div>
				</div>
			</Link>
		</li>
	);
}

function Sidebar() {
	const { allPosts } = useLoaderData<typeof loader>();
	const featuredPost = allPosts.find((post) =>
		post.categories?.find((category) => category.title === 'Featured')
	);

	return (
		<aside
			aria-labelledby="featured-posts"
			className="flex w-80 flex-col gap-8"
		>
			{featuredPost && (
				<FeaturedPost
					imgSrc={urlFor({
						_ref: featuredPost.mainImage.asset._id,
						crop: featuredPost.mainImage.asset.crop,
						hotspot: featuredPost.mainImage.asset.hotspot,
					})
						.auto('format')
						.height(256)
						.width(256)
						.focalPoint(0.5, 0.5)
						.dpr(3)
						.url()}
					href={`/blog/${featuredPost.slug.current}`}
					excerpt={featuredPost.bodyRaw[0]}
					heading={featuredPost.title}
					author={featuredPost.author.name}
					publishDate={featuredPost.publishedAt}
				/>
			)}
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

function FeaturedPost({ imgSrc, excerpt, author, publishDate }: PostProps) {
	return (
		<article className="flex flex-col gap-8">
			<h2 id="featured-posts" className={getHeadingStyles({ size: '2' })}>
				Featured Post
			</h2>
			<div className="flex flex-col gap-6">
				<img src={imgSrc} alt="" className="aspect-square object-cover" />
				<div className="prose line-clamp-3">
					<PortableText value={excerpt} />
				</div>
				<div className="flex text-sm">
					<span className="font-bold">{author}</span>
					<span aria-hidden className="mx-2">
						|
					</span>
					<span className="text-sm font-bold italic text-gray-700">
						<time dateTime={publishDate}>
							{new Date(publishDate).toDateString()}
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
