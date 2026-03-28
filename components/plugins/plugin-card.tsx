import type { Plugin } from '@/lib/types';

interface PluginCardProps {
  plugin: Plugin;
}

export default function PluginCard({ plugin }: PluginCardProps) {
  return (
    <div className="rounded-lg bg-card p-4 flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary text-lg font-bold flex-shrink-0">
        {plugin.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{plugin.name}</p>
          {plugin.version && plugin.version !== 'unknown' && (
            <span className="text-xs text-muted-foreground">v{plugin.version}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Updated {new Date(plugin.lastUpdated).toLocaleDateString()}
          {plugin.scope ? ` · ${plugin.scope}` : ''}
        </p>
      </div>
      <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${plugin.enabled ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
    </div>
  );
}
