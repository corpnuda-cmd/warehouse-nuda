import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uomsApi } from '../api/uomsApi'

export function useUoms() {
  const queryClient = useQueryClient()

  const { data: uoms = [], isLoading, error } = useQuery({
    queryKey: ['uoms'],
    queryFn: () => uomsApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; symbol: string }) => uomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; symbol?: string } }) =>
      uomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => uomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
    },
  })

  return {
    uoms,
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}