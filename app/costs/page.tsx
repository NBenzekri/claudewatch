'use client';

import { useUsage } from '@/hooks/use-claude-data';
import StatCard from '@/components/dashboard/stat-card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#34d399', '#fbbf24'];

export default function CostsPage() {
  const { data: usage } = useUsage();

  if (!usage) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usage & Costs</h1>
        <p className="text-sm text-muted-foreground">Loading usage data...</p>
      </div>
    );
  }

  const totalTokens = usage.totalInputTokens + usage.totalOutputTokens;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usage & Costs</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Sessions" value={usage.totalSessions} color="indigo" />
        <StatCard label="Total Tokens" value={`${(totalTokens / 1_000_000).toFixed(1)}M`} color="emerald" />
        <StatCard label="Total Duration" value={`${Math.round(usage.totalDurationMinutes / 60)}h`} color="amber" />
        <StatCard label="Files Modified" value={usage.totalFilesModified} color="red" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Lines Added</p>
          <p className="text-xl font-bold text-emerald-400">+{usage.totalLinesAdded.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Lines Removed</p>
          <p className="text-xl font-bold text-red-400">-{usage.totalLinesRemoved.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Input / Output Tokens</p>
          <p className="text-sm font-medium text-foreground/80">
            {(usage.totalInputTokens / 1000).toFixed(0)}k / {(usage.totalOutputTokens / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Daily Sessions</h3>
        {usage.dailyUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usage.dailyUsage}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                tickFormatter={(d: string) => d.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="sessions" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">No daily data available</p>
        )}
      </div>

      <div className="rounded-lg bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">By Project</h3>
        {usage.projectBreakdown.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={usage.projectBreakdown}
                  dataKey="sessions"
                  nameKey="project"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ project }) => project}
                >
                  {usage.projectBreakdown.map((_: unknown, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {usage.projectBreakdown.map((proj: { project: string; sessions: number }, i: number) => (
                <div key={proj.project} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-foreground/80 flex-1 truncate">{proj.project}</span>
                  <span className="text-xs text-muted-foreground">{proj.sessions} sessions</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No project data available</p>
        )}
      </div>
    </div>
  );
}
