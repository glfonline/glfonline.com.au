import { graphql } from './gql';

/**
 * Fragments
 */

export const IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT = graphql(`
	fragment IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT on ImageWithAlt {
		asset {
			_id
			altText
			path
		}
		crop {
			top
			bottom
			left
			right
		}
		hotspot {
			x
			y
			height
			width
		}
	}
`);

/**
 * Queries
 */

export const BLOG_POST_QUERY = graphql(
	`
	query BLOG_POST_QUERY($slug: String!) {
		allPost(where: { slug: { current: { eq: $slug } } }) {
			_id
			author {
				name
			}
			bodyRaw
			categories {
				title
			}
			mainImage {
				...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
			}
			publishedAt
			slug {
				current
			}
			title
		}
	}
	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);

export const BLOG_POSTS_COUNT_QUERY = graphql(`
	query BLOG_POSTS_COUNT_QUERY {
		allPost {
			_id
		}
	}
`);

export const BLOG_PAGE_QUERY = graphql(
	`
	query BLOG_PAGE_QUERY($limit: Int = 5, $offset: Int = 0) {
		allPost(limit: $limit, offset: $offset, sort: { publishedAt: DESC }) {
			_id
			author {
				name
			}
			bodyRaw
			categories {
				title
			}
			mainImage {
				...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
			}
			publishedAt
			slug {
				current
			}
			title
		}
	}
	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);

export const FEATURED_BLOG_POST_QUERY = graphql(
	`
	query FEATURED_BLOG_POST_QUERY {
		allPost(sort: { publishedAt: DESC }) {
			_id
			author {
				name
			}
			bodyRaw
			categories {
				title
			}
			mainImage {
				...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
			}
			publishedAt
			slug {
				current
			}
			title
		}
	}

	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);

export const MAIN_NAVIGATION_QUERY = graphql(
	`
	query MAIN_NAVIGATION_QUERY($id: ID = "mainNavigation") {
		MainNavigation(id: $id) {
			navCategories {
				label
				theme
				featuredItems {
					_key
					label
					href
					image {
						...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
					}
				}
				navSections {
					_key
					label
					items {
						_key
						label
						href
					}
				}
			}
			pages {
				_key
				label
				href
			}
		}
	}
	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);

export const HOME_PAGE_QUERY = graphql(
	`
	query HOME_PAGE_QUERY($id: ID! = "home") {
		HomePage(id: $id) {
			heroImage {
				...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
			}
			heading
			descriptionRaw
			themeCards {
				_key
				heading
				href
				label
				image {
					...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
				}
				theme
			}
			brandsWeLove {
				_id
				label
				href
				image {
					...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
				}
				theme
			}
		}
	}
	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);

export const ABOUT_PAGE_QUERY = graphql(
	`
	query ABOUT_PAGE_QUERY($id: ID! = "testimonials") {
		AboutPage(id: $id) {
			sections {
				_key
				aboutImage {
					...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
				}
				contentRaw
				subheading
			}
		}
	}
	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);

export const TESTIMONIALS_PAGE_QUERY = graphql(
	`
	query TESTIMONIALS_PAGE_QUERY($id: ID! = "testimonials") {
		TestimonialsPage(id: $id) {
			heroImage {
				...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
			}
			testimonials {
				_key
				author
				quoteRaw
				testimonialImage {
					...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
				}
			}
		}
	}
	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);

export const GET_THEME_PAGE = graphql(
	`
	query GET_THEME_PAGE($id: ID!) {
		ThemePage(id: $id) {
			_id
			theme
			collectionCards {
				_key
				href
				label
				image {
					...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
				}
				span
			}
			brandsWeLove {
				_id
				label
				href
				image {
					...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
				}
				theme
			}
		}
	}
	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);

export const GET_FAQS_PAGES = graphql(
	`
	query GET_FAQS_PAGES($id: ID! = "faqs") {
		FaqPage(id: $id) {
			_id
			heroImage {
				...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
			}
			faqs {
				answerRaw
				question
			}
		}
	}
	`,
	[
		IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT,
	],
);
