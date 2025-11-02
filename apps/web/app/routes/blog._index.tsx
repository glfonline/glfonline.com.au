import { Image } from '@unpic/react';
import {
	data as json,
	Link,
	type LoaderFunctionArgs,
	type MetaFunction,
	useLoaderData,
	useLocation,
	useNavigate,
} from 'react-router';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { ButtonLink } from '../components/design-system/button';
import { getHeadingStyles } from '../components/design-system/heading';
import { Hero } from '../components/hero';
import { CACHE_SHORT, routeHeaders } from '../lib/cache';
import { getBlogPostCount, getBlogPosts } from '../lib/get-blog-posts';
import { getFeaturedBlogPost } from '../lib/get-featured-blog-post';
import { PortableText, type PortableTextProps } from '../lib/portable-text';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';
import type { Theme } from '../types';

const POSTS_LIMIT = 5;

const BlogSchema = z
	.object({
		after: z.string().optional(),
	})
	.transform(({ after }) => {
		const afterAsNumber = Number(after);
		return {
			after:
				after === undefined
					? undefined
					: afterAsNumber >= 0 && !Number.isNaN(afterAsNumber)
						? afterAsNumber
						: undefined,
		};
	});

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const parseResult = BlogSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
	const { after = 0 } = parseResult.success
		? parseResult.data
		: {
				after: 0,
			};
	const [posts, featuredPost, count] = await Promise.all([
		getBlogPosts({
			limit: POSTS_LIMIT,
			offset: after,
		}),
		getFeaturedBlogPost(),
		getBlogPostCount(),
	]);
	return json(
		{
			after,
			count,
			featuredPost,
			posts,
			title: 'Blog',
		},
		{
			headers: {
				'Cache-Control': CACHE_SHORT,
			},
		},
	);
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
	invariant(loaderData, 'Expected data for meta function');
	return getSeoMeta({
		title: loaderData.title,
	});
};

export const headers = routeHeaders;

export default function Blog() {
	const { title } = useLoaderData<typeof loader>();

	return (
		<>
			<Hero
				image={{
					url: 'https://cdn.shopify.com/s/files/1/1080/9832/files/blog-hero.jpg?v=1677992122',
				}}
				title={title}
			/>
			<div className="relative mx-auto flex w-full justify-center gap-4 px-4 sm:px-6 lg:gap-16 lg:px-8">
				<div className="flex min-w-0 max-w-4xl flex-auto flex-col py-16 lg:max-w-none">
					<article className="flex-1">
						<PostList />
					</article>
				</div>
				<div className="lg:-mr-6 hidden lg:block lg:flex-none lg:overflow-y-auto lg:py-16 lg:pr-6">
					<Sidebar />
				</div>
			</div>
		</>
	);
}

function PostList() {
	const { after, count, posts } = useLoaderData<typeof loader>();

	return (
		<div className="mx-auto flex max-w-7xl flex-col gap-8">
			<div className="flex">
				<h1
					className={getHeadingStyles({
						size: '2',
					})}
				>
					Stay connected with our blogs
				</h1>
			</div>
			<section aria-labelledby="gallery-heading">
				<h2 className="sr-only" id="gallery-heading">
					Recently viewed
				</h2>
				<ul className="grid grid-flow-row auto-rows-fr gap-8" role="list">
					{posts.map((post, postIndex) => (
						<Post
							author={post.author.name}
							excerpt={post.bodyRaw[0]}
							heading={post.title}
							href={`/blog/${post.slug.current}`}
							imgSrc={urlFor({
								_ref: post.mainImage.asset._id,
								crop: post.mainImage.crop,
								hotspot: post.mainImage.hotspot,
							})
								.auto('format')
								.height(256)
								.width(256)
								.dpr(2)
								.url()}
							key={postIndex}
							publishDate={post.publishedAt}
						/>
					))}
				</ul>
				<Pagination hasNextPage={after + POSTS_LIMIT <= count} hasPrevPage={after > POSTS_LIMIT} />
			</section>
		</div>
	);
}

