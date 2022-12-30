import { gql } from '@ts-gql/tag/no-transform';

/**
 * Queries
 */

export const SINGLE_PRODUCT_QUERY = gql`
	query SINGLE_PRODUCT_QUERY($handle: String!) {
		product(handle: $handle) {
			id
			availableForSale
			description
			descriptionHtml
			images(first: 20) {
				pageInfo {
					hasNextPage
					hasPreviousPage
				}
				edges {
					node {
						id
						url
						altText
						width
						height
					}
				}
			}
			options {
				id
				name
				values
			}
			priceRange {
				minVariantPrice {
					amount
					currencyCode
				}
			}
			tags
			title
			updatedAt
			variants(first: 250) {
				pageInfo {
					hasNextPage
					hasPreviousPage
				}
				edges {
					node {
						id
						title
						sku
						image {
							id
							altText
							url
						}
						availableForSale
						requiresShipping
						selectedOptions {
							name
							value
						}
						priceV2 {
							amount
							currencyCode
						}
						compareAtPriceV2 {
							amount
							currencyCode
						}
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
