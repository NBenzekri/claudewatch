'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyUsage } from '@/lib/types';

interface UsageChartProps {
  data: DailyUsage[];
}

export default function UsageChart({ data }: UsageChartProps) {
  const recent = data.slice(-7);

  return (
    <div className="rounded-lg bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">Usage (7 days)</h3>
      {recent.length > 0 ? (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={recent}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
              tickFormatter={(d: string) => d.slice(5)}
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
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <Bar dataKey="sessions" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-muted-foreground">No usage data yet</p>
      )}
    </div>
  );
}
