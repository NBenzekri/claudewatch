'use client';

import { useActiveSessions, useSessionHistory, useProjects, usePlugins, useUsage } from '@/hooks/use-claude-data';
import StatCard from '@/components/dashboard/stat-card';
import ActivityFeed from '@/components/dashboard/activity-feed';
import UsageChart from '@/components/dashboard/usage-chart';

export default function OverviewPage() {
  const { data: activeSessions } = useActiveSessions();
  const { data: sessionHistory } = useSessionHistory();
  const { data: projects } = useProjects();
  const { data: pluginsData } = usePlugins();
  const { data: usage } = useUsage();

  const activeCount = Array.isArray(activeSessions) ? activeSessions.length : 0;
  const totalSessions = usage?.totalSessions || 0;
  const projectCount = Array.isArray(projects) ? projects.length : 0;
  const pluginCount = pluginsData?.plugins ? pluginsData.plugins.length : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Sessions" value={activeCount} color="indigo" />
        <StatCard label="Total Sessions" value={totalSessions} color="emerald" />
        <StatCard label="Projects" value={projectCount} color="amber" />
        <StatCard label="Plugins" value={pluginCount} color="red" />
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-3">
          <ActivityFeed sessions={sessionHistory || []} />
        </div>
        <div className="md:col-span-2">
          <UsageChart data={usage?.dailyUsage || []} />
        </div>
      </div>
    </div>
  );
}
