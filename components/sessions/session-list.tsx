'use client';

import { useState } from 'react';
import type { SessionFull, ActiveSession } from '@/lib/types';
import SessionDetail from './session-detail';

interface SessionListProps {
  sessions: SessionFull[];
  activeSessions: ActiveSession[];
}

export default function SessionList({ sessions, activeSessions }: SessionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filtered = filter === 'active'
    ? sessions.filter(s => !s.facet.outcome)
    : filter === 'completed'
      ? sessions.filter(s => s.facet.outcome)
      : sessions;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeSessions.length > 0 && (
        <div className="mb-4 space-y-2">
          {activeSessions.map((s) => (
            <div key={s.pid} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">Active — PID {s.pid}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {s.cwd} · {s.kind} · started {new Date(s.startedAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((session, i) => {
          const id = session.facet.session_id || `session-${i}`;
          const isExpanded = expandedId === id;
          const outcomeColor = session.facet.outcome === 'fully_achieved'
            ? 'border-l-emerald-500'
            : session.facet.outcome === 'partially_achieved'
              ? 'border-l-amber-500'
              : 'border-l-indigo-500';

          return (
            <div
              key={id}
              className={`rounded-lg bg-card border-l-[3px] p-3 cursor-pointer hover:bg-secondary/30 ${outcomeColor}`}
              onClick={() => setExpandedId(isExpanded ? null : id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.facet.brief_summary || session.facet.underlying_goal || 'Session'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.meta?.project_path?.split(/[/\\]/).pop() || 'unknown'}
                    {session.meta?.duration_minutes ? ` · ${session.meta.duration_minutes}min` : ''}
                    {session.facet.session_type ? ` · ${session.facet.session_type}` : ''}
                  </p>
                </div>
                {session.facet.outcome && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {session.facet.outcome.replace('_', ' ')}
                  </span>
                )}
              </div>
              {isExpanded && <SessionDetail session={session} />}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No sessions found</p>
        )}
      </div>
    </div>
  );
}
