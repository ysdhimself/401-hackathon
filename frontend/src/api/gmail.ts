import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { GmailStatus, EmailMessage } from '@/types';

export const GMAIL_QUERY_KEYS = {
  status: ['gmail', 'status'] as const,
  emails: ['gmail', 'emails'] as const,
};

// Check Gmail connection status
export function useGmailStatus() {
  return useQuery({
    queryKey: GMAIL_QUERY_KEYS.status,
    queryFn: async () => {
      const { data } = await apiClient.get<GmailStatus>('/gmail/status/');
      return data;
    },
  });
}

// Get fetched emails
export function useGmailEmails() {
  return useQuery({
    queryKey: GMAIL_QUERY_KEYS.emails,
    queryFn: async () => {
      const { data } = await apiClient.get<EmailMessage[]>('/gmail/emails/');
      return data;
    },
  });
}

// Fetch new emails from Gmail
export function useFetchEmails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ fetched: number; stored: number }>(
        '/gmail/emails/fetch/'
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GMAIL_QUERY_KEYS.emails });
    },
  });
}

// Disconnect Gmail
export function useDisconnectGmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/gmail/disconnect/');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GMAIL_QUERY_KEYS.status });
      queryClient.invalidateQueries({ queryKey: GMAIL_QUERY_KEYS.emails });
    },
  });
}

// Connect Gmail (initiates OAuth popup flow)
export function useGmailConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Get the auth URL from the backend
      const { data } = await apiClient.get<{ auth_url: string }>('/gmail/auth/init/');

      // Open popup for OAuth
      const popup = window.open(
        data.auth_url,
        'gmail-oauth',
        'width=600,height=700,left=200,top=100'
      );

      // Listen for message from popup
      return new Promise<void>((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data?.type === 'GMAIL_CONNECTED') {
            window.removeEventListener('message', handleMessage);
            popup?.close();
            resolve();
          } else if (event.data?.type === 'GMAIL_ERROR') {
            window.removeEventListener('message', handleMessage);
            popup?.close();
            reject(new Error(event.data.error || 'OAuth failed'));
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed without completing
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Popup was closed'));
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error('OAuth timeout'));
        }, 300000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GMAIL_QUERY_KEYS.status });
    },
  });
}
