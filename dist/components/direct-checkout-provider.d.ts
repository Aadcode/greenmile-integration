/// <reference types="react" />
interface DirectCheckoutProps {
    retrieveCart: () => Promise<any>;
    deleteLineItems: () => Promise<any>;
    pathname: string;
    children: React.ReactNode;
}
/**
 * Provider component that sets up cart interception for Greenmile variants
 * This should be included high in the application tree
 */
declare const DirectCheckoutProvider: React.FC<DirectCheckoutProps>;
export default DirectCheckoutProvider;
