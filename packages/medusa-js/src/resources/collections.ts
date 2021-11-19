import {
  StoreCollectionsRes,
  StoreCollectionsListRes,
  StoreGetCollectionsParams,
} from "@medusajs/medusa"
import { Response } from "../typings"
import BaseResource from "./base"

class CollectionsResource extends BaseResource {
  /**
   * @description Retrieves a single collection
   * @param {string} id id of the collection
   * @return {Response<StoreCollectionsRes>}
   */
  retrieve(id: string): Response<StoreCollectionsRes> {
    const path = `/store/collections/${id}`
    return this.client.request("GET", path)
  }

  /**
   * @description Retrieves a list of collections
   * @param {string} query is optional. Can contain a limit and offset for the returned list
   * @return {Response<StoreCollectionsListRes>}
   */
  list(
    query?: StoreGetCollectionsParams
  ): Response<StoreCollectionsListRes> {
    let path = `/store/collections`

    if (query) {
      const queryString = Object.entries(query).map(([key, value]) => {
        return `${key}=${value}`
      })

      path = `/store/collections?${queryString.join("&")}`
    }

    return this.client.request("GET", path)
  }
}

export default CollectionsResource
