import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  JobApplication,
  JobApplicationListItem,
  JobApplicationInput,
  ApplicationNote,
  DashboardStats,
  PaginatedResponse,
  ApplicationFilters,
} from '@/types';

// Query keys for cache management
export const QUERY_KEYS = {
  applications: ['applications'] as const,
  application: (id: number) => ['applications', id] as const,
  dashboard: ['dashboard'] as const,
  recent: ['applications', 'recent'] as const,
  followUps: ['applications', 'followUps'] as const,
};

// Dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>('/applications/dashboard/');
      return data;
    },
  });
}

// Recent applications
export function useRecentApplications() {
  return useQuery({
    queryKey: QUERY_KEYS.recent,
    queryFn: async () => {
      const { data } = await apiClient.get<JobApplicationListItem[]>('/applications/recent/');
      return data;
    },
  });
}

// Applications list with filters
export function useApplications(filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.applications, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.job_type) params.append('job_type', filters.job_type);
      if (filters.work_location_type) params.append('work_location_type', filters.work_location_type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.page) params.append('page', String(filters.page));

      const { data } = await apiClient.get<PaginatedResponse<JobApplicationListItem>>(
        `/applications/?${params}`
      );
      return data;
    },
  });
}

// Single application detail
export function useApplication(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.application(id),
    queryFn: async () => {
      const { data } = await apiClient.get<JobApplication>(`/applications/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

// Follow-ups list
export function useFollowUps() {
  return useQuery({
    queryKey: QUERY_KEYS.followUps,
    queryFn: async () => {
      const { data } = await apiClient.get<JobApplicationListItem[]>('/applications/follow_ups/');
      return data;
    },
  });
}

// Create application
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: JobApplicationInput) => {
      const { data } = await apiClient.post<JobApplication>('/applications/', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recent });
    },
  });
}

// Update application
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: JobApplicationInput & { id: number }) => {
      const { data } = await apiClient.put<JobApplication>(`/applications/${id}/`, input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.application(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.followUps });
    },
  });
}

// Delete application
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/applications/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recent });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.followUps });
    },
  });
}

// Add note to application
export function useAddNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, content }: { applicationId: number; content: string }) => {
      const { data } = await apiClient.post<ApplicationNote>(
        `/applications/${applicationId}/add_note/`,
        { content }
      );
      return data;
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.application(applicationId) });
    },
  });
}

// Delete note
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, noteId }: { applicationId: number; noteId: number }) => {
      await apiClient.delete(`/applications/${applicationId}/notes/${noteId}/`);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.application(applicationId) });
    },
  });
}
