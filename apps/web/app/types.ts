import type { z } from 'zod';

/**
 * Response type from the Remix Action Function
 */
export type FormResponse = {
	/**
	 * True when form was succesfully handled
	 */
	ok: boolean;

	/**
	 * Any server-side only issues
	 */
	serverIssues?: Array<z.core.$ZodIssue>;
};

export type Theme = 'ladies' | 'mens';

export type Maybe<T> = null | undefined | T;

export type StringWithAutocomplete<T> = T | (string & Record<never, never>);

// Standard locale types
export type LanguageCode = string;
export type CountryCode = string;
export type CurrencyCode = string;

export type Locale = {
	language: LanguageCode;
	country: CountryCode;
	label: string;
	currency: CurrencyCode;
};

export type Localizations = Record<string, Locale>;

export type I18nLocale = Locale & {
	pathPrefix: string;
};

// Generic storefront type
export type Storefront<T = any> = {
	locale: T;
	// Add other storefront properties as needed
};

export const CartAction = {
	ADD_TO_CART: 'ADD_TO_CART',
	REMOVE_FROM_CART: 'REMOVE_FROM_CART',
	UPDATE_BUYER_IDENTITY: 'UPDATE_BUYER_IDENTITY',
	UPDATE_CART: 'UPDATE_CART',
	UPDATE_DISCOUNT: 'UPDATE_DISCOUNT',
};

export type CartActions = keyof typeof CartAction;
