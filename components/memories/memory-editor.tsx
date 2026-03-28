'use client';

import { useState } from 'react';
import type { Memory } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface MemoryEditorProps {
  memory: Memory;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export default function MemoryEditor({ memory, onSave, onCancel }: MemoryEditorProps) {
  const initialContent = [
    '---',
    `name: ${memory.name}`,
    `description: ${memory.description}`,
    `type: ${memory.type}`,
    '---',
    '',
    memory.body,
  ].join('\n');

  const [content, setContent] = useState(initialContent);

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-48 rounded-md bg-background border border-border p-3 text-xs font-mono text-foreground/80 resize-y focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(content)}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
