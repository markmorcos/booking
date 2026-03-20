import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/api/client';
import type { User } from '@/types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiGet<User[]>('/admin/users'),
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; name: string; role?: string }) =>
      apiPost<User>('/admin/users/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Partial<
        Pick<
          User,
          'phone' | 'locale' | 'notify_email' | 'notify_whatsapp' | 'notify_push'
        >
      >,
    ) => apiPatch<User>('/auth/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