export function Pagination({ hasNextPage, hasPrevPage }: { hasNextPage: boolean; hasPrevPage: boolean }) {
	const { after } = useLoaderData<typeof loader>();
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<nav
			aria-label="Pagination"
			className="mx-auto mt-6 flex max-w-7xl items-center justify-between font-medium text-gray-700 text-sm"
		>
			<div className="min-w-0 flex-1">
				{hasPrevPage && (
					<button
						className="inline-flex h-10 items-center rounded-md border border-gray-300 bg-white px-4 hover:bg-gray-100 focus:border-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-opacity-25 focus:ring-offset-1 focus:ring-offset-pink-600"
						onClick={async () => {
							await navigate(-1);
						}}
						type="button"
					>
						Previous
					</button>
				)}
			</div>
			<p className="mx-auto flex-1 text-center">{/*  */}</p>
			<div className="flex min-w-0 flex-1 justify-end">
				{hasNextPage && (
					<button
						className="inline-flex h-10 items-center rounded-md border border-gray-300 bg-white px-4 hover:bg-gray-100 focus:border-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-opacity-25 focus:ring-offset-1 focus:ring-offset-pink-600"
						onClick={async () => {
							const params = new URLSearchParams(location.search);
							params.set('after', (after + POSTS_LIMIT).toString());
							await navigate(`${location.pathname}?${params.toString()}`);
						}}
						type="button"
					>
						Next
					</button>
				)}
			</div>
		</nav>
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

function Post({ imgSrc, href, heading, excerpt, author, publishDate }: PostProps) {
	return (
		<li className="flex" key={imgSrc}>
			<Link className="flex w-full flex-col sm:flex-row" prefetch="intent" to={href}>
				<div className="relative flex h-48 sm:h-auto sm:w-64">
					<Image
						alt=""
						breakpoints={[
							512,
						]}
						className="h-full w-full object-cover sm:absolute sm:inset-0"
						layout="fullWidth"
						priority={false}
						sizes="(min-width: 256px) 256px, 100vw"
						src={imgSrc}
					/>
				</div>
				<div className="flex min-w-0 flex-1 flex-col justify-between bg-white p-6">
					<div className="flex flex-1 flex-col gap-4">
						<h3
							className={getHeadingStyles({
								size: '3',
							})}
						>
							{heading}
						</h3>
						<div className="prose line-clamp-3">
							<PortableText value={excerpt} />
						</div>
					</div>
					<div className="mt-6 max-w-prose">
						<p className="font-bold text-gray-900 text-sm leading-5">{author}</p>
						<div className="font-bold text-gray-700 text-sm italic">
							<time dateTime={publishDate}>{new Date(publishDate).toDateString()}</time>
						</div>
					</div>
				</div>
			</Link>
		</li>
	);
}

function Sidebar() {
	const { featuredPost } = useLoaderData<typeof loader>();

	return (
		<aside aria-labelledby="featured-posts" className="flex w-80 flex-col gap-8">
			{featuredPost && (
				<FeaturedPost
					author={featuredPost.author.name}
					excerpt={featuredPost.bodyRaw[0]}
					heading={featuredPost.title}
					href={`/blog/${featuredPost.slug.current}`}
					imgSrc={urlFor({
						_ref: featuredPost.mainImage.asset._id,
						crop: featuredPost.mainImage.crop,
						hotspot: featuredPost.mainImage.hotspot,
					})
						.auto('format')
						.height(256)
						.width(256)
						.dpr(2)
						.url()}
					publishDate={featuredPost.publishedAt}
				/>
			)}
			<CTA
				cta={{
					href: '/ladies',
					text: 'Shop now',
				}}
				heading="Shop ladies clothing and accessories"
				image={{
					src: 'https://cdn.shopify.com/s/files/1/1080/9832/files/blog-sidebar-ladies.jpg?v=1677993059',
				}}
				subHeading="Head to our online store"
				theme="ladies"
			/>
			<CTA
				cta={{
					href: '/mens',
					text: 'Shop now',
				}}
				heading="Shop mens clothing and accessories"
				image={{
					src: 'https://cdn.shopify.com/s/files/1/1080/9832/files/blog-sidebar-mens.jpg?v=1677993069',
				}}
				subHeading="Head to our online store"
				theme="mens"
			/>
		</aside>
	);
}

function FeaturedPost({ imgSrc, excerpt, author, publishDate }: PostProps) {
	return (
		<article className="flex flex-col gap-8">
			<h2
				className={getHeadingStyles({
					size: '2',
				})}
				id="featured-posts"
			>
				Featured Post
			</h2>
			<div className="flex flex-col gap-6">
				<Image
					alt=""
					className="aspect-square object-cover"
					height={320}
					layout="constrained"
					priority={false}
					src={imgSrc}
					width={320}
				/>
				<div className="prose line-clamp-3">
					<PortableText value={excerpt} />
				</div>
				<div className="flex text-sm">
					<span className="font-bold">{author}</span>
					<span aria-hidden className="mx-2">
						|
					</span>
					<span className="font-bold text-gray-700 text-sm italic">
						<time dateTime={publishDate}>{new Date(publishDate).toDateString()}</time>
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
	cta: {
		text: string;
		href: string;
	};
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
			<Image
				alt={image.alt ?? ''}
				className="absolute inset-0 h-full w-full object-cover"
				height={320}
				layout="constrained"
				src={image.src}
				width={320}
			/>
			<div
				className="relative flex flex-1 flex-col items-center gap-2 bg-true-black/50 px-8 py-16 text-center text-white"
				data-theme={theme}
			>
				<h2
					className={getHeadingStyles({
						color: 'light',
						size: '2',
					})}
				>
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
