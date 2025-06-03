import { useEffect, useState, Fragment } from "react"

import { removeGreenmileProducts } from "../utils"
import { isGreenmileVariant } from "../utils"
import { Dialog, Transition } from "@headlessui/react"
import { Text, Button } from "@medusajs/ui"


interface cartValidatorProps 
{
    retrieveCartFunc: ()=> Promise<any>
    deleteLineItems:()=> Promise<any>
    pathname :string
}

export default function CartValidator({retrieveCartFunc:retrieveCart,pathname,deleteLineItems}:cartValidatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [greenmileVariants, setGreenmileVariants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Check cart on mount
  useEffect(() => {
    // Don't show validator on checkout page
    if (pathname.includes('/checkout')) {
      return
    }

    const checkCart = async () => {
      try {
        const cart = await retrieveCart()
        if (!cart || !cart.items) return

        // Find any Greenmile variants in the cart
        const greenmileItems = cart.items
         //@ts-ignore
         .filter(item => isGreenmileVariant(item.variant))
         //@ts-ignore
          .map(item => item.variant)

        if (greenmileItems.length > 0) {
          setGreenmileVariants(greenmileItems)
          setIsOpen(true)
        }
      } catch (error) {
        console.error("Error checking cart for Greenmile variants:", error)
      }
    }

    checkCart()
  }, [pathname])

  // Close the dialog
  const closeDialog = () => {
    setIsOpen(false)
  }

  // Handle direct checkout
  const handleDirectCheckout = () => {
    // First close the dialog
    closeDialog()
    // Then redirect to checkout
    window.location.href = "/checkout?step=address"
  }

  // Handle removing Greenmile items
  const handleRemoveItems = async () => {
    setIsLoading(true)
    try {
      // First close the dialog
      closeDialog()
      // Then remove items
      await removeGreenmileProducts(retrieveCart,deleteLineItems)
      document.cookie = "_medusa_cart_id=;path=/;"


      window.location.reload()
    } catch (error) {
      console.error("Error removing Greenmile items:", error)
    }
    setIsLoading(false)
  }

  if (greenmileVariants.length === 0) {
    return null
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeDialog}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Greenmile Products Detected
                </Dialog.Title>
                <div className="mt-2">
                  <Text className="text-sm text-gray-500">
                    We noticed your cart contains Greenmile products which require special handling.
                  </Text>
                  <Text className="mt-2 text-sm text-gray-500">
                    You can either proceed directly to checkout with these items or remove them from your cart.
                  </Text>
                  <div className="mt-4 bg-gray-50 p-4 rounded">
                    <Text className="font-medium">Greenmile items in cart:</Text>
                    <ul className="list-disc pl-5 mt-2">
                      {greenmileVariants.map((variant) => (
                        <li key={variant.id} className="mt-1">
                          {variant.product?.title || "Product"} - {variant.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button 
                    variant="secondary"
                    onClick={handleRemoveItems}
                    disabled={isLoading}
                  >
                    {isLoading ? "Removing..." : "Remove Items"}
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleDirectCheckout}
                    disabled={isLoading}
                  >
                    Go to Checkout
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}