// src/components/ProductModal.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/ProductModal.css';

interface ProductModalProps {
  productInfo: any;
  productTitle: string;
  productVendor?: string;
  currency?: string;
  onClose: () => void;
  onCheckout: () => void;
  apiClient?: any;
}

const ProductModal: React.FC<ProductModalProps> = ({
  productInfo,
  productTitle,
  productVendor = '',
  currency = 'USD',
  onClose,
  onCheckout,
  apiClient
}) => {
  const [selectedQuality, setSelectedQuality] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]); const [currentRemarks, setCurrentRemarks] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set up portal root and clean up
  useEffect(() => {
    if (typeof window === 'undefined') return; // Check for browser environment

    let root = document.getElementById('greenmile-modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'greenmile-modal-root';
      document.body.appendChild(root);
    }
    setPortalRoot(root);

    return () => {
      if (root && root.childElementCount === 0) {
        document.body.removeChild(root);
      }
    };
  }, []);

  // Initialize quality selection
  useEffect(() => {
    if (productInfo) {
      if (productInfo.urgency_price && Object.keys(productInfo.urgency_price).length > 0) {
        const qualities = Object.keys(productInfo.urgency_price);
        setSelectedQuality(qualities[0]);
      } else {
        // Default to 'like new' if no urgency_price available
        setSelectedQuality('like new');

        // Set current price from the API's discounted_price or calculate discount
        if (productInfo.discounted_price) {
          setCurrentPrice(typeof productInfo.discounted_price === 'string' ?
            productInfo.discounted_price :
            formatPrice(productInfo.discounted_price));
        } else if (productInfo.original_price) {
          // Fallback to 15% off original price if no discount specified
          const discountedPrice = typeof productInfo.original_price === 'number' ?
            productInfo.original_price * 0.85 :
            parseFloat(productInfo.original_price) * 0.85;
          setCurrentPrice(formatPrice(discountedPrice));
        }
      }
    }
  }, [productInfo]);

  // Update info when quality changes
  useEffect(() => {
    if (selectedQuality && productInfo) {
      // Price handling
      let price;
      if (productInfo.urgency_price && productInfo.urgency_price[selectedQuality]) {
        price = productInfo.urgency_price[selectedQuality];
      } else if (productInfo.discounted_price) {
        price = productInfo.discounted_price;
      } else if (productInfo.original_price) {
        // Default to 15% discount if no specific discount is provided
        price = typeof productInfo.original_price === 'number' ?
          productInfo.original_price * 0.85 :
          parseFloat(productInfo.original_price) * 0.85;
      }

      // Handle both string format "$199.98" and numeric format
      if (typeof price === 'string' && price.startsWith('$')) {
        setCurrentPrice(price);
      } else if (price !== undefined) {
        setCurrentPrice(formatPrice(price));
      }

      // Remarks handling
      setCurrentRemarks(
        productInfo.inspection?.[selectedQuality] ||
        'This item was previously purchased and returned in perfect condition. It has been thoroughly inspected and certified by our quality team.'
      );

      // Image handling - handle empty array or undefined
      const qualityImages = productInfo.images?.[selectedQuality] || [];

      // If no images, create a placeholder
      if (!qualityImages.length) {
        // Use a placeholder image url
        setImages(['https://placehold.co/300x300?text=No+Image']);
      } else {
        setImages(qualityImages);
      }

      setCurrentImageIndex(0);
    }
  }, [selectedQuality, productInfo]);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol'
    }).format(numPrice);
  };

  // Event handlers
  const handleQualitySelect = (quality: string) => {
    setSelectedQuality(quality);
    setShowDropdown(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => Math.max(0, prev - 1));
  };
  const handleNextImage = () => {
    setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1));
  };

  // Handle checkout with loading
  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await onCheckout();
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      // Keep loading state active since we're redirecting
      // setIsLoading(false);
    }
  };

  // Close modal on Escape
  useEffect(() => {
    if (typeof window === 'undefined') return; // Check for browser environment

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <div className="gm-modal-overlay" onClick={onClose}>
      <div className="gm-modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="gm-modal-header">
          <h3 className="gm-modal-title">Like-New Return Available</h3>
          <button className="gm-close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Image Slider */}
        <div className="gm-product-slider">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]}
              alt={`${productTitle} - image ${currentImageIndex + 1}`}
              className="gm-product-image"
            />
          ) : (
            <div className="gm-no-image">No image available</div>
          )}

          {images.length > 1 && (
            <>
              <button
                className="gm-slider-arrow gm-slider-prev"
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                className="gm-slider-arrow gm-slider-next"
                onClick={handleNextImage}
                disabled={currentImageIndex === images.length - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="gm-product-details">
          <div className="gm-product-brand">
            {productVendor && <h4 className="gm-vendor">{productVendor.toUpperCase()}</h4>}
            <h2 className="gm-product-title">{productTitle}</h2>
          </div>

          {/* Price Information */}
          <div className="gm-price-section">
            <div className="gm-price-row">
              <div className="gm-price-label">Original Price</div>
              <div className="gm-price-value">{productInfo?.price || formatPrice(productInfo?.original_price || 0)}</div>
            </div>
            <div className="gm-price-row">
              <div className="gm-restock-label">Restock Price</div>
              <div className="gm-restock-price">{productInfo?.discounted_price || currentPrice}</div>
            </div>
          </div>

          {/* Item Description */}
          <div className="gm-item-description">
            <h5 className="gm-description-title">Item Description</h5>

            <div className="gm-description-content">
              <div className="gm-quality-indicator">
                <span className="gm-quality-dot"></span>
                <span className="gm-quality-label">{selectedQuality?.toUpperCase() || 'LIKE NEW'}</span>
              </div>
              <div className="gm-remarks-title">Tags and packaging intact.</div>

              <p className="gm-remarks-text">
                {currentRemarks || 'This item was previously purchased and returned in perfect condition. It has been thoroughly inspected and certified by our quality team, allowing us to offer it at a reduced price.'}
              </p>
            </div>
          </div>          {/* CTA Button */}
          <div className="gm-cta-container">
            <button
              className="gm-cta-button"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="gm-spinner"></div>
                  CheckingOut...
                </>
              ) : (
                `GET THIS DEAL · ${productInfo?.discounted_price || currentPrice}`
              )}
            </button>
            <div className="gm-final-sale">Final sale, no returns.</div>
          </div>
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default ProductModal;
