import { ProductVariant } from './variantFilter';
/**
 * Interface for cart items used in the cart operations
 */
export interface CartItem {
    id: string;
    title: string;
    variant?: {
        title?: string;
        [key: string]: any;
    };
    [key: string]: any;
}
/**
 * Checks if a variant name contains "greenmile"
 *
 * @param variant - The product variant to check
 * @returns true if the variant is a greenmile variant
 */
export declare function isGreenmileVariant(variant: ProductVariant | null): boolean;
/**
 * Creates a new cart with the specified greenmile variant and redirects to checkout
 * This bypasses the normal cart flow
 *
 * @param variantId - The ID of the greenmile variant
 * @param quantity - The quantity to add
 * @param countryCode - The country code for the region
 * @param sdk - Optional Medusa JS SDK instance (will use global sdk if available in browser environment)
 */
export declare function directCheckout(variantId: string, quantity: number | undefined, countryCode: string, sdk?: any): Promise<void>;
/**
 * Removes all Greenmile products from the current cart.
 * @param retrieveCartFn - Function to retrieve the current cart
 * @param deleteLineItemFn - Function to delete a line item from the cart
 * @returns {Promise<{ success: boolean, isEmpty: boolean }>}
 */
export declare const removeGreenmileProducts: (retrieveCartFn: () => Promise<any>, deleteLineItemFn: (lineItemId: string) => Promise<any>) => Promise<{
    success: boolean;
    isEmpty: boolean;
}>;
/**
 * Checks if there are any Greenmile variants in the cart.
 * @param retrieveCartFn - Function to retrieve the current cart
 * @returns {Promise<boolean>} - True if cart contains Greenmile variants, false otherwise.
 */
export declare const hasGreenmileInCart: (retrieveCartFn: () => Promise<any>) => Promise<boolean>;
