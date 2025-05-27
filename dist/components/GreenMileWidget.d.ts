import React from 'react';
import '../styles/GreenMileWidget.css';
interface GreenMileWidgetProps {
    productId: string;
    productTitle: string;
    productVendor?: string;
    productPrice: number;
    discountedPrice: number;
    variantId: string;
    handleCheckout: (variantId: string, quantity: number, countryCode: string) => Promise<void>;
    currency?: string;
    backendUrl?: string;
    storeUrl?: string;
    onCheckout?: (variantId: string, discountCode: string) => void;
    apiClient?: any;
}
declare const GreenMileWidget: React.FC<GreenMileWidgetProps>;
export default GreenMileWidget;
