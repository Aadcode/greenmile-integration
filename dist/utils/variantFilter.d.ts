/**
 * Product variant interface - simplified version of Medusa's types
 */
export interface ProductVariant {
    id?: string;
    title?: string;
    prices?: {
        amount?: number;
        currency_code?: string;
    }[];
    [key: string]: any;
}
/**
 * Product option interface - simplified version of Medusa's types
 */
export interface ProductOption {
    id?: string;
    title?: string;
    values?: {
        value?: string;
        [key: string]: any;
    }[];
    [key: string]: any;
}
/**
 * Product interface - simplified version of Medusa's types
 */
export interface Product {
    id?: string;
    title?: string;
    description?: string;
    variants?: ProductVariant[];
    options?: ProductOption[];
    [key: string]: any;
}
/**
 * Filter options for product variants
 */
export interface VariantFilterOptions {
    /**
     * Prefixes to exclude (case insensitive)
     */
    excludePrefixes?: string[];
    /**
     * Custom filter function
     */
    customFilter?: (variant: ProductVariant) => boolean;
}
/**
 * Filters variants from a Medusa product based on provided options
 * @param product - The Medusa product with variants to filter
 * @param options - Filter options
 * @returns A new product object with filtered variants
 */
export declare function filterVariants(product: Product, options?: VariantFilterOptions): Product;
