import { z } from 'zod'

// Purchase Order Schema
export const createPurchaseOrderSchema = z.object({
  prId: z.number().optional(),
  supplierId: z.number(),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.number(),
    qty: z.number().positive(),
    price: z.number().positive(),
  })).min(1),
})

export const updatePurchaseOrderSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'sent', 'received', 'closed']).optional(),
  notes: z.string().optional(),
})

export type CreatePurchaseOrder = z.infer<typeof createPurchaseOrderSchema>
export type UpdatePurchaseOrder = z.infer<typeof updatePurchaseOrderSchema>