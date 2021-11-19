import { AxiosResponse } from "axios"

export type Response<T = any> = Promise<
  T & {
    response: Omit<AxiosResponse<T>, "data">
  }
>
