/**
 * Cart validator to prevent adding Greenmile variants to cart
 * @param variantId - The ID of the variant to check
 * @returns Promise that resolves to true if the variant can be added to cart, false otherwise
 */
export declare function validateVariantForCart(variantId: string): Promise<boolean>;
/**
 * This function decorates the cart's addItem method to intercept
 * and block Greenmile variants from being added to cart
 */
export declare function setupCartInterceptor(): void;
