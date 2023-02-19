import { gql } from '@ts-gql/tag/no-transform';

/**
 * Fragments
 */

export const PRODUCT_VARIANT_PRODUCTS_FRAGMENT = gql`
	fragment PRODUCT_VARIANT_PRODUCTS_FRAGMENT on ProductVariant {
		__typename
		id
		title
		image {
			id
			altText
			height
			url
			width
		}
		priceV2 {
			amount
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
						height
						url
						width
					}
				}
			}
			tags
			title
		}
	}
` as import('../__generated__/ts-gql/PRODUCT_VARIANT_PRODUCTS_FRAGMENT').type;

/**
 * Queries
 */

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
				}
			}
			vendor
		}
	}
` as import('../__generated__/ts-gql/SINGLE_PRODUCT_QUERY').type;

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
								height
								url
								width
							}
						}
					}
					priceRange {
						minVariantPrice {
							amount
						}
					}
					tags
					title
				}
			}
		}
	}
` as import('../__generated__/ts-gql/PRODUCTS_QUERY').type;

export const COLLECTION_QUERY = gql`
	query COLLECTION_QUERY(
		$after: String
		$collectionHandle: String
		$first: Int = 250
		$sortKey: ProductCollectionSortKeys = BEST_SELLING
	) {
		collection(handle: $collectionHandle) {
			id
			title
			image {
				id
				altText
				height
				url
				width
			}
			products(
				after: $after
				filters: { available: true }
				first: $first
				sortKey: $sortKey
			) {
				pageInfo {
					endCursor
					hasNextPage
				}
				edges {
					node {
						id
						availableForSale
						description
						featuredImage {
							id
							altText
							height
							url
							width
						}
						handle
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
						vendor
					}
				}
			}
		}
	}
` as import('../__generated__/ts-gql/COLLECTION_QUERY').type;

export const COLLECTION_OPTIONS_QUERY = gql`
	query COLLECTION_OPTIONS_QUERY(
		$after: String
		$collectionHandle: String
		$first: Int = 250
	) {
		collection(handle: $collectionHandle) {
			id
			products(
				after: $after
				filters: { available: true }
				first: $first
				sortKey: BEST_SELLING
			) {
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

export const GET_PRODUCT_VARIANTS_QUERY = gql`
	query GET_PRODUCT_VARIANTS_QUERY($ids: [ID!]!) {
		nodes(ids: $ids) {
			id
			...PRODUCT_VARIANT_PRODUCTS_FRAGMENT
		}
	}
	${PRODUCT_VARIANT_PRODUCTS_FRAGMENT}
` as import('../__generated__/ts-gql/GET_PRODUCT_VARIANTS_QUERY').type;

/**
 * Mutations
 */

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
									id
									altText
									height
									url
									width
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
` as import('../__generated__/ts-gql/CREATE_CHECKOUT_MUTATION').type;
