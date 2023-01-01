import { gql } from '@ts-gql/tag/no-transform';

/**
 * Queries
 */

export const GET_ALL_THEME_PAGES = gql`
	query GET_ALL_THEME_PAGES {
		allThemePage {
			_id
			theme
			collectionCard {
				_key
				link
				linkText
				image {
					asset {
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
` as import('../__generated__/ts-gql/GET_ALL_THEME_PAGES').type;
