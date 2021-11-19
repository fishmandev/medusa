import {
  StoreGetShippingOptionsParams,
  StoreShippingOptionsListRes,
} from "@medusajs/medusa"
import { Response } from "../typings"
import BaseResource from "./base"

class ShippingOptionsResource extends BaseResource {
  /**
   * @description Lists shiping options available for a cart
   * @param {string} cart_id
   * @return {Response<StoreShippingOptionsListRes>}
   */
  listCartOptions(cart_id: string): Response<StoreShippingOptionsListRes> {
    const path = `/store/shipping-options/${cart_id}`
    return this.client.request("GET", path)
  }

  /**
   * @description Lists shiping options available
   * @param {StoreGetShippingOptionsParamsObject} query
   * @return {Response<StoreShippingOptionsListRes>}
   */
  list(
    query?: StoreGetShippingOptionsParams
  ): Response<StoreShippingOptionsListRes> {
    let path = `/store/shipping-options`

    const queryString = Object.entries(query || {}).map(([key, value]) => {
      let val = value
      if (Array.isArray(value)) {
        val = value.join(",")
      }

      return `${key}=${val}`
    })

    path = `/store/shipping-options?${queryString.join("&")}`

    return this.client.request("GET", path)
  }
}

export default ShippingOptionsResource
