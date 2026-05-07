import { z } from 'zod'

// UoM Schema
export const createUoMSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  symbol: z.string().min(1, 'Symbol is required').max(20),
})

export const updateUoMSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  symbol: z.string().min(1).max(20).optional(),
})

export const uomIdSchema = z.object({
  id: z.coerce.number(),
})

// Warehouse Schema
export const createWarehouseSchema = z.object({
  code: z.string().min(1, 'Code is required').max(20),
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().optional(),
  type: z.enum(['main', 'distribution', 'store']).default('distribution'),
})

export const updateWarehouseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().optional(),
  type: z.enum(['main', 'distribution', 'store']).optional(),
  isActive: z.boolean().optional(),
})

export const warehouseIdSchema = z.object({
  id: z.coerce.number(),
})

// Rack Schema
export const createRackSchema = z.object({
  warehouseId: z.number().positive('Warehouse is required'),
  code: z.string().min(1, 'Code is required').max(20),
  name: z.string().min(1, 'Name is required').max(50),
})

export const updateRackSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(50).optional(),
})

export const rackIdSchema = z.object({
  id: z.coerce.number(),
})

// Bin Schema
export const createBinSchema = z.object({
  rackId: z.number().positive('Rack is required'),
  code: z.string().min(1, 'Code is required').max(20),
  capacity: z.number().int().positive().default(100),
})

export const updateBinSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  capacity: z.number().int().positive().optional(),
})

export const binIdSchema = z.object({
  id: z.coerce.number(),
})

// Vendor Price List Schema
export const createVendorPriceSchema = z.object({
  supplierId: z.number().positive('Supplier is required'),
  itemId: z.number().positive('Item is required'),
  price: z.number().positive('Price must be positive'),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
})

export const updateVendorPriceSchema = z.object({
  price: z.number().positive().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
})

export const vendorPriceIdSchema = z.object({
  id: z.coerce.number(),
})

// Types
export type CreateUoM = z.infer<typeof createUoMSchema>
export type UpdateUoM = z.infer<typeof updateUoMSchema>
export type CreateWarehouse = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouse = z.infer<typeof updateWarehouseSchema>
export type CreateRack = z.infer<typeof createRackSchema>
export type UpdateRack = z.infer<typeof updateRackSchema>
export type CreateBin = z.infer<typeof createBinSchema>
export type UpdateBin = z.infer<typeof updateBinSchema>
export type CreateVendorPrice = z.infer<typeof createVendorPriceSchema>
export type UpdateVendorPrice = z.infer<typeof updateVendorPriceSchema>