import BaseResource from "./base"
import {
  StoreReturnReasonsListRes,
  StoreReturnReasonsRes,
} from "@medusajs/medusa"
import { Response } from "../typings"

class ReturnReasonsResource extends BaseResource {
  /**
   * @description Retrieves a single Return Reason
   * @param {string} id is required
   * @return {Response<StoreReturnReasonsRes>}
   */
  retrieve(id: string): Response<StoreReturnReasonsRes> {
    const path = `/store/return-reasons/${id}`
    return this.client.request("GET", path)
  }

  /**
   * Lists return reasons defined in Medusa Admin
   * @return {Response<StoreReturnReasonsListRes>}
   */
  list(): Response<StoreReturnReasonsListRes> {
    const path = `/store/return-reasons`
    return this.client.request("GET", path)
  }
}

export default ReturnReasonsResource
