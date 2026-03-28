import Link from 'next/link';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const isActive = project.activeSessionCount > 0;
  const lastActive = project.lastActivity
    ? new Date(project.lastActivity).toLocaleDateString()
    : 'never';

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="rounded-lg bg-card p-4 hover:bg-secondary/30 transition-colors cursor-pointer border border-border hover:border-indigo-500/30">
        <p className="text-sm font-medium text-foreground">{project.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {project.sessionCount} sessions
          {project.hasMemories && ' · has memories'}
        </p>
        <div className="mt-3">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {project.activeSessionCount} active
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Last active: {lastActive}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
