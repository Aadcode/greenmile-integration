# GreenMile Integration for Medusa

A comprehensive package for integrating GreenMile functionality into Medusa storefronts. This package combines multiple GreenMile features into a single, easy-to-use npm module.

## Features

- **GreenMile Widget**: Display GreenMile product offers directly in your storefront
- **Variant Filtering**: Filter out GreenMile variants from regular product displays
- **Direct Checkout**: Enable direct checkout flow for GreenMile products

## Installation

```bash
npm install greenmile-integration
# or
yarn add greenmile-integration
```

## Usage

### GreenMile Widget

The GreenMile Widget displays product offers for returned items at discounted prices.

```jsx
import { GreenMileWidget } from 'greenmile-integration';

function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.title}</h1>
      <GreenMileWidget
        productId={product.id}
        productTitle={product.title}
        productVendor={product.vendor}
        productPrice={product.variants[0].prices[0].amount}
        discountedPrice={product.variants[0].prices[0].amount * 0.85}
        variantId={product.variants[0].id}
        currency="USD"
      />
    </div>
  );
}
```

### Variant Filtering

Filter out GreenMile variants from standard product displays:

```jsx
import { filterVariants } from 'greenmile-integration';

function ProductList({ products }) {
  // Filter out all variants that start with "greenmile"
  const filteredProducts = products.map(product => 
    filterVariants(product, { excludePrefixes: ['greenmile'] })
  );
  
  return (
    <ul>
      {filteredProducts.map(product => (
        <li key={product.id}>{product.title}</li>
      ))}
    </ul>
  );
}
```

### Direct Checkout

Enable direct checkout for GreenMile products:

```jsx
import { directCheckout } from 'greenmile-integration';

function BuyButton({ variantId }) {
  const handleClick = async () => {
    try {
      await directCheckout(variantId, 1, 'US');
      // The user will be redirected to checkout automatically
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };
  
  return <button onClick={handleClick}>Buy Now</button>;
}
```

### Check for GreenMile Products in Cart

```jsx
import { hasGreenmileInCart, removeGreenmileProducts } from 'greenmile-integration';
import { retrieveCart, deleteLineItem } from '@lib/data/cart';

async function cleanCart() {
  const hasGreenMile = await hasGreenmileInCart(retrieveCart);
  
  if (hasGreenMile) {
    const { success, isEmpty } = await removeGreenmileProducts(retrieveCart, deleteLineItem);
    return { success, isEmpty };
  }
  
  return { success: true, isEmpty: false };
}
```

## API Reference

### Components

#### GreenMileWidget

Displays a widget for GreenMile product offers.

| Prop | Type | Description |
|------|------|-------------|
| productId | string | The ID of the product |
| productTitle | string | The title of the product |
| productVendor | string | (Optional) The vendor of the product |
| productPrice | number | The original price of the product |
| discountedPrice | number | The discounted price to display |
| variantId | string | The ID of the product variant |
| currency | string | (Optional) Currency code, defaults to 'USD' |
| backendUrl | string | (Optional) base backendUrl to fecth variants Info |
| storeUrl | string | (Optional) Store URL for the checkout |
| onCheckout | function | (Optional) Custom checkout handler |

#### ProductModal

A modal that displays more details about a GreenMile product.

### Utilities

#### directCheckout(variantId, quantity, countryCode, sdk?)

Creates a cart with the specified variant and redirects to checkout.

| Parameter | Type | Description |
|-----------|------|-------------|
| variantId | string | The ID of the variant to add to cart |
| quantity | number | (Optional) Quantity to add, defaults to 1 |
| countryCode | string | Country code for region selection (e.g., 'US') |
| sdk | object | (Optional) Medusa SDK instance |

#### filterVariants(product, options)

Filters variants from a product based on provided options.

| Parameter | Type | Description |
|-----------|------|-------------|
| product | StoreProduct | The product object to filter |
| options | VariantFilterOptions | Filter options |

#### removeGreenmileProducts(retrieveCartFn, deleteLineItemFn)

Removes all GreenMile products from the current cart.

| Parameter | Type | Description |
|-----------|------|-------------|
| retrieveCartFn | function | Function to retrieve the current cart |
| deleteLineItemFn | function | Function to delete a line item from cart |

#### hasGreenmileInCart(retrieveCartFn)

Checks if there are any GreenMile variants in the cart.

| Parameter | Type | Description |
|-----------|------|-------------|
| retrieveCartFn | function | Function to retrieve the current cart |

## License

MIT
