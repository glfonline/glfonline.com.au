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

export const TESTIMONIALS_PAGE_QUERY = gql`
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
	${IMAGE_WITH_ALT_FRAGMENT_IMAGE_WITH_ALT}
` as import('../__generated__/ts-gql/GET_FAQS_PAGES').type;
