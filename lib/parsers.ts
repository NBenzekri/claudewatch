import path from 'path';
import matter from 'gray-matter';
import {
  claudePath, readJsonFile, listJsonFiles, listMdFiles, listDir, fileStats, readTextFile, dirExists
} from './claude-fs';
import type {
  ActiveSession, SessionFacet, SessionMeta, SessionFull,
  Memory, Plugin, Skill, ClaudeSettings, PolicyLimits,
  HistoryEntry, PlanFile, Project, UsageStats, DailyUsage, ProjectUsage
} from './types';

// ── Active Sessions ──

export async function getActiveSessions(): Promise<ActiveSession[]> {
  const dir = claudePath('sessions');
  const files = await listJsonFiles(dir);
  const sessions: ActiveSession[] = [];

  for (const file of files) {
    const data = await readJsonFile<ActiveSession>(path.join(dir, file));
    if (data) sessions.push(data);
  }

  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

// ── Session History (Facets + Meta) ──

export async function getSessionHistory(): Promise<SessionFull[]> {
  const facetsDir = claudePath('usage-data', 'facets');
  const metaDir = claudePath('usage-data', 'session-meta');
  const facetFiles = await listJsonFiles(facetsDir);

  const sessions: SessionFull[] = [];

  for (const file of facetFiles) {
    const facet = await readJsonFile<SessionFacet>(path.join(facetsDir, file));
    if (!facet) continue;

    const meta = await readJsonFile<SessionMeta>(path.join(metaDir, file));
    sessions.push({ facet, meta });
  }

  return sessions.sort((a, b) => {
    const timeA = a.meta?.start_time ? new Date(a.meta.start_time).getTime() : 0;
    const timeB = b.meta?.start_time ? new Date(b.meta.start_time).getTime() : 0;
    return timeB - timeA;
  });
}

// ── Memories ──

async function parseMemoryDir(dirPath: string, scope: string): Promise<Memory[]> {
  const files = await listMdFiles(dirPath);
  const memories: Memory[] = [];

  for (const file of files) {
    if (file === 'MEMORY.md') continue;
    const filePath = path.join(dirPath, file);
    const content = await readTextFile(filePath);
    if (!content) continue;

    try {
      const { data, content: body } = matter(content);
      memories.push({
        filePath,
        fileName: file,
        name: data.name || file.replace('.md', ''),
        type: data.type || 'unknown',
        description: data.description || '',
        body: body.trim(),
        scope,
      });
    } catch {
      memories.push({
        filePath,
        fileName: file,
        name: file.replace('.md', ''),
        type: 'unknown',
        description: '',
        body: content.trim(),
        scope,
      });
    }
  }

  return memories;
}

export async function getAllMemories(): Promise<{ global: Memory[]; projects: Record<string, Memory[]>; index: string | null }> {
  const globalDir = claudePath('memory');
  const globalMemories = await parseMemoryDir(globalDir, 'global');
  const index = await readTextFile(path.join(globalDir, 'MEMORY.md'));

  const projectsDir = claudePath('projects');
  const projectDirs = await listDir(projectsDir);
  const projects: Record<string, Memory[]> = {};

  for (const projDir of projectDirs) {
    const memDir = path.join(projectsDir, projDir, 'memory');
    if (await dirExists(memDir)) {
      const projMemories = await parseMemoryDir(memDir, projDir);
      if (projMemories.length > 0) {
        projects[projDir] = projMemories;
      }
    }
  }

  return { global: globalMemories, projects, index };
}

// ── Plugins & Skills ──

interface InstalledPluginsFile {
  version: number;
  plugins: Record<string, Array<{
    scope: string;
    installPath: string;
    version: string;
    installedAt: string;
    lastUpdated: string;
    gitCommitSha: string;
  }>>;
}

export async function getPlugins(settings: ClaudeSettings | null): Promise<Plugin[]> {
  const data = await readJsonFile<InstalledPluginsFile>(claudePath('plugins', 'installed_plugins.json'));
  if (!data) return [];

  const enabledMap = settings?.enabledPlugins || {};
  const plugins: Plugin[] = [];

  for (const [name, installs] of Object.entries(data.plugins)) {
    const install = installs[0];
    if (!install) continue;
    const shortName = name.split('@')[0];
    plugins.push({
      name: shortName,
      scope: install.scope,
      version: install.version,
      installPath: install.installPath,
      installedAt: install.installedAt,
      lastUpdated: install.lastUpdated,
      enabled: enabledMap[name] ?? false,
      gitCommitSha: install.gitCommitSha,
    });
  }

  return plugins;
}

export async function getSkills(): Promise<Skill[]> {
  const dir = claudePath('skills');
  const entries = await listDir(dir);
  const skills: Skill[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (await dirExists(fullPath)) {
      skills.push({ name: entry, path: fullPath });
    }
  }

  return skills;
}

// ── Settings ──

export async function getSettings(): Promise<ClaudeSettings | null> {
  return readJsonFile<ClaudeSettings>(claudePath('settings.json'));
}

export async function getPolicyLimits(): Promise<PolicyLimits | null> {
  return readJsonFile<PolicyLimits>(claudePath('policy-limits.json'));
}

// ── Plans ──

export async function getPlans(): Promise<PlanFile[]> {
  const dir = claudePath('plans');
  const files = await listMdFiles(dir);
  const plans: PlanFile[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = await readTextFile(filePath);
    const stats = await fileStats(filePath);
    if (content && stats) {
      plans.push({
        name: file,
        path: filePath,
        content,
        modifiedAt: stats.modifiedAt,
        sizeBytes: stats.sizeBytes,
      });
    }
  }

  return plans.sort((a, b) => b.modifiedAt - a.modifiedAt);
}

// ── Projects ──

export async function getProjects(): Promise<Project[]> {
  const projectsDir = claudePath('projects');
  const dirs = await listDir(projectsDir);
  const activeSessions = await getActiveSessions();
  const projects: Project[] = [];

  for (const dirName of dirs) {
    const projPath = path.join(projectsDir, dirName);
    if (!(await dirExists(projPath))) continue;

    const allFiles = await listDir(projPath);
    const sessionFiles = allFiles.filter(f => f.endsWith('.jsonl'));

    const memDir = path.join(projPath, 'memory');
    const hasMemories = await dirExists(memDir);

    const parts = dirName.split('-');
    const name = parts.slice(-1)[0] || dirName;

    const decodedPath = dirName.replace(/--/g, ':\\').replace(/-/g, '\\');
    const activeCount = activeSessions.filter(s =>
      s.cwd.replace(/\//g, '\\').includes(decodedPath.split('\\').pop() || '')
    ).length;

    let lastActivity = 0;
    for (const f of sessionFiles) {
      const stats = await fileStats(path.join(projPath, f));
      if (stats && stats.modifiedAt > lastActivity) {
        lastActivity = stats.modifiedAt;
      }
    }

    projects.push({
      name,
      slug: dirName,
      dirName,
      sessionCount: sessionFiles.length,
      lastActivity,
      hasMemories,
      activeSessionCount: activeCount,
    });
  }

  return projects.sort((a, b) => b.lastActivity - a.lastActivity);
}

// ── History ──

export async function getHistory(query?: string, page: number = 1, perPage: number = 50): Promise<{ entries: HistoryEntry[]; total: number }> {
  const filePath = claudePath('history.jsonl');
  const content = await readTextFile(filePath);
  if (!content) return { entries: [], total: 0 };

  let entries: HistoryEntry[] = content
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try { return JSON.parse(line) as HistoryEntry; }
      catch { return null; }
    })
    .filter((e): e is HistoryEntry => e !== null);

  entries.reverse();

  if (query) {
    const q = query.toLowerCase();
    entries = entries.filter(e => e.display.toLowerCase().includes(q));
  }

  const total = entries.length;
  const start = (page - 1) * perPage;
  const paged = entries.slice(start, start + perPage);

  return { entries: paged, total };
}

