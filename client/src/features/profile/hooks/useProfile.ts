import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPut } from '../../../lib/api';
import type { UserProfile, UpdateProfileData } from '../types';

const PROFILE_QUERY_KEY = 'profile';

export const useProfile = () => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: () => apiGet<UserProfile>('/profile'),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileData) => 
      apiPut<UserProfile>('/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      apiPut('/profile/password', data),
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      return api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
    },
  });
};
