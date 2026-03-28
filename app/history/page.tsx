'use client';

import { useState } from 'react';
import { useHistory } from '@/hooks/use-claude-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data } = useHistory(searchQuery, page);

  const entries = data?.entries || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  const handleSearch = () => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Prompt History</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <p className="text-xs text-muted-foreground">{total} entries found</p>

      <div className="space-y-1">
        {entries.map((entry: any, i: number) => (
          <div key={`${entry.timestamp}-${i}`} className="rounded-md bg-card px-4 py-3">
            <p className="text-sm text-foreground/80 truncate">{entry.display}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {entry.project?.split(/[/\\]/).pop() || 'unknown'}
              {' · '}
              {new Date(entry.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {searchQuery ? 'No matching prompts found' : 'No history available'}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
