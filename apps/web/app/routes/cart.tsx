import { captureException } from '@sentry/react-router';
import type { ServerFormState } from '@tanstack/react-form-remix';
import { createServerValidate, formOptions, initialFormState, ServerValidateError } from '@tanstack/react-form-remix';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data, redirect, useLoaderData } from 'react-router';
import { z } from 'zod';
import { CartContent } from '../components/cart-content';
import { CACHE_NONE, routeHeaders } from '../lib/cache';
import { CART_ACTIONS, CART_INTENT } from '../lib/cart-actions';
import { getSession } from '../lib/cart';
import { createCart } from '../lib/cart-model';
import { storefrontContext } from '../root';
import { getSeoMeta } from '../seo';

export async function loader({ context, request }: LoaderFunctionArgs) {
	const session = await getSession(request);
	const storefront = context.get(storefrontContext);
	const cart = createCart({ session, storefront });
	const view = await cart.read();

	const loaderData =
		view.type === 'success'
			? { cart: view.cart, linesDisplay: view.linesDisplay, type: view.type }
			: { type: view.type };

	return data(loaderData, {
		headers: {
			'Cache-Control': CACHE_NONE,
			'Set-Cookie': await session.commitSession(),
		},
	});
}

const checkoutScheme = z.object({
	checkoutUrl: z.url(),
});

const quantityScheme = z.object({
	quantity: z.number(),
	variantId: z.string().min(1),
});

const removeScheme = z.object({
	variantId: z.string().min(1),
});

// Define form options for each action type
const checkoutFormOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		checkoutUrl: '',
	},
	validators: {
		onSubmit: checkoutScheme,
	},
});

const quantityFormOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		quantity: 0,
		variantId: '',
	},
	validators: {
		onSubmit: quantityScheme,
	},
});

const removeFormOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		variantId: '',
	},
	validators: {
		onSubmit: removeScheme,
	},
});

const checkoutServerValidate = createServerValidate({
	...checkoutFormOpts,
	onServerValidate: ({ value }) => {
		if (!value.checkoutUrl) {
			return 'Checkout URL is required';
		}
	},
});

const quantityServerValidate = createServerValidate({
	...quantityFormOpts,
	onServerValidate: ({ value }) => {
		if (!value.variantId) {
			return 'Variant ID is required';
		}
		if (value.quantity < 0) {
			return 'Quantity must be positive';
		}
	},
});

const removeServerValidate = createServerValidate({
	...removeFormOpts,
	onServerValidate: ({ value }) => {
		if (!value.variantId) {
			return 'Variant ID is required';
		}
	},
});

interface BaseFormState
	extends ServerFormState<
		z.infer<typeof checkoutScheme> | z.infer<typeof quantityScheme> | z.infer<typeof removeScheme>,
		undefined
	> {}

interface ErrorFormState extends BaseFormState {
	meta: {
		errors: Array<{
			message: string;
		}>;
	};
}

type CartFormState = BaseFormState | ErrorFormState;

export type CartActionResult = ReturnType<
	typeof data<
		| {
				type: 'success';
		  }
		| {
				type: 'error';
				formState: CartFormState;
		  }
	>
>;

export async function action({
	context,
	request,
}: ActionFunctionArgs): Promise<CartActionResult | ReturnType<typeof redirect>> {
	const [formData, session] = await Promise.all([request.formData(), getSession(request)]);
	const intent = formData.get(CART_INTENT);
	const storefront = context.get(storefrontContext);
	const cart = createCart({ session, storefront });

	try {
		switch (intent) {
			case CART_ACTIONS.CHECKOUT_ACTION: {
				const { checkoutUrl } = await checkoutServerValidate(formData);
				return redirect(checkoutUrl);
			}

			case CART_ACTIONS.INCREMENT_ACTION:
			case CART_ACTIONS.DECREMENT_ACTION: {
				const { quantity, variantId } = await quantityServerValidate(formData);
				// We need to coerce quantity to a number as quantityServerValidate doesn't seem to be handling this for us
				await cart.setQuantity(variantId, Number(quantity));
				return data(
					{
						type: 'success',
					},
					{
						headers: {
							'Set-Cookie': await session.commitSession(),
						},
					},
				);
			}

			case CART_ACTIONS.REMOVE_ACTION: {
				const { variantId } = await removeServerValidate(formData);
				await cart.remove(variantId);
				return data(
					{
						type: 'success',
					},
					{
						headers: {
							'Set-Cookie': await session.commitSession(),
						},
					},
				);
			}

			default: {
				throw new Error('Unexpected action');
			}
		}
	} catch (err) {
		if (err instanceof ServerValidateError) {
			return data(
				{
					type: 'error',
					formState: err.formState,
				},
				{
					headers: {
						'Set-Cookie': await session.commitSession(),
					},
				},
			);
		}

		// For other errors, create a form state with the error message
		if (err instanceof Error) {
			const errorFormState: ErrorFormState = {
				...initialFormState,
				meta: {
					errors: [
						{
							message: err.message,
						},
					],
				},
			};
			return data(
				{
					type: 'error',
					formState: errorFormState,
				},
				{
					headers: {
						'Set-Cookie': await session.commitSession(),
					},
				},
			);
		}

		// Some other error occurred - let it bubble up to React Router's error boundary
		// We need to capture here because thrown Responses become ErrorResponse objects
		// which the error boundary skips (they're expected HTTP responses)
		captureException(err);
		throw new Response('Internal Server Error', {
			status: 500,
		});
	}
}

export const meta: MetaFunction = () => {
	return getSeoMeta({
		title: 'Cart',
	});
};

export const headers = routeHeaders;

export default function CartPage() {
	const cartResult = useLoaderData<typeof loader>();

	return (
		<div className="bg-white">
			<div className="mx-auto max-w-2xl px-4 pt-16 pb-24 lg:max-w-7xl">
				<CartContent result={cartResult} />
			</div>
		</div>
	);
}
