
import { useEffect } from "react"
import { setupCartInterceptor } from "../utils/cart-interceptor"
import CartValidator from "./cart-validator"

interface DirectCheckoutProps {
  retrieveCart:()=>Promise<any>
  deleteLineItems:()=>Promise<any>
  pathname:string
  children: React.ReactNode
}

/**
 * Provider component that sets up cart interception for Greenmile variants
 * This should be included high in the application tree
 */
const DirectCheckoutProvider: React.FC<DirectCheckoutProps> = ({
  children,
  retrieveCart,
  deleteLineItems,pathname
}) => {
  useEffect(() => {
    // Set up cart interception when the component mounts
    setupCartInterceptor()
  }, [])

  // Include the cart validator and render children
  return (
    <>
      <CartValidator retrieveCartFunc={retrieveCart} deleteLineItems={deleteLineItems} pathname={pathname} />
      {children}
      </>
  )
}

export default DirectCheckoutProvider