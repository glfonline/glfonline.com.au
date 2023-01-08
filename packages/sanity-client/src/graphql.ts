import { gql } from '@ts-gql/tag/no-transform';

/**
 * Queries
 */

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
				span
			}
		}
	}
` as import('../__generated__/ts-gql/GET_THEME_PAGE').type;

export const GET_FAQS_PAGES = gql`
	query GET_FAQS_PAGES($id: ID!) {
		FaqPage(id: $id) {
			_id
			heroImage {
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
			faqs {
				answerRaw
				question
			}
		}
	}
` as import('../__generated__/ts-gql/GET_FAQS_PAGES').type;
