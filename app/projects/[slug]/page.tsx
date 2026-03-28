'use client';

import { use } from 'react';
import { useProject } from '@/hooks/use-claude-data';

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data } = useProject(slug);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{slug.split('-').pop()}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Sessions</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{data.sessionCount}</p>
        </div>
        <div className="rounded-lg bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Active Now</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{data.activeSessions?.length || 0}</p>
        </div>
        <div className="rounded-lg bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Memory Files</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{data.memoryFiles?.length || 0}</p>
        </div>
      </div>

      {data.activeSessions?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Sessions</h2>
          <div className="space-y-2">
            {data.activeSessions.map((s: any) => (
              <div key={s.pid} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-400">PID {s.pid}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.cwd}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.projectClaudeMd && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Project CLAUDE.md</h2>
          <div className="rounded-lg bg-card p-4">
            <pre className="whitespace-pre-wrap text-xs text-foreground/60 font-mono">{data.projectClaudeMd}</pre>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Session Files</h2>
        <div className="space-y-1">
          {(data.sessionFiles || []).map((file: string) => (
            <div key={file} className="rounded-md bg-card px-3 py-2 text-xs text-muted-foreground font-mono">
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
