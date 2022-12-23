import type { OperationData } from '@ts-gql/tag/no-transform';
import { gql } from '@ts-gql/tag/no-transform';

/**
 * Queries
 */

export const SINGLE_PRODUCT_QUERY = gql`
	query singleProductQuery($handle: String!) {
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
` as import('../../__generated__/ts-gql/singleProductQuery').type;
export type SingleProductQueryType = OperationData<typeof SINGLE_PRODUCT_QUERY>;

export const PRODUCTS_QUERY = gql`
	query productsQuery($first: Int = 6) {
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
` as import('../../__generated__/ts-gql/productsQuery').type;
export type ProductsQueryType = OperationData<typeof PRODUCTS_QUERY>;

export const COLLECTION_QUERY = gql`
	query collectionQuery($collectionHandle: String) {
		collection(handle: $collectionHandle) {
			id
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
` as import('../../__generated__/ts-gql/collectionQuery').type;

/**
 * Mutations
 */

export const CREATE_CHECKOUT_URL_MUTATION = gql`
	mutation createCheckoutUrlMutation($input: CheckoutCreateInput!) {
		checkoutCreate(input: $input) {
			checkout {
				id
				webUrl
			}
		}
	}
` as import('../../__generated__/ts-gql/createCheckoutUrlMutation').type;
export type CreateCheckoutUrlMutationType = OperationData<
	typeof CREATE_CHECKOUT_URL_MUTATION
>;
