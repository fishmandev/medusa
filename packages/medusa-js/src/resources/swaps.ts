import { Response } from "../typings"
import { StoreSwapsRes, StorePostSwapsReq } from "@medusajs/medusa"
import BaseResource from "./base"

class SwapsResource extends BaseResource {
  /**
   * @description Creates a swap from a cart
   * @param {StorePostSwapsReq} payload
   * @return {Response<StoreSwapsRes>}
   */
  create(payload: StorePostSwapsReq): Response<StoreSwapsRes> {
    const path = `/store/swaps`
    return this.client.request("POST", path, payload)
  }

  /**
   * @description Retrieves a swap by cart id
   * @param {string} cart_id id of cart
   * @return {Response<StoreSwapsRes>}
   */
  retrieveByCartId(cart_id: string): Response<StoreSwapsRes> {
    const path = `/store/swaps/${cart_id}`
    return this.client.request("GET", path)
  }
}

export default SwapsResource
