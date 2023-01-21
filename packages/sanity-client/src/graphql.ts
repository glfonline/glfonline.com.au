import { gql } from '@ts-gql/tag/no-transform';

/**
 * Fragments
 */

export const IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT = gql`
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
` as import('../__generated__/ts-gql/IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT').type;

/**
 * Queries
 */

export const MAIN_NAVIGATION_QUERY = gql`
	query MAIN_NAVIGATION_QUERY($id: ID = "main-navigation") {
		MainNavigation(id: $id) {
			categories {
				_key
				theme
				featuredCollection {
					_id
					image {
						...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
					}
				}
				sections {
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
	${IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT}
` as import('../__generated__/ts-gql/MAIN_NAVIGATION_QUERY').type;

export const HOME_PAGE_QUERY = gql`
	query HOME_PAGE_QUERY($id: ID = "home") {
		HomePage(id: $id) {
			heroImage {
				...IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT
			}
			heading
			descriptionRaw
		}
	}
	${IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT}
` as import('../__generated__/ts-gql/HOME_PAGE_QUERY').type;

export const ABOUT_PAGE_QUERY = gql`
	query ABOUT_PAGE_QUERY($id: ID = "testimonials") {
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
	${IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT}
` as import('../__generated__/ts-gql/ABOUT_PAGE_QUERY').type;

export const TESTIMONIALS_PAGE_QUERY = gql`
	query TESTIMONIALS_PAGE_QUERY($id: ID = "testimonials") {
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
	${IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT}
` as import('../__generated__/ts-gql/TESTIMONIALS_PAGE_QUERY').type;

export const GET_THEME_PAGE = gql`
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
		}
	}
	${IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT}
` as import('../__generated__/ts-gql/GET_THEME_PAGE').type;

export const GET_FAQS_PAGES = gql`
	query GET_FAQS_PAGES($id: ID = "faqs") {
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
	${IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT}
` as import('../__generated__/ts-gql/GET_FAQS_PAGES').type;
