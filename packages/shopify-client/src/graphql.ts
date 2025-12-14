import type { ResultOf, VariablesOf } from 'gql.tada';
import { graphql } from './gql';

export type OperationData<TDoc> = ResultOf<TDoc>;

type LegacyTypes<TDoc> = {
	___type: {
		result: ResultOf<TDoc>;
		variables: VariablesOf<TDoc>;
	};
};

/*******************************************************************************
 * Fragments
 ******************************************************************************/

export const MONEY_FRAGMENT = graphql(`
	fragment MONEY_FRAGMENT on MoneyV2 {
		currencyCode
		amount
	}
`);

export const IMAGE_FRAGMENT = graphql(`
	fragment IMAGE_FRAGMENT on Image {
		id
		altText
		height
		url
		width
	}
`);

export const PRODUCT_PRICE_RANGE_FRAGMENT = graphql(`
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
`);

export const PRODUCT_CONNECTION_FRAGMENT = graphql(`
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
				priceRange {
					minVariantPrice {
						amount
						currencyCode
					}
				}
				tags
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
`);

export const PRODUCT_VARIANT_FRAGMENT = graphql(`
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
`);

/*******************************************************************************
 * Queries
 ******************************************************************************/

export const LEGAL_PAGE_QUERY = graphql(`
	query LEGAL_PAGE_QUERY($handle: String) {
		page(handle: $handle) {
			id
			body
			bodySummary
			title
		}
	}
`);

export const COLLECTION_QUERY = graphql(
	`
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
						variants(first: 250) {
							edges {
								node {
									id
									compareAtPrice {
										amount
										currencyCode
									}
									price {
										amount
										currencyCode
									}
								}
							}
						}
					}
				}
			}
			title
		}
	}
	`,
	[
		IMAGE_FRAGMENT,
		PRODUCT_PRICE_RANGE_FRAGMENT,
	],
);

export const COLLECTION_OPTIONS_QUERY = graphql(`
	query COLLECTION_OPTIONS_QUERY($after: String, $filters: [ProductFilter!], $first: Int = 250, $handle: String) {
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
						productType
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
`);

const ALL_PRODUCTS_QUERY_DOC = graphql(
	`
	query ALL_PRODUCTS_QUERY(
		$first: Int = 20
		$query: String = ""
		$sortKey: ProductSortKeys = RELEVANCE
		$reverse: Boolean = false
		$cursor: String = null
	) {
		products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query, after: $cursor) {
			...PRODUCT_CONNECTION_FRAGMENT
		}
	}
	`,
	[
		PRODUCT_CONNECTION_FRAGMENT,
	],
);

// Backwards-compatible helper for one legacy callsite in apps/web.
export const ALL_PRODUCTS_QUERY = ALL_PRODUCTS_QUERY_DOC as typeof ALL_PRODUCTS_QUERY_DOC &
	LegacyTypes<typeof ALL_PRODUCTS_QUERY_DOC>;

export const SINGLE_PRODUCT_QUERY = graphql(
	`
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
	`,
	[
		IMAGE_FRAGMENT,
		PRODUCT_VARIANT_FRAGMENT,
	],
);

export const SHOP_QUERY = graphql(`
	query SHOP_QUERY {
		shop {
			id
			name
			description
		}
	}
`);

export const CART_QUERY = graphql(
	`
	query CART_QUERY($cartId: ID!, $country: CountryCode, $language: LanguageCode)
	@inContext(country: $country, language: $language) {
		cart(id: $cartId) {
			id
			checkoutUrl
			totalQuantity
			buyerIdentity {
				countryCode
				customer {
					id
					email
					firstName
					lastName
					displayName
				}
				email
				phone
			}
			lines(first: 100) {
				edges {
					node {
						id
						quantity
						attributes {
							key
							value
						}
						cost {
							totalAmount {
								amount
								currencyCode
							}
							amountPerQuantity {
								amount
								currencyCode
							}
							compareAtAmountPerQuantity {
								amount
								currencyCode
							}
						}
						merchandise {
							... on ProductVariant {
								id
								availableForSale
								compareAtPrice {
									...MONEY_FRAGMENT
								}
								price {
									...MONEY_FRAGMENT
								}
								requiresShipping
								title
								image {
									...IMAGE_FRAGMENT
								}
								product {
									handle
									title
									id
								}
								selectedOptions {
									name
									value
								}
							}
						}
					}
				}
			}
			cost {
				subtotalAmount {
					...MONEY_FRAGMENT
				}
				totalAmount {
					...MONEY_FRAGMENT
				}
				totalDutyAmount {
					...MONEY_FRAGMENT
				}
				totalTaxAmount {
					...MONEY_FRAGMENT
				}
			}
			note
			attributes {
				key
				value
			}
			discountCodes {
				code
			}
		}
	}

	`,
	[
		IMAGE_FRAGMENT,
		MONEY_FRAGMENT,
	],
);

/*******************************************************************************
 * Mutations
 ******************************************************************************/

export const CREATE_CART_MUTATION = graphql(
	`
	mutation CREATE_CART_MUTATION($input: CartInput!) {
		cartCreate(input: $input) {
			cart {
				id
				checkoutUrl
				lines(first: 250) {
					edges {
						node {
							id
							quantity
							cost {
								amountPerQuantity {
									...MONEY_FRAGMENT
								}
								compareAtAmountPerQuantity {
									...MONEY_FRAGMENT
								}
								totalAmount {
									...MONEY_FRAGMENT
								}
							}
							merchandise {
								... on ProductVariant {
									id
									availableForSale
									currentlyNotInStock
									image {
										...IMAGE_FRAGMENT
									}
									price {
										...MONEY_FRAGMENT
									}
									product {
										id
										handle
										tags
										title
									}
									quantityAvailable
									title
								}
							}
						}
					}
				}
				cost {
					subtotalAmount {
						...MONEY_FRAGMENT
					}
					totalAmount {
						...MONEY_FRAGMENT
					}
					totalDutyAmount {
						...MONEY_FRAGMENT
					}
					totalTaxAmount {
						...MONEY_FRAGMENT
					}
				}
			}
			userErrors {
				field
				message
			}
		}
	}
	`,
	[
		IMAGE_FRAGMENT,
		MONEY_FRAGMENT,
	],
);
