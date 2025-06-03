// src/components/GreenMileWidget.tsx
import React, { useEffect, useState } from 'react';
import ProductModal from './ProductModal';
import '../styles/GreenMileWidget.css';

interface GreenMileWidgetProps {
  // Required props
  productId: string;
  productTitle: string;
  productVendor?: string;
  productPrice: number;
  discountedPrice: number;
  variantId: string;
  handleCheckout: (variantId: string, quantity: number, countryCode: string) => Promise<void>;

  // Optional props
  currency?: string;
  backendUrl?: string;
  storeUrl?: string;
  onCheckout?: (variantId: string, discountCode: string) => void;
  apiClient?: any;

}

const GreenMileWidget: React.FC<GreenMileWidgetProps> = ({
  productId,
  productTitle,
  productVendor = '',
  productPrice,
  discountedPrice,
  variantId,
  handleCheckout,
  currency = 'USD',
  backendUrl,
  storeUrl,
  apiClient,
  onCheckout,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);

        // Get location using IP info
        const locationResponse = await fetch('https://ipinfo.io/json?token=0938f3aebe35e7');
        const locationData = await locationResponse.json();
        const [latitude, longitude] = locationData.loc.split(',');

        // Call GreenMile API
        const response = await fetch(`${backendUrl}/medusa/product-info/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420',
          },
          body: JSON.stringify({
            shop: storeUrl,
            product_price: productPrice,
            product_id: productId,
            variant_id: variantId,
            variant: "Default",
            location: {
              latitude,
              longitude
            }
          })
        });

        let data = await response.json();
        setProductInfo(data);
      } catch (error) {
        console.error('Error fetching product info:', error);
        setError('Unable to load product information');
      } finally {
        setLoading(false);
      }
    };

    fetchProductInfo();
  }, [productId, variantId, productPrice, backendUrl, storeUrl]);

  const processCheckout = async () => {
    try {
      if (productInfo?.returned_variant) {
        const countryCode = typeof window !== 'undefined' && window.location.pathname.split('/')[1] || 'dk';


        // Use the provided handleCheckout prop
        await handleCheckout(productInfo.returned_variant, 1, countryCode);

      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  if (loading) {
    return <div className="gm-loading">Loading product information...</div>;
  }

  // Don't render the widget if there's an error, no product info
  if (error || !productInfo || productInfo.error) {
    console.error("Error or no product info:", error);
    return null;
  }

  // Parse price values from API response
  const apiOriginalPrice = productInfo.price;
  const apiDiscountedPrice = productInfo.discounted_price;

  const formatPrice = (price: number | string | undefined) => {
    if (price == null) return '';

    // If price is already a formatted string (like "$15.00"), return it directly
    if (typeof price === 'string' && price.startsWith('$')) {
      return price;
    }

    // Otherwise format it
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '';

    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol'
    }).format(numPrice);
  };

  return (
    <div className="gm-widget">
      <div className="deal-card">
        {/* Header with Like-New Return Available and GreenMile logo */}
        <div className="gm-header">
          <div className="green-text">Like-New Return Available</div>
          <div className="gm-powered-by">
            Powered by GreenMile
            <img
              src="https://i.ibb.co/Rkr0W5dx/Green-Mile-Symbol.png"
              alt="GreenMile"
              width={16}
              height={16}
              className="gm-logo"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="gm-content">
          {/* Deal button */}
          <button
            className="gm-buy-button"
            onClick={() => setShowModal(true)}
          >
            <span className="gm-button-text">GET THIS DEAL</span>
            <div className="gm-price-container">
              <span className="gm-original-price">
                {apiOriginalPrice || formatPrice(productPrice)}
              </span>
              <span className="gm-discount-price">
                {apiDiscountedPrice || formatPrice(discountedPrice)}
              </span>
            </div>
          </button>

          {/* Features */}
          <div className="gm-features">
            <div className="gm-feature-item">
              <span className="check-icon">Like-New Condition</span>
            </div>
            <div className="gm-feature-item">
              <span className="check-icon">Quality Checked</span>
            </div>
            <div className="gm-feature-item">
              <span className="check-icon">Fast Shipping</span>
            </div>
          </div>
        </div>
      </div>      {/* Product Modal */}      {showModal && (
        <ProductModal
          productInfo={productInfo}
          productTitle={productTitle}
          productVendor={productVendor}
          currency={currency}
          onClose={() => setShowModal(false)}
          onCheckout={processCheckout}
          apiClient={apiClient}
        />
      )}
    </div>
  );
};

export default GreenMileWidget;
