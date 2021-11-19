import {
  StoreGetVariantsParams,
  StoreVariantsListRes,
  StoreVariantsRes,
} from "@medusajs/medusa"
import { Response } from "../typings"
import BaseResource from "./base"

class ProductVariantsResource extends BaseResource {
  /**
   * @description Retrieves a single product variant
   * @param {string} id is required
   * @return {Response<StoreVariantsRes>}
   */
  retrieve(id: string): Response<StoreVariantsRes> {
    const path = `/store/variants/${id}`
    return this.client.request("GET", path)
  }

  /**
   * @description Retrieves a list of of Product Variants
   * @param {StoreVariantsListParamsObject} query
   * @return {Response<StoreVariantsListRes>}
   */
  list(query?: StoreGetVariantsParams): Response<StoreVariantsListRes> {
    const path = `/store/variants`

    const search = Object.entries(query || {}).map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}=${value.join(",")}`
      }

      return `${key}=${value}`
    })

    return this.client.request(
      "GET",
      `${path}${search.length > 0 && `?${search.join("&")}`}`
    )
  }
}

export default ProductVariantsResource
