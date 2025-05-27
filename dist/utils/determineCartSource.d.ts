interface determineCartSourceProps {
    retrieveCartFunc: () => Promise<any>;
}
/**
 * Determines the source of the cart items (greenmile or medusa)
 * This helps with routing to the appropriate checkout flow
 * @returns "greenmile" if the cart contains GreenMile items, "medusa" otherwise
 */
export declare function determineCartSource({ retrieveCartFunc: retrieveCart }: determineCartSourceProps): Promise<string>;
export {};
