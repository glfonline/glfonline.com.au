import { gql } from '@ts-gql/tag/no-transform';

/**
 * Queries
 */

export const SINGLE_PRODUCT_QUERY = gql`
	query SINGLE_PRODUCT_QUERY($handle: String!) {
		productByHandle(handle: $handle) {
			id
			title
			description
			updatedAt
			tags
			priceRange {
				minVariantPrice {
					amount
					currencyCode
				}
			}
			images(first: 1) {
				edges {
					node {
						id
						altText
						transformedSrc
					}
				}
			}
			variants(first: 1) {
				edges {
					node {
						id
					}
				}
			}
		}
	}
` as import('../../__generated__/ts-gql/SINGLE_PRODUCT_QUERY').type;

export const PRODUCTS_QUERY = gql`
	query PRODUCTS_QUERY($first: Int = 6) {
		products(first: $first) {
			edges {
				node {
					id
					title
					description
					handle
					tags
					priceRange {
						minVariantPrice {
							amount
							currencyCode
						}
					}
					images(first: 1) {
						edges {
							node {
								id
								altText
								transformedSrc
							}
						}
					}
				}
			}
		}
	}
` as import('../../__generated__/ts-gql/PRODUCTS_QUERY').type;

export const COLLECTION_QUERY = gql`
	query COLLECTION_QUERY($collectionHandle: String) {
		collection(handle: $collectionHandle) {
			id
			title
			image {
				id
				altText
				url
			}
			products(first: 30, sortKey: BEST_SELLING) {
				edges {
					node {
						id
						availableForSale
						compareAtPriceRange {
							minVariantPrice {
								amount
								currencyCode
							}
						}
						description
						featuredImage {
							id
							altText
							url
						}
						handle
						tags
						title
					}
				}
			}
		}
	}
` as import('../../__generated__/ts-gql/COLLECTION_QUERY').type;

/**
 * Mutations
 */

export const CREATE_CHECKOUT_URL_MUTATION = gql`
	mutation CREATE_CHECKOUT_URL_MUTATION($input: CheckoutCreateInput!) {
		checkoutCreate(input: $input) {
			checkout {
				id
				webUrl
			}
		}
	}
` as import('../../__generated__/ts-gql/CREATE_CHECKOUT_URL_MUTATION').type;
