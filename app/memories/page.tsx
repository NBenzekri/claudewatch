'use client';

import { useState } from 'react';
import { useMemories, useUpdateMemory, useDeleteMemory } from '@/hooks/use-claude-data';
import MemoryCard from '@/components/memories/memory-card';

export default function MemoriesPage() {
  const { data } = useMemories();
  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();
  const [activeTab, setActiveTab] = useState('global');

  const globalMemories = data?.global || [];
  const projectMemories = data?.projects || {};
  const index = data?.index;
  const projectNames = Object.keys(projectMemories);
  const tabs = ['global', ...projectNames];

  const currentMemories = activeTab === 'global'
    ? globalMemories
    : projectMemories[activeTab] || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Memories</h1>

      {index && (
        <div className="rounded-lg bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-2">Memory Index (MEMORY.md)</h3>
          <pre className="whitespace-pre-wrap text-xs text-foreground/60 bg-background/50 rounded p-3 max-h-60 overflow-y-auto">
            {index}
          </pre>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'global' ? 'Global' : tab.split('-').pop()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {currentMemories.map((memory) => (
          <MemoryCard
            key={memory.filePath}
            memory={memory}
            onSave={(filePath, content) => updateMemory.mutate({ filePath, content })}
            onDelete={(filePath) => deleteMemory.mutate(filePath)}
          />
        ))}
        {currentMemories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No memories in this scope
          </p>
        )}
      </div>
    </div>
  );
}
