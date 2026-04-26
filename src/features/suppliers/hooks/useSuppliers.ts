// Suppliers Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersApi, type CreateSupplierRequest, type UpdateSupplierRequest } from '../api/suppliersApi'

export const SUPPLIERS_QUERY_KEY = ['suppliers']

export const useSuppliers = () => {
  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEY,
    queryFn: suppliersApi.getAll,
  })
}

export const useSupplier = (id: number) => {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSupplierRequest) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
    },
  })
}

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierRequest }) =>
      suppliersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['suppliers', id] })
    },
  })
}

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
    },
  })
}