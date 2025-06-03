// src/utils/directCheckout.ts
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
export function isGreenmileVariant(variant: ProductVariant | null): boolean {
    if (!variant || !variant.title) return false
    // Case-insensitive check
    return variant.title.toLowerCase().includes("greenmile")
}

/**
 * Creates a new cart with the specified greenmile variant and redirects to checkout
 * This bypasses the normal cart flow
 * 
 * @param variantId - The ID of the greenmile variant
 * @param quantity - The quantity to add
 * @param countryCode - The country code for the region
 * @param sdk - Optional Medusa JS SDK instance (will use global sdk if available in browser environment)
 */
export async function directCheckout(
    variantId: string,
    quantity: number = 1,
    countryCode: string,
    sdk?: any

): Promise<void> {
    try {
        console.log(`Starting direct checkout with variant: ${variantId}, quantity: ${quantity}, country: ${countryCode}`);

        let medusaSdk: any;

        // Try to get SDK from parameter or global
        if (sdk) {
            medusaSdk = sdk;
        } else if (typeof window !== 'undefined' && (window as any).sdk) {
            medusaSdk = (window as any).sdk;
        } else {
            throw new Error('Medusa SDK not available');
        }

        // Get all regions first
        const regionsResponse = await medusaSdk.client.fetch(
            `/store/regions`,
            { method: "GET" }
        )

        console.log(`Retrieved regions:`, regionsResponse.regions);

        // Find the region that contains the given country code
        const region = regionsResponse.regions?.find((region: any) =>
            region.countries?.some((country: any) =>
                country.iso_2 === countryCode.toLowerCase()
            )
        )

        if (!region?.id) {
            console.error(`Region not found for country code: ${countryCode}`);
            throw new Error(`Region not found for country code: ${countryCode}`)
        }

        console.log(`Found region: ${region.id} for country: ${countryCode}`);

        // Create new cart with the found region ID
        let cartResponse;
        try {
            cartResponse = await medusaSdk.store.cart.create({
                region_id: region.id
            })
        } catch (err) {
            console.error("Error creating cart:", err);
            throw err;
        }

        const cartId = cartResponse.cart.id;
        console.log(`Created cart: ${cartId}`);

        // Add the greenmile variant to the cart
        let lineItemResponse;
        try {
            lineItemResponse = await medusaSdk.store.cart.createLineItem(cartId, {
                variant_id: variantId,
                quantity: quantity
            })

            console.log(`Added line item to cart:`, lineItemResponse);

            // Check the cart after adding item to ensure it has items with prices
            const updatedCart = await medusaSdk.store.cart.retrieve(cartId);
            console.log(`Cart after adding item:`, updatedCart);

            if (!updatedCart.cart.items || updatedCart.cart.items.length === 0) {
                console.error("No items found in cart after adding line item.");
                throw new Error("Failed to add item to cart");
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);
            throw error;
        }


        // Set cart cookie - this ensures the cart is accessible in checkout
        if (typeof document !== 'undefined') {
            document.cookie = `_greenmile_cart_id=${cartId}`
            // Get the base URL from the current window location
            const baseUrl = window.location.origin;

            // Redirect directly to checkout address step with correct URL structure
            const checkoutUrl = `${baseUrl}/${countryCode}/checkout?step=address`;
            console.log(`Redirecting to: ${checkoutUrl}`);
            window.location.href = checkoutUrl;
        } else {
            console.log(`Cart created with ID ${cartId}, but not in browser environment to set cookie and redirect`);
            return;
        }
    } catch (error) {
        console.error("Direct checkout failed:", error)
        throw error
    }
}

/**
 * Removes all Greenmile products from the current cart.
 * @param retrieveCartFn - Function to retrieve the current cart
 * @param deleteLineItemFn - Function to delete a line item from the cart
 * @returns {Promise<{ success: boolean, isEmpty: boolean }>}
 */
export const removeGreenmileProducts = async (
    retrieveCartFn: () => Promise<any>,
    deleteLineItemFn: (lineItemId: string) => Promise<any>
): Promise<{ success: boolean, isEmpty: boolean }> => {
    try {
        const cart = await retrieveCartFn();

        if (!cart || !cart.id || !Array.isArray(cart.items)) {
            console.error("Cart not found or invalid");
            return { success: false, isEmpty: true };
        }

        const isGreenmileProduct = (title: string): boolean => {
            const brand = title?.split("-")[0]?.trim().toLowerCase();
            return brand === "greenmile";
        };

        const items: CartItem[] = cart.items;
        const greenmileItems = items.filter(item => isGreenmileProduct(item.title));

        if (greenmileItems.length === 0) {
            return { success: true, isEmpty: items.length === 0 };
        }

        // Retry logic for deletion
        const retry = async (fn: () => Promise<void>, retries = 2): Promise<void> => {
            for (let i = 0; i <= retries; i++) {
                try {
                    await fn();
                    return;
                } catch (err) {
                    if (i === retries) throw err;
                    await new Promise(res => setTimeout(res, 300 * (i + 1)));
                }
            }
        };

        const deletePromises = greenmileItems.map(item =>
            retry(() => deleteLineItemFn(item.id))
        );

        await Promise.all(deletePromises);

        const updatedCart = await retrieveCartFn();
        const isEmpty = !updatedCart || updatedCart.items.length === 0;

        return { success: true, isEmpty };
    } catch (error: unknown) {
        console.error("Failed to remove Greenmile products:", error);
        return { success: false, isEmpty: false };
    }
};

/**
 * Checks if there are any Greenmile variants in the cart.
 * @param retrieveCartFn - Function to retrieve the current cart
 * @returns {Promise<boolean>} - True if cart contains Greenmile variants, false otherwise.
 */
export const hasGreenmileInCart = async (
    retrieveCartFn: () => Promise<any>
): Promise<boolean> => {
    try {
        const cart = await retrieveCartFn()
        if (!cart?.items?.length) return false

        // Check if any cart item is a Greenmile variant
        return cart.items.some((item: CartItem) =>
            item.variant ? isGreenmileVariant(item.variant as ProductVariant) : false
        )
    } catch (error) {
        console.error("Error checking for Greenmile variants in cart:", error)
        return false
    }
}
