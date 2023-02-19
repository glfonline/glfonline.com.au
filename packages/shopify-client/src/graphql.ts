import { gql } from '@ts-gql/tag/no-transform';

/*******************************************************************************
 * Fragments
 ******************************************************************************/

export const IMAGE_FRAGMENT = gql`
	fragment IMAGE_FRAGMENT on Image {
		id
		altText
		height
		url
		width
	}
` as import('../__generated__/ts-gql/IMAGE_FRAGMENT').type;

export const PRODUCT_PRICE_RANGE_FRAGMENT = gql`
	fragment PRODUCT_PRICE_RANGE_FRAGMENT on ProductPriceRange {
		maxVariantPrice {
			amount
			currencyCode
		}
		minVariantPrice {
			amount
			currencyCode
		}
	}
` as import('../__generated__/ts-gql/PRODUCT_PRICE_RANGE_FRAGMENT').type;

export const PRODUCT_CONNECTION_FRAGMENT = gql`
	fragment PRODUCT_CONNECTION_FRAGMENT on ProductConnection {
		pageInfo {
			endCursor
			hasNextPage
			hasPreviousPage
		}
		edges {
			cursor
			node {
				id
				title
				vendor
				handle
				priceRange {
					minVariantPrice {
						amount
						currencyCode
					}
				}
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
							url
							width
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
	}
` as import('../__generated__/ts-gql/PRODUCT_CONNECTION_FRAGMENT').type;

export const PRODUCT_VARIANT_FRAGMENT = gql`
	fragment PRODUCT_VARIANT_FRAGMENT on ProductVariant {
		id
		availableForSale
		compareAtPrice {
			amount
		}
		currentlyNotInStock
		image {
			id
			altText
			height
			url
			width
		}
		price {
			amount
		}
		requiresShipping
		selectedOptions {
			name
			value
		}
		sku
		title
	}
` as import('../__generated__/ts-gql/PRODUCT_VARIANT_FRAGMENT').type;

/*******************************************************************************
 * Queries
 ******************************************************************************/

export const LEGAL_PAGE_QUERY = gql`
	query LEGAL_PAGE_QUERY($handle: String) {
		page(handle: $handle) {
			id
			body
			bodySummary
			title
		}
	}
` as import('../__generated__/ts-gql/LEGAL_PAGE_QUERY').type;

export const COLLECTION_QUERY = gql`
	query COLLECTION_QUERY(
		$after: String
		$before: String
		$filters: [ProductFilter!]
		$first: Int
		$handle: String
		$last: Int
		$reverse: Boolean
		$sortKey: ProductCollectionSortKeys
	) {
		collection(handle: $handle) {
			id
			image {
				...IMAGE_FRAGMENT
			}
			products(
				after: $after
				before: $before
				filters: $filters
				first: $first
				last: $last
				reverse: $reverse
				sortKey: $sortKey
			) {
				pageInfo {
					endCursor
					hasNextPage
					hasPreviousPage
				}
				edges {
					node {
						id
						availableForSale
						compareAtPriceRange {
							...PRODUCT_PRICE_RANGE_FRAGMENT
						}
						handle
						featuredImage {
							...IMAGE_FRAGMENT
						}
						priceRange {
							...PRODUCT_PRICE_RANGE_FRAGMENT
						}
						tags
						title
					}
				}
			}
			title
		}
	}
	${IMAGE_FRAGMENT}
	${PRODUCT_PRICE_RANGE_FRAGMENT}
` as import('../__generated__/ts-gql/COLLECTION_QUERY').type;

export const COLLECTION_OPTIONS_QUERY = gql`
	query COLLECTION_OPTIONS_QUERY(
		$after: String
		$filters: [ProductFilter!]
		$first: Int = 250
		$handle: String
	) {
		collection(handle: $handle) {
			id
			products(after: $after, filters: $filters, first: $first) {
				pageInfo {
					endCursor
					hasNextPage
				}
				edges {
					node {
						id
						options {
							id
							name
							values
						}
					}
				}
			}
		}
	}
` as import('../__generated__/ts-gql/COLLECTION_OPTIONS_QUERY').type;

export const ALL_PRODUCTS_QUERY = gql`
	query ALL_PRODUCTS_QUERY(
		$first: Int = 20
		$query: String = ""
		$sortKey: ProductSortKeys = RELEVANCE
		$reverse: Boolean = false
		$cursor: String = null
	) {
		products(
			first: $first
			sortKey: $sortKey
			reverse: $reverse
			query: $query
			after: $cursor
		) {
			...PRODUCT_CONNECTION_FRAGMENT
		}
	}
	${PRODUCT_CONNECTION_FRAGMENT}
` as import('../__generated__/ts-gql/ALL_PRODUCTS_QUERY').type;

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
						...IMAGE_FRAGMENT
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
				}
			}
			productType
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
						...PRODUCT_VARIANT_FRAGMENT
					}
				}
			}
			vendor
		}
	}
	${IMAGE_FRAGMENT}
	${PRODUCT_VARIANT_FRAGMENT}
` as import('../__generated__/ts-gql/SINGLE_PRODUCT_QUERY').type;

/*******************************************************************************
 * Mutations
 ******************************************************************************/

export const CREATE_CHECKOUT_MUTATION = gql`
	mutation CREATE_CHECKOUT_MUTATION($input: CheckoutCreateInput!) {
		checkoutCreate(input: $input) {
			checkout {
				id
				lineItems(first: 250) {
					edges {
						node {
							id
							quantity
							title
							variant {
								id
								availableForSale
								currentlyNotInStock
								image {
									...IMAGE_FRAGMENT
								}
								price {
									amount
								}
								product {
									id
									handle
									tags
								}
								quantityAvailable
								title
							}
						}
					}
				}
				subtotalPrice {
					amount
				}
				webUrl
			}
		}
	}
	${IMAGE_FRAGMENT}
` as import('../__generated__/ts-gql/CREATE_CHECKOUT_MUTATION').type;
