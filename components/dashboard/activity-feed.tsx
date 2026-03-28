'use client';

import type { SessionFull } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  sessions: SessionFull[];
}

export default function ActivityFeed({ sessions }: ActivityFeedProps) {
  return (
    <div className="rounded-lg bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">Recent Activity</h3>
      <div className="space-y-2">
        {sessions.slice(0, 10).map((session, i) => {
          const isActive = !session.facet.outcome;
          const outcomeColor = session.facet.outcome === 'fully_achieved'
            ? 'bg-emerald-400'
            : session.facet.outcome === 'partially_achieved'
              ? 'bg-amber-400'
              : 'bg-muted-foreground/30';

          return (
            <div
              key={session.facet.session_id || i}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-secondary/50"
            >
              <div className={cn(
                'h-1.5 w-1.5 rounded-full flex-shrink-0',
                isActive ? 'bg-emerald-400 animate-pulse' : outcomeColor
              )} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-foreground/80">
                  {session.facet.brief_summary || session.facet.underlying_goal || 'Session'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.meta?.project_path?.split(/[/\\]/).pop() || 'unknown'}
                  {session.meta?.duration_minutes ? ` · ${session.meta.duration_minutes}min` : ''}
                  {session.facet.outcome ? ` · ${session.facet.outcome.replace('_', ' ')}` : ''}
                </p>
              </div>
            </div>
          );
        })}
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">No session history found</p>
        )}
      </div>
    </div>
  );
}
