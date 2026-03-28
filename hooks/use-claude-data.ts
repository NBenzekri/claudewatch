'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ActiveSession,
  SessionFull,
  Memory,
  Plugin,
  Skill,
  ClaudeSettings,
  PolicyLimits,
  UsageStats,
  PlanFile,
  Project,
  HistoryEntry,
  HealthStatus,
} from '@/lib/types';

const REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '5000', 10);

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useActiveSessions() {
  return useQuery<ActiveSession[]>({
    queryKey: ['sessions', 'active'],
    queryFn: () => fetchApi<ActiveSession[]>('/api/sessions'),
    refetchInterval: REFRESH_INTERVAL,
  });
}

export function useSessionHistory() {
  return useQuery<SessionFull[]>({
    queryKey: ['sessions', 'history'],
    queryFn: () => fetchApi<SessionFull[]>('/api/sessions/history'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

interface MemoriesResponse {
  global: Memory[];
  projects: Record<string, Memory[]>;
  index: string | null;
}

export function useMemories() {
  return useQuery<MemoriesResponse>({
    queryKey: ['memories'],
    queryFn: () => fetchApi<MemoriesResponse>('/api/memories'),
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

interface PluginsResponse {
  plugins: Plugin[];
  skills: Skill[];
}

export function usePlugins() {
  return useQuery<PluginsResponse>({
    queryKey: ['plugins'],
    queryFn: () => fetchApi<PluginsResponse>('/api/plugins'),
    refetchInterval: 30000,
  });
}

interface SettingsResponse {
  settings: ClaudeSettings | null;
  claudeMd: string | null;
  policies: PolicyLimits | null;
  cliVersion: string | null;
}

export function useSettings() {
  return useQuery<SettingsResponse>({
    queryKey: ['settings'],
    queryFn: () => fetchApi<SettingsResponse>('/api/settings'),
    refetchInterval: 30000,
  });
}

export function useUsage() {
  return useQuery<UsageStats>({
    queryKey: ['usage'],
    queryFn: () => fetchApi<UsageStats>('/api/usage'),
    refetchInterval: REFRESH_INTERVAL * 3,
  });
}

export function usePlans() {
  return useQuery<PlanFile[]>({
    queryKey: ['plans'],
    queryFn: () => fetchApi<PlanFile[]>('/api/plans'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetchApi<Project[]>('/api/projects'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

interface ProjectDetail extends Project {
  sessionFiles: string[];
  memoryFiles: string[];
  projectClaudeMd: string | null;
  activeSessions: ActiveSession[];
}

export function useProject(slug: string) {
  return useQuery<ProjectDetail>({
    queryKey: ['projects', slug],
    queryFn: () => fetchApi<ProjectDetail>(`/api/projects/${slug}`),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

interface HistoryResponse {
  entries: HistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export function useHistory(query: string, page: number) {
  return useQuery<HistoryResponse>({
    queryKey: ['history', query, page],
    queryFn: () => fetchApi<HistoryResponse>(`/api/history?q=${encodeURIComponent(query)}&page=${page}`),
    enabled: true,
  });
}

export function useHealth() {
  return useQuery<HealthStatus>({
    queryKey: ['health'],
    queryFn: () => fetchApi<HealthStatus>('/api/health'),
    refetchInterval: 30000,
  });
}
