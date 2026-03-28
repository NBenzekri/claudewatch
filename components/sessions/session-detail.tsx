import type { SessionFull } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface SessionDetailProps {
  session: SessionFull;
}

export default function SessionDetail({ session }: SessionDetailProps) {
  const { facet, meta } = session;

  return (
    <div className="space-y-3 border-t border-border pt-3 mt-3">
      {facet.underlying_goal && (
        <div>
          <p className="text-xs text-muted-foreground uppercase">Goal</p>
          <p className="text-sm text-foreground/80">{facet.underlying_goal}</p>
        </div>
      )}

      {Object.keys(facet.goal_categories || {}).length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase mb-1">Categories</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(facet.goal_categories).map(([cat, count]) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat.replace(/_/g, ' ')} ({count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {meta && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Duration: </span>
            <span className="text-foreground/80">{meta.duration_minutes}min</span>
          </div>
          <div>
            <span className="text-muted-foreground">Messages: </span>
            <span className="text-foreground/80">{meta.user_message_count} user / {meta.assistant_message_count} assistant</span>
          </div>
          <div>
            <span className="text-muted-foreground">Tokens: </span>
            <span className="text-foreground/80">{(meta.input_tokens + meta.output_tokens).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Lines: </span>
            <span className="text-emerald-400">+{meta.lines_added}</span>
            <span className="text-red-400"> -{meta.lines_removed}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Files modified: </span>
            <span className="text-foreground/80">{meta.files_modified}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Commits: </span>
            <span className="text-foreground/80">{meta.git_commits}</span>
          </div>
        </div>
      )}

      {facet.friction_detail && (
        <div>
          <p className="text-xs text-muted-foreground uppercase">Friction</p>
          <p className="text-sm text-amber-400/80">{facet.friction_detail}</p>
        </div>
      )}

      {facet.claude_helpfulness && (
        <div>
          <span className="text-xs text-muted-foreground">Helpfulness: </span>
          <Badge variant={facet.claude_helpfulness === 'essential' ? 'default' : 'secondary'} className="text-xs">
            {facet.claude_helpfulness}
          </Badge>
        </div>
      )}
    </div>
  );
}
