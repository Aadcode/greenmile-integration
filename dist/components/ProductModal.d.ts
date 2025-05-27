import React from 'react';
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
declare const ProductModal: React.FC<ProductModalProps>;
export default ProductModal;
