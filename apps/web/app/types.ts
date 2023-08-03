import { type Storefront as HydrogenStorefront } from '@shopify/hydrogen';
import { type CountryCode, type CurrencyCode, type LanguageCode } from '@shopify/hydrogen/storefront-api-types';
import { type ZodIssue } from 'zod';

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
	serverIssues?: ZodIssue[];
};

export type Theme = 'ladies' | 'mens';

export type Maybe<T> = null | undefined | T;

export type StringWithAutocomplete<T> = T | (string & Record<never, never>);

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

export type Storefront = HydrogenStorefront<I18nLocale>;

export const CartAction = {
	ADD_TO_CART: 'ADD_TO_CART',
	REMOVE_FROM_CART: 'REMOVE_FROM_CART',
	UPDATE_CART: 'UPDATE_CART',
	UPDATE_DISCOUNT: 'UPDATE_DISCOUNT',
	UPDATE_BUYER_IDENTITY: 'UPDATE_BUYER_IDENTITY',
};

export type CartActions = keyof typeof CartAction;
