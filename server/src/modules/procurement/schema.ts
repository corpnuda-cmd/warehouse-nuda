import { z } from 'zod'

// Purchase Request Schema
export const createPurchaseRequestSchema = z.object({
  warehouseId: z.number().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.number(),
    qty: z.number().positive(),
    notes: z.string().optional(),
  })).min(1),
})

export const updatePurchaseRequestSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'closed']).optional(),
  notes: z.string().optional(),
})

export const purchaseRequestIdSchema = z.object({
  id: z.coerce.number(),
})

export type CreatePurchaseRequest = z.infer<typeof createPurchaseRequestSchema>
export type UpdatePurchaseRequest = z.infer<typeof updatePurchaseRequestSchema>