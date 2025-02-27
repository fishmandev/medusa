import { MedusaError, Validator } from "medusa-core-utils"
import { defaultRelations, defaultFields } from "./"

/**
 * @oas [post] /order/{id}/claims
 * operationId: "PostOrdersOrderClaims"
 * summary: "Create a Claim"
 * description: "Creates a Claim."
 * parameters:
 *   - (path) id=* {string} The id of the Order.
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         properties:
 *           type:
 *             description: "The type of the Claim. This will determine how the Claim is treated: `replace` Claims will result in a Fulfillment with new items being created, while a `refund` Claim will refund the amount paid for the claimed items."
 *             type: string
 *             enum:
 *               - replace
 *               - refund
 *           claim_items:
 *             description: The Claim Items that the Claim will consist of.
 *             type: array
 *             items:
 *               properties:
 *                 item_id:
 *                   description: The id of the Line Item that will be claimed.
 *                   type: string
 *                 quantity:
 *                   description: The number of items that will be returned
 *                   type: integer
 *                 note:
 *                   description: Short text describing the Claim Item in further detail.
 *                   type: string
 *                 reason:
 *                   description: The reason for the Claim
 *                   type: string
 *                   enum:
 *                     - missing_item
 *                     - wrong_item
 *                     - production_failure
 *                     - other
 *                 tags:
 *                   description: A list o tags to add to the Claim Item
 *                   type: array
 *                   items:
 *                     type: string
 *                 images:
 *                   description: A list of image URL's that will be associated with the Claim
 *                   items:
 *                     type: string
 *           return_shipping:
 *             description: Optional details for the Return Shipping Method, if the items are to be sent back.
 *             type: object
 *             properties:
 *               option_id:
 *                 type: string
 *                 description: The id of the Shipping Option to create the Shipping Method from.
 *               price:
 *                 type: integer
 *                 description: The price to charge for the Shipping Method.
 *           additional_items:
 *             description: The new items to send to the Customer when the Claim type is Replace.
 *             type: array
 *             items:
 *               properties:
 *                 variant_id:
 *                   description: The id of the Product Variant to ship.
 *                   type: string
 *                 quantity:
 *                   description: The quantity of the Product Variant to ship.
 *                   type: integer
 *           shipping_methods:
 *             description: The Shipping Methods to send the additional Line Items with.
 *             type: array
 *             items:
 *                properties:
 *                  id:
 *                    description: The id of an existing Shipping Method
 *                    type: string
 *                  option_id:
 *                    description: The id of the Shipping Option to create a Shipping Method from
 *                    type: string
 *                  price:
 *                    description: The price to charge for the Shipping Method
 *                    type: integer
 *           shipping_address:
 *             type: object
 *             description: "An optional shipping address to send the claim to. Defaults to the parent order's shipping address"
 *           refund_amount:
 *             description: The amount to refund the Customer when the Claim type is `refund`.
 *             type: integer
 *           no_notification:
 *             description: If set to true no notification will be send related to this Claim.
 *             type: boolean
 *           metadata:
 *             description: An optional set of key-value pairs to hold additional information.
 *             type: object
 * tags:
 *   - Order
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           properties:
 *             order:
 *               $ref: "#/components/schemas/order"
 */
