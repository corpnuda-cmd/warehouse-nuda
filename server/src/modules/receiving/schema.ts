import { z } from 'zod'

// Goods Receipt Schema
export const createGoodsReceiptSchema = z.object({
  poId: z.number().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.number(),
    qtyReceived: z.number().positive(),
  })).min(1),
})

export const updateGoodsReceiptSchema = z.object({
  qcStatus: z.enum(['pending', 'qc_passed', 'qc_failed', 'qc_partial']).optional(),
  notes: z.string().optional(),
})

export const qcGoodsReceiptSchema = z.object({
  items: z.array(z.object({
    itemId: z.number(),
    qtyAccepted: z.number().min(0),
    qtyRejected: z.number().min(0),
    notes: z.string().optional(),
  })).min(1),
})

export type CreateGoodsReceipt = z.infer<typeof createGoodsReceiptSchema>
export type UpdateGoodsReceipt = z.infer<typeof updateGoodsReceiptSchema>
export type QCGoodsReceipt = z.infer<typeof qcGoodsReceiptSchema>