import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiDelete, apiGet, apiPost, apiPut } from '../../../lib/api';
import { User } from '../types';

const USERS_QUERY_KEY = 'users';

export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, filters],
    queryFn: () => apiGet<User[]>('/dashboard/users', { params: filters }),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => apiGet<User>(`/dashboard/users/${id}`),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiPost<User>('/dashboard/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...userData }: Partial<User> & { id: string }) => 
      apiPut<User>(`/dashboard/users/${id}`, userData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/dashboard/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};
