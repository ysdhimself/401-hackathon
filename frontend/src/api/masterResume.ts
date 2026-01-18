import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
    MasterResume,
    MasterResumeListItem,
    MasterResumeInput,
    ResumeSection,
    ResumeEntry,
    ParsedResume,
} from '@/types';

// Query keys for cache management
export const MASTER_RESUME_QUERY_KEYS = {
    resumes: ['masterResumes'] as const,
    resume: (id: number) => ['masterResumes', id] as const,
    default: ['masterResumes', 'default'] as const,
    sections: (resumeId: number) => ['masterResumes', resumeId, 'sections'] as const,
    section: (sectionId: number) => ['resumeSections', sectionId] as const,
    entries: (sectionId: number) => ['resumeSections', sectionId, 'entries'] as const,
};

// Get all master resumes
export function useMasterResumes() {
    return useQuery({
        queryKey: MASTER_RESUME_QUERY_KEYS.resumes,
        queryFn: async () => {
            const { data } = await apiClient.get<{ results: MasterResumeListItem[] }>('/master-resume/resumes/');
            return data.results;
        },
    });
}

// Get single master resume with sections
export function useMasterResume(id: number) {
    return useQuery({
        queryKey: MASTER_RESUME_QUERY_KEYS.resume(id),
        queryFn: async () => {
            const { data } = await apiClient.get<MasterResume>(`/master-resume/resumes/${id}/`);
            return data;
        },
        enabled: !!id,
    });
}

// Get default master resume
export function useDefaultMasterResume() {
    return useQuery({
        queryKey: MASTER_RESUME_QUERY_KEYS.default,
        queryFn: async () => {
            const { data } = await apiClient.get<MasterResume>('/master-resume/resumes/default/');
            return data;
        },
    });
}

// Create master resume
export function useCreateMasterResume() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: MasterResumeInput) => {
            const { data } = await apiClient.post<MasterResume>('/master-resume/resumes/', input);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.resumes });
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.default });
        },
    });
}

// Update master resume
export function useUpdateMasterResume(id: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: Partial<MasterResumeInput>) => {
            const { data } = await apiClient.patch<MasterResume>(
                `/master-resume/resumes/${id}/`,
                input
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.resumes });
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.resume(id) });
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.default });
        },
    });
}

// Delete master resume
export function useDeleteMasterResume() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/master-resume/resumes/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.resumes });
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.default });
        },
    });
}

// Duplicate master resume
export function useDuplicateMasterResume() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.post<MasterResume>(
                `/master-resume/resumes/${id}/duplicate/`
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.resumes });
        },
    });
}

// Parse resume upload
export function useParseMasterResume() {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await apiClient.post<ParsedResume>(
                '/master-resume/resumes/parse/',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return data;
        },
    });
}

// Create resume section
export function useCreateResumeSection(resumeId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: Partial<ResumeSection>) => {
            const { data } = await apiClient.post<ResumeSection>(
                `/master-resume/resumes/${resumeId}/sections/`,
                input
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.resume(resumeId) });
        },
    });
}

// Update resume section
export function useUpdateResumeSection(resumeId: number, sectionId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: Partial<ResumeSection>) => {
            const { data } = await apiClient.patch<ResumeSection>(
                `/master-resume/resumes/${resumeId}/sections/${sectionId}/`,
                input
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.resume(resumeId) });
        },
    });
}

// Delete resume section
export function useDeleteResumeSection(resumeId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sectionId: number) => {
            await apiClient.delete(
                `/master-resume/resumes/${resumeId}/sections/${sectionId}/`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MASTER_RESUME_QUERY_KEYS.resume(resumeId) });
        },
    });
}

// Create resume entry
export function useCreateResumeEntry(sectionId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: Partial<ResumeEntry>) => {
            const { data } = await apiClient.post<ResumeEntry>(
                `/master-resume/sections/${sectionId}/entries/`,
                input
            );
            return data;
        },
        onSuccess: () => {
            // Need to invalidate the parent resume
            queryClient.invalidateQueries({ queryKey: ['masterResumes'] });
        },
    });
}

// Update resume entry
export function useUpdateResumeEntry(sectionId: number, entryId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: Partial<ResumeEntry>) => {
            const { data } = await apiClient.patch<ResumeEntry>(
                `/master-resume/sections/${sectionId}/entries/${entryId}/`,
                input
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masterResumes'] });
        },
    });
}

// Delete resume entry
export function useDeleteResumeEntry(sectionId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (entryId: number) => {
            await apiClient.delete(
                `/master-resume/sections/${sectionId}/entries/${entryId}/`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masterResumes'] });
        },
    });
}
