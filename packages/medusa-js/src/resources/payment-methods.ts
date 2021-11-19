import { StoreCustomersListPaymentMethodsRes } from '@medusajs/medusa'
import { Response } from "../typings"
import BaseResource from "./base"

class PaymentMethodsResource extends BaseResource {
  /**
   * Lists customer payment methods
   * @param {string} id id of cart
   * @return {StoreCustomersListPaymentMethodsRes}
   */
  list(id: string): Response<StoreCustomersListPaymentMethodsRes> {
    const path = `/store/carts/${id}/payment-methods`
    return this.client.request("GET", path)
  }
}

export default PaymentMethodsResource
