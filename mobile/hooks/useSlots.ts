import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/api/client';
import type { AvailabilitySlot } from '@/types';

export function useSlots(from?: string, to?: string) {
  return useQuery({
    queryKey: ['slots', from, to],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      return apiGet<AvailabilitySlot[]>('/slots', params);
    },
    enabled: !!from && !!to,
  });
}

export function useSlot(id?: string) {
  return useQuery({
    queryKey: ['slots', id],
    queryFn: () => apiGet<AvailabilitySlot>(`/slots/${id}`),
    enabled: !!id,
  });
}
