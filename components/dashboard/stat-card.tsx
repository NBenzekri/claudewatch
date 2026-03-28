import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'indigo' | 'emerald' | 'amber' | 'red';
}

const colorMap = {
  indigo: 'border-indigo-500/20 text-indigo-400',
  emerald: 'border-emerald-500/20 text-emerald-400',
  amber: 'border-amber-500/20 text-amber-400',
  red: 'border-red-500/20 text-red-400',
};

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', colorMap[color])}>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
