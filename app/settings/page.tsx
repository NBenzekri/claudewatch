'use client';

import { useSettings } from '@/hooks/use-claude-data';

export default function SettingsPage() {
  const { data } = useSettings();
  const settings = data?.settings;
  const policies = data?.policies;
  const claudeMd = data?.claudeMd;
  const cliVersion = data?.cliVersion;

  const configItems = [
    { label: 'Model', value: settings?.model || '—' },
    { label: 'CLI Version', value: cliVersion || '—' },
    { label: 'Auto Updates', value: settings?.autoUpdatesChannel || '—' },
    { label: 'Voice Enabled', value: settings?.voiceEnabled ? 'Yes' : 'No' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings & Config</h1>

      <div className="space-y-2">
        {configItems.map((item) => (
          <div key={item.label} className="rounded-lg bg-card p-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      {settings?.enabledPlugins && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Enabled Plugins</h2>
          <div className="space-y-1">
            {Object.entries(settings.enabledPlugins).map(([name, enabled]) => (
              <div key={name} className="rounded-lg bg-card px-4 py-2.5 flex justify-between items-center">
                <span className="text-sm text-foreground">{name.split('@')[0]}</span>
                <div className={`h-2.5 w-2.5 rounded-full ${enabled ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {policies?.restrictions && Object.keys(policies.restrictions).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Policy Limits</h2>
          <div className="rounded-lg bg-card p-4">
            <pre className="text-xs text-foreground/60 whitespace-pre-wrap">
              {JSON.stringify(policies.restrictions, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {claudeMd && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Global CLAUDE.md</h2>
          <div className="rounded-lg bg-card p-4">
            <pre className="text-xs text-foreground/60 whitespace-pre-wrap font-mono bg-background/50 rounded p-3 max-h-80 overflow-y-auto">
              {claudeMd}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
