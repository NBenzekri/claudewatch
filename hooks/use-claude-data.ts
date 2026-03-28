'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '5000', 10);

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: () => fetchApi('/api/sessions'),
    refetchInterval: REFRESH_INTERVAL,
  });
}

export function useSessionHistory() {
  return useQuery({
    queryKey: ['sessions', 'history'],
    queryFn: () => fetchApi('/api/sessions/history'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

export function useMemories() {
  return useQuery({
    queryKey: ['memories'],
    queryFn: () => fetchApi('/api/memories'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ filePath, content }: { filePath: string; content: string }) => {
      const res = await fetch('/api/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content }),
      });
      if (!res.ok) throw new Error('Failed to update memory');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memories'] }),
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filePath: string) => {
      const res = await fetch('/api/memories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
      if (!res.ok) throw new Error('Failed to delete memory');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memories'] }),
  });
}

export function usePlugins() {
  return useQuery({
    queryKey: ['plugins'],
    queryFn: () => fetchApi('/api/plugins'),
    refetchInterval: 30000,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchApi('/api/settings'),
    refetchInterval: 30000,
  });
}

export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: () => fetchApi('/api/usage'),
    refetchInterval: REFRESH_INTERVAL * 3,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => fetchApi('/api/plans'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/api/projects'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: () => fetchApi(`/api/projects/${slug}`),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

export function useHistory(query: string, page: number) {
  return useQuery({
    queryKey: ['history', query, page],
    queryFn: () => fetchApi(`/api/history?q=${encodeURIComponent(query)}&page=${page}`),
    enabled: true,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => fetchApi('/api/health'),
    refetchInterval: 30000,
  });
}
