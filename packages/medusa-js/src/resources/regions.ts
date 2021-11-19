import { Response } from "../typings"
import { StoreRegionsListRes, StoreRegionsRes } from "@medusajs/medusa"
import BaseResource from "./base"

class RegionsResource extends BaseResource {
  /**
   * @description Retrieves a list of regions
   * @return {Response<StoreRegionsListRes>}
   */
  list(): Response<StoreRegionsListRes> {
    const path = `/store/regions`
    return this.client.request("GET", path)
  }

  /**
   * @description Retrieves a region
   * @param {string} id is required
   * @return {Response<StoreRegionsRes>}
   */
  retrieve(id: string): Response<StoreRegionsRes> {
    const path = `/store/regions/${id}`
    return this.client.request("GET", path)
  }
}

export default RegionsResource
