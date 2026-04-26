// Items Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi, type CreateItemRequest, type UpdateItemRequest } from '../api/itemsApi'

export const ITEMS_QUERY_KEY = ['items']

export const useItems = () => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: itemsApi.getAll,
  })
}

export const useItem = (id: number) => {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemsApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateItemRequest) => itemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}

export const useUpdateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateItemRequest }) =>
      itemsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['items', id] })
    },
  })
}

export const useDeleteItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => itemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}