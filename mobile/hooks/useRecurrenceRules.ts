import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/api/client';
import type { RecurrenceRule } from '@/types';

export function useRecurrenceRules() {
  return useQuery({
    queryKey: ['recurrence-rules'],
    queryFn: () => apiGet<RecurrenceRule[]>('/admin/recurrence-rules'),
  });
}

export function useCreateRecurrenceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<RecurrenceRule, 'id' | 'tenant_id'>,
    ) => apiPost<RecurrenceRule>('/admin/recurrence-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrence-rules'] });
    },
  });
}

export function useUpdateRecurrenceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: Partial<RecurrenceRule> & { id: string }) =>
      apiPut<RecurrenceRule>(`/admin/recurrence-rules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrence-rules'] });
    },
  });
}

export function useDeleteRecurrenceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiDelete<void>(`/admin/recurrence-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrence-rules'] });
    },
  });
}

export function useMaterializeSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { from: string; to: string }) =>
      apiPost<{ count: number }>('/admin/slots/materialize', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
