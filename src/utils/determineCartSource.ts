interface determineCartSourceProps {
    retrieveCartFunc: () => Promise<any>
}


/**
 * Determines the source of the cart items (greenmile or medusa)
 * This helps with routing to the appropriate checkout flow
 * @returns "greenmile" if the cart contains GreenMile items, "medusa" otherwise
 */
export async function determineCartSource({ retrieveCartFunc: retrieveCart }: determineCartSourceProps): Promise<string> {
    try {
        const cart = await retrieveCart();
        // If cart is empty or has no items, default to medusa
        if (!cart || !cart.items || cart.items.length === 0) {
            return "medusa";
        }
        // Check if the first item has a title starting with "greenmile"
        if (cart.items[0].title &&
            cart.items[0].title.split('-')[0].toLowerCase() === 'greenmile') {
            return "greenmile";
        }
        // Default to medusa for all other cases
        return "medusa";
    } catch (error) {
        console.error("Error determining cart source:", error);
        // Default to medusa on error
        return "medusa";
    }
}