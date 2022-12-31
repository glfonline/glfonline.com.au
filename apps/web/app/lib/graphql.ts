import { gql } from '@ts-gql/tag/no-transform';

/**
 * Fragments
 */

export const PRODUCT_CONNECTION_PRODUCTS = gql`
	fragment PRODUCT_CONNECTION_PRODUCTS on ProductConnection {
		pageInfo {
			hasNextPage
			hasPreviousPage
		}
		edges {
			cursor
			node {
				id
				handle
				images(first: 1) {
					pageInfo {
						hasNextPage
						hasPreviousPage
					}
					edges {
						node {
							id
							altText
							height
							originalSrc
							width
						}
					}
				}
				priceRange {
					minVariantPrice {
						amount
						currencyCode
					}
				}
				title
				variants(first: 1) {
					edges {
						node {
							id
						}
					}
				}
				vendor
			}
		}
	}
` as import('../../__generated__/ts-gql/PRODUCT_CONNECTION_PRODUCTS').type;

export const PRODUCT_VARIANT_PRODUCTS = gql`
	fragment PRODUCT_VARIANT_PRODUCTS on ProductVariant {
		__typename
		id
		title
		image {
			id
			altText
			url
		}
		priceV2 {
			amount
			currencyCode
		}
		product {
			id
			availableForSale
			handle
			images(first: 1) {
				edges {
					node {
						id
						altText
						url
					}
				}
			}
			title
		}
	}
` as import('../../__generated__/ts-gql/PRODUCT_VARIANT_PRODUCTS').type;

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
						altText
						url
						height
						width
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
						availableForSale
						compareAtPriceV2 {
							amount
							currencyCode
						}
						image {
							id
							altText
							url
						}
						priceV2 {
							amount
							currencyCode
						}
						requiresShipping
						selectedOptions {
							name
							value
						}
						sku
						title
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
					description
					handle
					images(first: 1) {
						edges {
							node {
								id
								altText
								transformedSrc
							}
						}
					}
					priceRange {
						minVariantPrice {
							amount
							currencyCode
						}
					}
					tags
					title
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

export const GET_PRODUCT_VARIANTS_QUERY = gql`
	query GET_PRODUCT_VARIANTS_QUERY($ids: [ID!]!) {
		nodes(ids: $ids) {
			id
			...PRODUCT_VARIANT_PRODUCTS
		}
	}
	${PRODUCT_VARIANT_PRODUCTS}
` as import('../../__generated__/ts-gql/GET_PRODUCT_VARIANTS_QUERY').type;

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
