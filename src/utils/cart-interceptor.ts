import { isGreenmileVariant } from "../utils/directCheckout"

/**
 * Cart validator to prevent adding Greenmile variants to cart
 * @param variantId - The ID of the variant to check
 * @returns Promise that resolves to true if the variant can be added to cart, false otherwise
 */
export async function validateVariantForCart(
    variantId: string
): Promise<boolean> {
    try {
        // Fetch variant data to determine if it's a Greenmile variant
        const response = await fetch(`/store/variants/${variantId}`)
        if (!response.ok) {
            // If we can't fetch the variant, allow adding to cart as a fallback
            console.error("Failed to fetch variant for cart validation:", response.status)
            return true
        }

        const data = await response.json()
        const variant = data.variant as any
        // If it's a Greenmile variant, prevent adding to cart
        if (isGreenmileVariant(variant)) {
            console.warn("Prevented adding Greenmile variant to cart:", variant.title)
            return false
        }

        // Allow other variants
        return true
    } catch (error) {
        console.error("Error in cart validation:", error)
        // In case of error, allow adding to cart as a fallback
        return true
    }
}

/**
 * This function decorates the cart's addItem method to intercept
 * and block Greenmile variants from being added to cart
 */
export function setupCartInterceptor() {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
        return
    }

    // Listen for cart add events (using a custom approach since Medusa doesn't provide direct hooks)
    document.addEventListener('click', async (event) => {
        const target = event.target as HTMLElement

        // Check if this is an Add to Cart button click
        if (
            (target.tagName === 'BUTTON' && target.innerText.includes('Add to cart')) ||
            target.closest('[data-testid="add-product-button"]') ||
            target.closest('[data-testid="mobile-cart-button"]')
        ) {
            // Find product page variant selection
            const variantInfo = document.querySelector('[data-variant-id]')
            if (variantInfo) {
                const variantId = variantInfo.getAttribute('data-variant-id')

                if (variantId) {
                    // If it's a Greenmile variant, prevent default cart flow
                    const isValid = await validateVariantForCart(variantId)

                    if (!isValid) {
                        event.preventDefault()
                        event.stopPropagation()

                        // Show message to user
                        alert("This is a GreenMile product. Please use the Buy Now button for direct checkout.")

                        return false
                    }
                }
            }
        }
    }, true)
}