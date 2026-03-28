'use client';

import { useState } from 'react';
import type { Memory } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import MemoryEditor from './memory-editor';

interface MemoryCardProps {
  memory: Memory;
  onSave: (filePath: string, content: string) => void;
  onDelete: (filePath: string) => void;
}

const typeBadgeColors: Record<string, string> = {
  user: 'bg-blue-500/15 text-blue-400',
  feedback: 'bg-amber-500/15 text-amber-400',
  project: 'bg-emerald-500/15 text-emerald-400',
  reference: 'bg-purple-500/15 text-purple-400',
  unknown: 'bg-muted text-muted-foreground',
};

export default function MemoryCard({ memory, onSave, onDelete }: MemoryCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-lg bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={typeBadgeColors[memory.type] || typeBadgeColors.unknown}>
              {memory.type}
            </Badge>
            <span className="text-sm font-medium text-foreground truncate">{memory.name}</span>
          </div>
          {memory.description && (
            <p className="text-xs text-muted-foreground mb-2">{memory.description}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={() => setEditing(!editing)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!editing && (
        <pre className="mt-2 whitespace-pre-wrap text-xs text-foreground/60 bg-background/50 rounded p-3 max-h-40 overflow-y-auto">
          {memory.body}
        </pre>
      )}

      {editing && (
        <MemoryEditor
          memory={memory}
          onSave={(content) => {
            onSave(memory.filePath, content);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      {confirmDelete && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 p-3">
          <p className="text-xs text-destructive flex-1">Delete this memory? This cannot be undone.</p>
          <Button size="sm" variant="destructive" onClick={() => { onDelete(memory.filePath); setConfirmDelete(false); }}>
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
