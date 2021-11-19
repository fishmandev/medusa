import { StoreGiftCardsRes } from "@medusajs/medusa"
import { Response } from "../typings"
import BaseResource from "./base"

class GiftCardsResource extends BaseResource {
  /**
   * @description Retrieves a single GiftCard
   * @param {string} code code of the gift card
   * @return {Response<StoreGiftCardsRes>}
   */
  retrieve(code: string): Response<StoreGiftCardsRes> {
    const path = `/store/gift-cards/${code}`
    return this.client.request("GET", path)
  }
}

export default GiftCardsResource