export default async (req, res) => {
  const { id } = req.params
  const schema = Validator.object().keys({
    type: Validator.string()
      .valid("replace", "refund")
      .required(),
    claim_items: Validator.array()
      .items({
        item_id: Validator.string().required(),
        quantity: Validator.number().required(),
        note: Validator.string().optional(),
        reason: Validator.string().valid(
          "missing_item",
          "wrong_item",
          "production_failure",
          "other"
        ),
        tags: Validator.array().items(Validator.string()),
        images: Validator.array().items(Validator.string()),
      })
      .required(),
    return_shipping: Validator.object()
      .keys({
        option_id: Validator.string().optional(),
        price: Validator.number()
          .integer()
          .optional(),
      })
      .optional(),
    additional_items: Validator.array()
      .items({
        variant_id: Validator.string().required(),
        quantity: Validator.number().required(),
      })
      .optional(),
    shipping_methods: Validator.array()
      .items({
        id: Validator.string().optional(),
        option_id: Validator.string().optional(),
        price: Validator.number()
          .integer()
          .optional(),
      })
      .optional(),
    refund_amount: Validator.number()
      .integer()
      .optional(),
    shipping_address: Validator.object().optional(),
    no_notification: Validator.boolean().optional(),
    metadata: Validator.object().optional(),
  })

  const { value, error } = schema.validate(req.body)
  if (error) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, error.details)
  }
  const idempotencyKeyService = req.scope.resolve("idempotencyKeyService")

  const headerKey = req.get("Idempotency-Key") || ""

  let idempotencyKey
  try {
    idempotencyKey = await idempotencyKeyService.initializeRequest(
      headerKey,
      req.method,
      req.params,
      req.path
    )
  } catch (error) {
    res.status(409).send("Failed to create idempotency key")
    return
  }

  res.setHeader("Access-Control-Expose-Headers", "Idempotency-Key")
  res.setHeader("Idempotency-Key", idempotencyKey.idempotency_key)

  try {
    const orderService = req.scope.resolve("orderService")
    const claimService = req.scope.resolve("claimService")
    const returnService = req.scope.resolve("returnService")

    let inProgress = true
    let err = false

    while (inProgress) {
      switch (idempotencyKey.recovery_point) {
        case "started": {
          const { key, error } = await idempotencyKeyService.workStage(
            idempotencyKey.idempotency_key,
            async (manager) => {
              const order = await orderService
                .withTransaction(manager)
                .retrieve(id, {
                  relations: ["items", "discounts", "discounts.rule"],
                })

              await claimService.withTransaction(manager).create({
                idempotency_key: idempotencyKey.idempotency_key,
                order,
                type: value.type,
                shipping_address: value.shipping_address,
                claim_items: value.claim_items,
                return_shipping: value.return_shipping,
                additional_items: value.additional_items,
                shipping_methods: value.shipping_methods,
                no_notification: value.no_notification,
                metadata: value.metadata,
              })

              return {
                recovery_point: "claim_created",
              }
            }
          )

          if (error) {
            inProgress = false
            err = error
          } else {
            idempotencyKey = key
          }
          break
        }

        case "claim_created": {
          const { key, error } = await idempotencyKeyService.workStage(
            idempotencyKey.idempotency_key,
            async (manager) => {
              let claim = await claimService.withTransaction(manager).list({
                idempotency_key: idempotencyKey.idempotency_key,
              })

              if (!claim.length) {
                throw new MedusaError(
                  MedusaError.Types.INVALID_DATA,
                  `Claim not found`
                )
              }

              claim = claim[0]

              if (claim.type === "refund") {
                await claimService
                  .withTransaction(manager)
                  .processRefund(claim.id)
              }

              return {
                recovery_point: "refund_handled",
              }
            }
          )

          if (error) {
            inProgress = false
            err = error
          } else {
            idempotencyKey = key
          }
          break
        }

        case "refund_handled": {
          const { key, error } = await idempotencyKeyService.workStage(
            idempotencyKey.idempotency_key,
            async (manager) => {
              let order = await orderService
                .withTransaction(manager)
                .retrieve(id, {
                  relations: ["items", "discounts"],
                })

              let claim = await claimService.withTransaction(manager).list(
                {
                  idempotency_key: idempotencyKey.idempotency_key,
                },
                {
                  relations: ["return_order"],
                }
              )

              if (!claim.length) {
                throw new MedusaError(
                  MedusaError.Types.INVALID_DATA,
                  `Claim not found`
                )
              }

              claim = claim[0]

              if (claim.return_order) {
                await returnService
                  .withTransaction(manager)
                  .fulfill(claim.return_order.id)
              }

              order = await orderService.withTransaction(manager).retrieve(id, {
                select: defaultFields,
                relations: defaultRelations,
              })

              return {
                response_code: 200,
                response_body: { order },
              }
            }
          )

          if (error) {
            inProgress = false
            err = error
          } else {
            idempotencyKey = key
          }
          break
        }

        case "finished": {
          inProgress = false
          break
        }

        default:
          idempotencyKey = await idempotencyKeyService.update(
            idempotencyKey.idempotency_key,
            {
              recovery_point: "finished",
              response_code: 500,
              response_body: { message: "Unknown recovery point" },
            }
          )
          break
      }
    }

    if (err) {
      throw err
    }

    res.status(idempotencyKey.response_code).json(idempotencyKey.response_body)
  } catch (error) {
    throw error
  }
}
