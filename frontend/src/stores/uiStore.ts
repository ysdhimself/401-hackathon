import { create } from 'zustand';
import type { ApplicationFilters, Toast } from '@/types';

interface UIState {
  // Filters
  filters: ApplicationFilters;
  setFilters: (filters: Partial<ApplicationFilters>) => void;
  resetFilters: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Delete confirmation modal
  isDeleteModalOpen: boolean;
  deleteTargetId: number | null;
  openDeleteModal: (id: number) => void;
  closeDeleteModal: () => void;
}

const initialFilters: ApplicationFilters = {
  search: '',
  status: '',
  job_type: '',
  work_location_type: '',
  date_from: '',
  date_to: '',
  page: 1,
};

export const useUIStore = create<UIState>((set) => ({
  // Filters
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        page:
          'page' in newFilters && newFilters.page !== undefined
            ? newFilters.page
            : 1,
      },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  // Toasts
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Delete modal
  isDeleteModalOpen: false,
  deleteTargetId: null,
  openDeleteModal: (id) => set({ isDeleteModalOpen: true, deleteTargetId: id }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, deleteTargetId: null }),
}));
