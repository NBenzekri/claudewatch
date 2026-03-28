'use client';

import { useActiveSessions, useSessionHistory } from '@/hooks/use-claude-data';
import SessionList from '@/components/sessions/session-list';

export default function SessionsPage() {
  const { data: activeSessions } = useActiveSessions();
  const { data: sessionHistory } = useSessionHistory();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sessions</h1>
      <SessionList
        sessions={sessionHistory || []}
        activeSessions={activeSessions || []}
      />
    </div>
  );
}
