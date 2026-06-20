/**
 * The query-string key used for the product-type filter. Lives in its own
 * client-safe module so UI components can import it without pulling in the
 * server-only Shopify query helpers.
 */
export const PRODUCT_TYPE = 'productType';
