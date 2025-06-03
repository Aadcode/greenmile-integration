// src/utils/variantFilter.ts

/**
 * Product variant interface - simplified version of Medusa's types 
 */
export interface ProductVariant {
    id?: string;
    title?: string;
    prices?: { amount?: number; currency_code?: string }[];
    [key: string]: any;
}

/**
 * Product option interface - simplified version of Medusa's types
 */
export interface ProductOption {
    id?: string;
    title?: string;
    values?: { value?: string;[key: string]: any }[];
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
 * Default options
 */
const defaultOptions: VariantFilterOptions = {
    excludePrefixes: [],
    customFilter: undefined,
};

/**
 * Checks if a string starts with any of the excluded prefixes
 * @param text - String to check
 * @param excludePrefixes - Array of prefixes to exclude
 * @returns true if the string starts with any excluded prefix
 */
function startsWithExcludedPrefix(text: string, excludePrefixes: string[]): boolean {
    if (!text || !excludePrefixes || excludePrefixes.length === 0) {
        return false;
    }

    const lowerText = text.toLowerCase();
    return excludePrefixes.some(prefix =>
        lowerText.startsWith(prefix.toLowerCase())
    );
}

/**
 * Filters product options based on excluded prefixes
 * @param options - Product options array
 * @param excludePrefixes - Prefixes to exclude
 * @returns Filtered options array
 */
function filterProductOptions(
    options: ProductOption[],
    excludePrefixes: string[]
): ProductOption[] {
    if (!options || options.length === 0 || !excludePrefixes || excludePrefixes.length === 0) {
        return options;
    }

    return options.map(option => {
        // Keep the option but filter its values
        return {
            ...option,
            values: option.values ? option.values.filter((value) =>
                !startsWithExcludedPrefix(value.value ?? '', excludePrefixes)
            ) :
                []
        };
    });
}

/**
 * Filters variants from a Medusa product based on provided options
 * @param product - The Medusa product with variants to filter
 * @param options - Filter options
 * @returns A new product object with filtered variants
 */
export function filterVariants(
    product: Product,
    options: VariantFilterOptions = defaultOptions
): Product {
    const mergedOptions = { ...defaultOptions, ...options };

    if (!product) {
        return product;
    }

    // Filter variants
    const filteredVariants = product.variants ?
        product.variants.filter((variant: ProductVariant) => {
            // Skip if no title
            if (!variant.title) return true;

            // Check prefix exclusions
            if (mergedOptions.excludePrefixes && mergedOptions.excludePrefixes.length > 0) {
                if (startsWithExcludedPrefix(variant.title, mergedOptions.excludePrefixes)) {
                    return false;
                }
            }

            // Apply custom filter if provided
            if (mergedOptions.customFilter) {
                return mergedOptions.customFilter(variant);
            }

            return true;
        }) : [];

    // Filter options
    const filteredOptions = product.options ?
        filterProductOptions(product.options, mergedOptions.excludePrefixes || []) :
        [];

    return {
        ...product,
        variants: filteredVariants,
        options: filteredOptions
    };
}
