import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Appointment, AppointmentFilters } from '@/types';

export function useAppointments(filters?: AppointmentFilters) {
  const { isAdmin } = useAuth();
  const path = isAdmin ? '/admin/appointments' : '/appointments';

  return useQuery({
    queryKey: ['appointments', filters, isAdmin],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.from) params.from = filters.from;
      if (filters?.to) params.to = filters.to;
      if (filters?.user_id) params.user_id = filters.user_id;
      return apiGet<Appointment[]>(path, params);
    },
  });
}

export function useAppointment(id?: string) {
  const { isAdmin } = useAuth();
  const path = isAdmin ? `/admin/appointments/${id}` : `/appointments/${id}`;

  return useQuery({
    queryKey: ['appointment', id, isAdmin],
    queryFn: () => apiGet<Appointment>(path),
    enabled: !!id,
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { availability_slot_id: string; notes?: string }) =>
      apiPost<Appointment>('/appointments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      cancel_reason,
    }: {
      id: string;
      cancel_reason?: string;
    }) => {
      const path = isAdmin
        ? `/admin/appointments/${id}/cancel`
        : `/appointments/${id}/cancel`;
      return apiPatch<Appointment>(path, { cancel_reason });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({
        queryKey: ['appointment', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<Appointment>(`/admin/appointments/${id}/confirm`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<Appointment>(`/admin/appointments/${id}/complete`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
    },
  });
}

export function useMarkNoShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<Appointment>(`/admin/appointments/${id}/no-show`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      new_slot_id,
    }: {
      id: string;
      new_slot_id: string;
    }) => {
      const path = isAdmin
        ? `/admin/appointments/${id}/reschedule`
        : `/appointments/${id}/reschedule`;
      return apiPatch<Appointment>(path, {
        availability_slot_id: new_slot_id,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({
        queryKey: ['appointment', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
