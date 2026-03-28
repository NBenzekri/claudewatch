'use client';

import { useProjects } from '@/hooks/use-claude-data';
import ProjectCard from '@/components/projects/project-card';

export default function ProjectsPage() {
  const { data: projects } = useProjects();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(projects || []).map((project: any) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
        {(!projects || projects.length === 0) && (
          <p className="text-sm text-muted-foreground">No projects found</p>
        )}
      </div>
    </div>
  );
}
