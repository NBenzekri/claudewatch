'use client';

import { usePlugins } from '@/hooks/use-claude-data';
import PluginCard from '@/components/plugins/plugin-card';

export default function PluginsPage() {
  const { data } = usePlugins();
  const plugins = data?.plugins || [];
  const skills = data?.skills || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plugins & Skills</h1>
      <div>
        <h2 className="text-lg font-semibold mb-3">Installed Plugins</h2>
        <div className="space-y-2">
          {plugins.map((plugin) => (
            <PluginCard key={plugin.name} plugin={plugin} />
          ))}
          {plugins.length === 0 && (
            <p className="text-sm text-muted-foreground">No plugins installed</p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Custom Skills</h2>
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <div key={skill.name} className="rounded-lg bg-card px-4 py-3">
              <p className="text-sm font-medium text-foreground">{skill.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{skill.path}</p>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-sm text-muted-foreground">No custom skills</p>
          )}
        </div>
      </div>
    </div>
  );
}