// ── Usage Stats ──

export async function getUsageStats(): Promise<UsageStats> {
  const metaDir = claudePath('usage-data', 'session-meta');
  const files = await listJsonFiles(metaDir);

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalDurationMinutes = 0;
  let totalLinesAdded = 0;
  let totalLinesRemoved = 0;
  let totalFilesModified = 0;

  const dailyMap = new Map<string, DailyUsage>();
  const projectMap = new Map<string, ProjectUsage>();

  for (const file of files) {
    const meta = await readJsonFile<SessionMeta>(path.join(metaDir, file));
    if (!meta) continue;

    totalInputTokens += meta.input_tokens || 0;
    totalOutputTokens += meta.output_tokens || 0;
    totalDurationMinutes += meta.duration_minutes || 0;
    totalLinesAdded += meta.lines_added || 0;
    totalLinesRemoved += meta.lines_removed || 0;
    totalFilesModified += meta.files_modified || 0;

    if (meta.start_time) {
      const date = meta.start_time.split('T')[0];
      const existing = dailyMap.get(date) || { date, sessions: 0, inputTokens: 0, outputTokens: 0, durationMinutes: 0 };
      existing.sessions += 1;
      existing.inputTokens += meta.input_tokens || 0;
      existing.outputTokens += meta.output_tokens || 0;
      existing.durationMinutes += meta.duration_minutes || 0;
      dailyMap.set(date, existing);
    }

    if (meta.project_path) {
      const projName = meta.project_path.split(/[/\\]/).pop() || meta.project_path;
      const existing = projectMap.get(projName) || { project: projName, sessions: 0, inputTokens: 0, outputTokens: 0 };
      existing.sessions += 1;
      existing.inputTokens += meta.input_tokens || 0;
      existing.outputTokens += meta.output_tokens || 0;
      projectMap.set(projName, existing);
    }
  }

  const dailyUsage = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const projectBreakdown = Array.from(projectMap.values()).sort((a, b) => b.sessions - a.sessions);

  return {
    totalSessions: files.length,
    totalInputTokens,
    totalOutputTokens,
    totalDurationMinutes,
    totalLinesAdded,
    totalLinesRemoved,
    totalFilesModified,
    dailyUsage,
    projectBreakdown,
  };
}
