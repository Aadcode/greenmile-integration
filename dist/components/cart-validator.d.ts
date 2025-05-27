interface cartValidatorProps {
    retrieveCartFunc: () => Promise<any>;
    deleteLineItems: () => Promise<any>;
    pathname: string;
}
export default function CartValidator({ retrieveCartFunc: retrieveCart, pathname, deleteLineItems }: cartValidatorProps): import("react/jsx-runtime").JSX.Element | null;
export {};
