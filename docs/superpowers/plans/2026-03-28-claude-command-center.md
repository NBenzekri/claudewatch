# Claude Command Center — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Next.js dashboard that reads `~/.claude/` and presents all Claude Code activity, sessions, memories, plugins, costs, and settings in one live-updating UI.

**Architecture:** Next.js 15 App Router with API Route Handlers that read `~/.claude/` filesystem. React Query polls endpoints for live refresh. shadcn/ui + Tailwind for deep navy/indigo themed UI. No database.

**Tech Stack:** Next.js 16, React 19, TypeScript, shadcn/ui, Tailwind CSS v4, TanStack React Query v5, Recharts, Lucide Icons

---

## File Map

```
claudeCommandCenter/
├── app/
│   ├── layout.tsx                    # Root layout: sidebar + QueryProvider
│   ├── page.tsx                      # Overview dashboard
│   ├── sessions/page.tsx             # Sessions list + history
│   ├── memories/page.tsx             # Memory viewer/editor
│   ├── plugins/page.tsx              # Plugins & skills
│   ├── settings/page.tsx             # Config viewer
│   ├── costs/page.tsx                # Usage & cost charts
│   ├── plans/page.tsx                # Plans viewer
│   ├── projects/
│   │   ├── page.tsx                  # Projects grid
│   │   └── [slug]/page.tsx           # Single project detail
│   ├── history/page.tsx              # Prompt history search
│   ├── providers.tsx                 # QueryClientProvider (client component)
│   └── api/
│       ├── sessions/route.ts         # GET active sessions
│       ├── sessions/history/route.ts # GET session facets + meta
│       ├── memories/route.ts         # GET/PUT/DELETE memories
│       ├── plugins/route.ts          # GET plugins + skills
│       ├── settings/route.ts         # GET settings + policies
│       ├── usage/route.ts            # GET usage stats from session-meta
│       ├── plans/route.ts            # GET plan files
│       ├── projects/route.ts         # GET all projects
│       ├── projects/[slug]/route.ts  # GET single project detail
│       ├── history/route.ts          # GET prompt history (paginated)
│       └── health/route.ts           # GET health check
├── components/
│   ├── layout/
│   │   └── sidebar.tsx               # Icon sidebar nav
│   ├── ui/                           # shadcn/ui components (auto-generated)
│   ├── dashboard/
│   │   ├── stat-card.tsx             # Reusable stat card
│   │   ├── activity-feed.tsx         # Recent sessions feed
│   │   └── usage-chart.tsx           # Mini bar chart
│   ├── sessions/
│   │   ├── session-list.tsx          # Filterable session list
│   │   └── session-detail.tsx        # Expandable session detail
│   ├── memories/
│   │   ├── memory-card.tsx           # Memory display card
│   │   └── memory-editor.tsx         # Inline editor
│   ├── plugins/
│   │   └── plugin-card.tsx           # Plugin display card
│   ├── plans/
│   │   └── plan-viewer.tsx           # Markdown plan preview
│   └── projects/
│       └── project-card.tsx          # Project overview card
├── hooks/
│   └── use-claude-data.ts            # All React Query hooks
├── lib/
│   ├── claude-fs.ts                  # Core: resolve ~/.claude, read helpers
│   ├── parsers.ts                    # Parse JSONL, facets, session-meta, memories
│   ├── types.ts                      # All TypeScript interfaces
│   └── utils.ts                      # cn() helper, formatters
├── .env.example                      # CLAUDE_HOME, PORT, REFRESH_INTERVAL
├── next.config.ts
└── package.json
```

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `app/globals.css`, `.env.example`, `.gitignore`

- [ ] **Step 1: Initialize Next.js 16 project**

Run in `D:/dev/claudeCommandCenter`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --turbopack
```
Expected: Project scaffolded with Next.js 16.x, `app/` directory, `package.json`, `next.config.ts`. Next.js 16 has built-in memoization for fetch and server components.

- [ ] **Step 2: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```
When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**
- Leave tailwind config blank (Tailwind v4 mode)

Expected: `components.json` created, `lib/utils.ts` created, `app/globals.css` updated

- [ ] **Step 3: Install additional dependencies**

```bash
npm install @tanstack/react-query recharts react-is gray-matter
```

- `@tanstack/react-query` — data fetching + polling
- `recharts` + `react-is` — charts
- `gray-matter` — parse YAML frontmatter from memory files

- [ ] **Step 4: Add shadcn/ui components we'll need**

```bash
npx shadcn@latest add button card badge tabs input dialog scroll-area separator tooltip
```

- [ ] **Step 5: Create `.env.example`**

Create `.env.example`:
```env
# Path to Claude config directory (auto-detected if not set)
# CLAUDE_HOME=~/.claude

# Dashboard port (default: 3000)
# PORT=3000

# Polling interval in milliseconds (default: 5000)
# REFRESH_INTERVAL=5000
```

- [ ] **Step 6: Update `.gitignore`**

Append to `.gitignore`:
```
.superpowers/
```

- [ ] **Step 7: Apply deep navy theme to globals.css**

Replace the shadcn theme variables in `app/globals.css` dark mode section with:

```css
:root {
  --background: 222 47% 5%;
  --foreground: 210 40% 98%;
  --card: 217 33% 10%;
  --card-foreground: 210 40% 98%;
  --popover: 217 33% 10%;
  --popover-foreground: 210 40% 98%;
  --primary: 239 84% 67%;
  --primary-foreground: 0 0% 100%;
  --secondary: 217 33% 14%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217 33% 14%;
  --muted-foreground: 215 20% 55%;
  --accent: 217 33% 14%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 217 33% 14%;
  --input: 217 33% 14%;
  --ring: 239 84% 67%;
  --radius: 0.5rem;
}
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```
Expected: Server starts on `http://localhost:3000`, no errors

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 16 project with shadcn/ui and dependencies"
```

---

### Task 2: TypeScript Types & Core Data Layer

**Files:**
- Create: `lib/types.ts`, `lib/claude-fs.ts`, `lib/parsers.ts`

- [ ] **Step 1: Create type definitions**

Create `lib/types.ts`:
```typescript
// Active session from sessions/*.json
export interface ActiveSession {
  pid: number;
  sessionId: string;
  cwd: string;
  startedAt: number;
  kind: string;
  entrypoint: string;
}

// Session facet from usage-data/facets/*.json
export interface SessionFacet {
  session_id: string;
  brief_summary: string;
  underlying_goal: string;
  goal_categories: Record<string, number>;
  outcome: 'fully_achieved' | 'partially_achieved' | 'mostly_achieved';
  user_satisfaction_counts: Record<string, number>;
  claude_helpfulness: 'essential' | 'very_helpful' | 'moderately_helpful';
  session_type: string;
  friction_counts: Record<string, number>;
  friction_detail: string;
  primary_success: string;
}

// Session metadata from usage-data/session-meta/*.json
export interface SessionMeta {
  session_id: string;
  project_path: string;
  start_time: string;
  duration_minutes: number;
  user_message_count: number;
  assistant_message_count: number;
  tool_counts: Record<string, number>;
  languages: Record<string, number>;
  git_commits: number;
  git_pushes: number;
  input_tokens: number;
  output_tokens: number;
  first_prompt: string;
  user_interruptions: number;
  tool_errors: number;
  tool_error_categories: Record<string, number>;
  uses_task_agent: boolean;
  uses_mcp: boolean;
  uses_web_search: boolean;
  uses_web_fetch: boolean;
  lines_added: number;
  lines_removed: number;
  files_modified: number;
}

// Combined session with both facet + meta
export interface SessionFull {
  facet: SessionFacet;
  meta: SessionMeta | null;
}

// Memory file
export interface Memory {
  filePath: string;
  fileName: string;
  name: string;
  type: 'user' | 'feedback' | 'project' | 'reference' | 'unknown';
  description: string;
  body: string;
  scope: string; // 'global' or project name
}

// Plugin
export interface Plugin {
  name: string;
  scope: string;
  version: string;
  installPath: string;
  installedAt: string;
  lastUpdated: string;
  enabled: boolean;
  gitCommitSha: string;
}

// Custom skill
export interface Skill {
  name: string;
  path: string;
}

// Settings
export interface ClaudeSettings {
  model: string;
  enabledPlugins: Record<string, boolean>;
  autoUpdatesChannel: string;
  voiceEnabled: boolean;
  statusLine: {
    type: string;
    command: string;
  } | null;
}

// Policy limits
export interface PolicyLimits {
  restrictions: Record<string, { allowed: boolean }>;
}

// History entry from history.jsonl
export interface HistoryEntry {
  display: string;
  pastedContents: Record<string, unknown>;
  timestamp: number;
  project: string;
  sessionId: string;
}

// Plan file
export interface PlanFile {
  name: string;
  path: string;
  content: string;
  modifiedAt: number;
  sizeBytes: number;
}

// Project
export interface Project {
  name: string;
  slug: string;
  dirName: string;
  sessionCount: number;
  lastActivity: number;
  hasMemories: boolean;
  activeSessionCount: number;
}

// Usage/cost aggregation
export interface UsageStats {
  totalSessions: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalDurationMinutes: number;
  totalLinesAdded: number;
  totalLinesRemoved: number;
  totalFilesModified: number;
  dailyUsage: DailyUsage[];
  projectBreakdown: ProjectUsage[];
}

export interface DailyUsage {
  date: string;
  sessions: number;
  inputTokens: number;
  outputTokens: number;
  durationMinutes: number;
}

export interface ProjectUsage {
  project: string;
  sessions: number;
  inputTokens: number;
  outputTokens: number;
}

// Health check
export interface HealthStatus {
  ok: boolean;
  claudeHome: string;
  cliVersion: string | null;
  platform: string;
}
```

- [ ] **Step 2: Create claude-fs.ts**

Create `lib/claude-fs.ts`:
```typescript
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

export function getClaudeHome(): string {
  if (process.env.CLAUDE_HOME) {
    return process.env.CLAUDE_HOME;
  }
  return path.join(os.homedir(), '.claude');
}

export function claudePath(...segments: string[]): string {
  return path.join(getClaudeHome(), ...segments);
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function writeTextFile(filePath: string, content: string): Promise<boolean> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listDir(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

export async function listJsonFiles(dirPath: string): Promise<string[]> {
  const files = await listDir(dirPath);
  return files.filter(f => f.endsWith('.json'));
}

export async function listMdFiles(dirPath: string): Promise<string[]> {
  const files = await listDir(dirPath);
  return files.filter(f => f.endsWith('.md'));
}

export async function fileStats(filePath: string): Promise<{ modifiedAt: number; sizeBytes: number } | null> {
  try {
    const stat = await fs.stat(filePath);
    return { modifiedAt: stat.mtimeMs, sizeBytes: stat.size };
  } catch {
    return null;
  }
}

export async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Create parsers.ts**

Create `lib/parsers.ts`:
```typescript
import fs from 'fs/promises';
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

  // Sort by start_time (from meta) or by filename
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
    if (file === 'MEMORY.md') continue; // index file, not a memory
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
      // Not a frontmatter file, treat as plain markdown
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
  // Global memories
  const globalDir = claudePath('memory');
  const globalMemories = await parseMemoryDir(globalDir, 'global');
  const index = await readTextFile(path.join(globalDir, 'MEMORY.md'));

  // Per-project memories
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
    const install = installs[0]; // take first install
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

    // Count session JSONL files
    const allFiles = await listDir(projPath);
    const sessionFiles = allFiles.filter(f => f.endsWith('.jsonl'));

    // Check for memories
    const memDir = path.join(projPath, 'memory');
    const hasMemories = await dirExists(memDir);

    // Derive readable name from directory name (D--dev-MarocBooking-marocbooking-front -> marocbooking-front)
    const parts = dirName.split('-');
    const name = parts.slice(-1)[0] || dirName;

    // Count active sessions for this project
    const decodedPath = dirName.replace(/--/g, ':\\').replace(/-/g, '\\');
    const activeCount = activeSessions.filter(s =>
      s.cwd.replace(/\//g, '\\').includes(decodedPath.split('\\').pop() || '')
    ).length;

    // Find last activity from session file modification times
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

  // Reverse for newest first
  entries.reverse();

  // Search filter
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

    // Daily aggregation
    if (meta.start_time) {
      const date = meta.start_time.split('T')[0];
      const existing = dailyMap.get(date) || { date, sessions: 0, inputTokens: 0, outputTokens: 0, durationMinutes: 0 };
      existing.sessions += 1;
      existing.inputTokens += meta.input_tokens || 0;
      existing.outputTokens += meta.output_tokens || 0;
      existing.durationMinutes += meta.duration_minutes || 0;
      dailyMap.set(date, existing);
    }

    // Project aggregation
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
```

- [ ] **Step 4: Verify types compile**

```bash
npx tsc --noEmit lib/types.ts
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add lib/
git commit -m "feat: add TypeScript types, claude-fs helpers, and data parsers"
```

---

### Task 3: React Query Provider & Hooks

**Files:**
- Create: `app/providers.tsx`, `hooks/use-claude-data.ts`

- [ ] **Step 1: Create QueryClient provider**

Create `app/providers.tsx`:
```tsx
'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Create all React Query hooks**

Create `hooks/use-claude-data.ts`:
```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '5000', 10);

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Active sessions — fast polling
export function useActiveSessions() {
  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: () => fetchApi('/api/sessions'),
    refetchInterval: REFRESH_INTERVAL,
  });
}

// Session history — moderate polling
export function useSessionHistory() {
  return useQuery({
    queryKey: ['sessions', 'history'],
    queryFn: () => fetchApi('/api/sessions/history'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

// Memories
export function useMemories() {
  return useQuery({
    queryKey: ['memories'],
    queryFn: () => fetchApi('/api/memories'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

// Update memory
export function useUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ filePath, content }: { filePath: string; content: string }) => {
      const res = await fetch('/api/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content }),
      });
      if (!res.ok) throw new Error('Failed to update memory');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memories'] }),
  });
}

// Delete memory
export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filePath: string) => {
      const res = await fetch('/api/memories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
      if (!res.ok) throw new Error('Failed to delete memory');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memories'] }),
  });
}

// Plugins & skills — slow polling
export function usePlugins() {
  return useQuery({
    queryKey: ['plugins'],
    queryFn: () => fetchApi('/api/plugins'),
    refetchInterval: 30000,
  });
}

// Settings — slow polling
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchApi('/api/settings'),
    refetchInterval: 30000,
  });
}

// Usage stats
export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: () => fetchApi('/api/usage'),
    refetchInterval: REFRESH_INTERVAL * 3,
  });
}

// Plans
export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => fetchApi('/api/plans'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

// Projects
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/api/projects'),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

// Single project
export function useProject(slug: string) {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: () => fetchApi(`/api/projects/${slug}`),
    refetchInterval: REFRESH_INTERVAL * 2,
  });
}

// History — on-demand, not polling
export function useHistory(query: string, page: number) {
  return useQuery({
    queryKey: ['history', query, page],
    queryFn: () => fetchApi(`/api/history?q=${encodeURIComponent(query)}&page=${page}`),
    enabled: true,
  });
}

// Health check
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => fetchApi('/api/health'),
    refetchInterval: 30000,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/providers.tsx hooks/
git commit -m "feat: add React Query provider and data hooks"
```

---

### Task 4: All API Route Handlers

**Files:**
- Create: `app/api/sessions/route.ts`, `app/api/sessions/history/route.ts`, `app/api/memories/route.ts`, `app/api/plugins/route.ts`, `app/api/settings/route.ts`, `app/api/usage/route.ts`, `app/api/plans/route.ts`, `app/api/projects/route.ts`, `app/api/projects/[slug]/route.ts`, `app/api/history/route.ts`, `app/api/health/route.ts`

- [ ] **Step 1: Create sessions route**

Create `app/api/sessions/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getActiveSessions } from '@/lib/parsers';

export async function GET() {
  const sessions = await getActiveSessions();
  return NextResponse.json(sessions);
}
```

- [ ] **Step 2: Create sessions history route**

Create `app/api/sessions/history/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getSessionHistory } from '@/lib/parsers';

export async function GET() {
  const history = await getSessionHistory();
  return NextResponse.json(history);
}
```

- [ ] **Step 3: Create memories route (GET/PUT/DELETE)**

Create `app/api/memories/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAllMemories } from '@/lib/parsers';
import { writeTextFile, deleteFile, getClaudeHome } from '@/lib/claude-fs';
import path from 'path';

export async function GET() {
  const memories = await getAllMemories();
  return NextResponse.json(memories);
}

export async function PUT(request: NextRequest) {
  const { filePath, content } = await request.json();

  // Security: ensure path is within claude home
  const claudeHome = getClaudeHome();
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(claudeHome))) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  const success = await writeTextFile(resolved, content);
  if (!success) {
    return NextResponse.json({ error: 'Failed to write' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const { filePath } = await request.json();

  const claudeHome = getClaudeHome();
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(claudeHome))) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  const success = await deleteFile(resolved);
  if (!success) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Create plugins route**

Create `app/api/plugins/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getPlugins, getSkills, getSettings } from '@/lib/parsers';

export async function GET() {
  const settings = await getSettings();
  const plugins = await getPlugins(settings);
  const skills = await getSkills();
  return NextResponse.json({ plugins, skills });
}
```

- [ ] **Step 5: Create settings route**

Create `app/api/settings/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getSettings, getPolicyLimits } from '@/lib/parsers';
import { readTextFile, claudePath } from '@/lib/claude-fs';

export async function GET() {
  const settings = await getSettings();
  const policies = await getPolicyLimits();
  const claudeMd = await readTextFile(claudePath('CLAUDE.md'));

  let cliVersion: string | null = null;
  try {
    const { execSync } = require('child_process');
    cliVersion = execSync('claude --version', { encoding: 'utf-8' }).trim();
  } catch { /* CLI not in PATH */ }

  return NextResponse.json({ settings, policies, claudeMd, cliVersion });
}
```

- [ ] **Step 6: Create usage route**

Create `app/api/usage/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/parsers';

export async function GET() {
  const stats = await getUsageStats();
  return NextResponse.json(stats);
}
```

- [ ] **Step 7: Create plans route**

Create `app/api/plans/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getPlans } from '@/lib/parsers';

export async function GET() {
  const plans = await getPlans();
  return NextResponse.json(plans);
}
```

- [ ] **Step 8: Create projects routes**

Create `app/api/projects/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/parsers';

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}
```

Create `app/api/projects/[slug]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { claudePath, readTextFile, listDir, dirExists } from '@/lib/claude-fs';
import { getActiveSessions } from '@/lib/parsers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const projDir = claudePath('projects', slug);

  if (!(await dirExists(projDir))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const allFiles = await listDir(projDir);
  const sessionFiles = allFiles.filter(f => f.endsWith('.jsonl'));

  // Check for project-level CLAUDE.md (look in the actual project directory)
  // The slug is the encoded path, decode it
  const decodedPath = slug.replace(/--/g, ':/').replace(/-/g, '/');
  const projectClaudeMd = await readTextFile(path.join(decodedPath, 'CLAUDE.md'));

  // Check for project memories
  const memDir = path.join(projDir, 'memory');
  const hasMemories = await dirExists(memDir);
  let memoryFiles: string[] = [];
  if (hasMemories) {
    memoryFiles = (await listDir(memDir)).filter(f => f.endsWith('.md'));
  }

  const activeSessions = await getActiveSessions();

  return NextResponse.json({
    slug,
    sessionCount: sessionFiles.length,
    sessionFiles,
    hasMemories,
    memoryFiles,
    projectClaudeMd,
    activeSessions: activeSessions.filter(s =>
      s.cwd.replace(/\//g, '\\').includes(slug.split('-').pop() || '')
    ),
  });
}
```

- [ ] **Step 9: Create history route**

Create `app/api/history/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getHistory } from '@/lib/parsers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const result = await getHistory(query || undefined, page);
  return NextResponse.json(result);
}
```

- [ ] **Step 10: Create health route**

Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getClaudeHome, dirExists } from '@/lib/claude-fs';
import os from 'os';

export async function GET() {
  const claudeHome = getClaudeHome();
  const exists = await dirExists(claudeHome);

  let cliVersion: string | null = null;
  try {
    const { execSync } = require('child_process');
    cliVersion = execSync('claude --version', { encoding: 'utf-8' }).trim();
  } catch { /* CLI not in PATH */ }

  return NextResponse.json({
    ok: exists,
    claudeHome,
    cliVersion,
    platform: os.platform(),
  });
}
```

- [ ] **Step 11: Verify all routes compile**

```bash
npm run build
```
Expected: Build succeeds with no type errors

- [ ] **Step 12: Commit**

```bash
git add app/api/
git commit -m "feat: add all API route handlers for Claude data"
```

---

### Task 5: Sidebar Layout & Root Layout

**Files:**
- Create: `components/layout/sidebar.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create sidebar component**

Create `components/layout/sidebar.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  Brain,
  Plug,
  Settings,
  BarChart3,
  FileText,
  FolderOpen,
  History,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Overview' },
  { href: '/sessions', icon: Zap, label: 'Sessions' },
  { href: '/memories', icon: Brain, label: 'Memories' },
  { href: '/plugins', icon: Plug, label: 'Plugins & Skills' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/costs', icon: BarChart3, label: 'Usage & Costs' },
  { href: '/plans', icon: FileText, label: 'Plans' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/history', icon: History, label: 'History' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[56px] flex-col items-center border-r border-border bg-card py-4">
        {/* Logo */}
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          CC
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
```

- [ ] **Step 2: Update root layout**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Sidebar from '@/components/layout/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Claude Command Center',
  description: 'Local dashboard for Claude Code activity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <Sidebar />
          <main className="ml-[56px] min-h-screen p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify layout renders**

```bash
npm run dev
```
Open `http://localhost:3000` — should see sidebar with icons on deep navy background.

- [ ] **Step 4: Commit**

```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: add icon sidebar navigation and root layout"
```

---

### Task 6: Overview Dashboard Page

**Files:**
- Create: `components/dashboard/stat-card.tsx`, `components/dashboard/activity-feed.tsx`, `components/dashboard/usage-chart.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create stat card component**

Create `components/dashboard/stat-card.tsx`:
```tsx
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'indigo' | 'emerald' | 'amber' | 'red';
}

const colorMap = {
  indigo: 'border-primary/20 text-primary',
  emerald: 'border-emerald-500/20 text-emerald-400',
  amber: 'border-amber-500/20 text-amber-400',
  red: 'border-red-500/20 text-red-400',
};

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', colorMap[color])}>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create activity feed component**

Create `components/dashboard/activity-feed.tsx`:
```tsx
'use client';

import type { SessionFull } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  sessions: SessionFull[];
}

export default function ActivityFeed({ sessions }: ActivityFeedProps) {
  return (
    <div className="rounded-lg bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">Recent Activity</h3>
      <div className="space-y-2">
        {sessions.slice(0, 10).map((session, i) => {
          const isActive = !session.facet.outcome;
          const outcomeColor = session.facet.outcome === 'fully_achieved'
            ? 'bg-emerald-400'
            : session.facet.outcome === 'partially_achieved'
              ? 'bg-amber-400'
              : 'bg-muted-foreground/30';

          return (
            <div
              key={session.facet.session_id || i}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-secondary/50"
            >
              <div className={cn(
                'h-1.5 w-1.5 rounded-full flex-shrink-0',
                isActive ? 'bg-emerald-400 animate-pulse' : outcomeColor
              )} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-foreground/80">
                  {session.facet.brief_summary || session.facet.underlying_goal || 'Session'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.meta?.project_path?.split(/[/\\]/).pop() || 'unknown'}
                  {session.meta?.duration_minutes ? ` · ${session.meta.duration_minutes}min` : ''}
                  {session.facet.outcome ? ` · ${session.facet.outcome.replace('_', ' ')}` : ''}
                </p>
              </div>
            </div>
          );
        })}
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">No session history found</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create usage mini-chart**

Create `components/dashboard/usage-chart.tsx`:
```tsx
'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyUsage } from '@/lib/types';

interface UsageChartProps {
  data: DailyUsage[];
}

export default function UsageChart({ data }: UsageChartProps) {
  // Show last 7 days
  const recent = data.slice(-7);

  return (
    <div className="rounded-lg bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">Usage (7 days)</h3>
      {recent.length > 0 ? (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={recent}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
              tickFormatter={(d: string) => d.slice(5)} // MM-DD
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <Bar dataKey="sessions" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-muted-foreground">No usage data yet</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Build overview page**

Replace `app/page.tsx`:
```tsx
'use client';

import { useActiveSessions, useSessionHistory, useProjects, usePlugins, useUsage } from '@/hooks/use-claude-data';
import StatCard from '@/components/dashboard/stat-card';
import ActivityFeed from '@/components/dashboard/activity-feed';
import UsageChart from '@/components/dashboard/usage-chart';

export default function OverviewPage() {
  const { data: activeSessions } = useActiveSessions();
  const { data: sessionHistory } = useSessionHistory();
  const { data: projects } = useProjects();
  const { data: pluginsData } = usePlugins();
  const { data: usage } = useUsage();

  const activeCount = Array.isArray(activeSessions) ? activeSessions.length : 0;
  const totalSessions = usage?.totalSessions || 0;
  const projectCount = Array.isArray(projects) ? projects.length : 0;
  const pluginCount = pluginsData?.plugins ? pluginsData.plugins.length : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Sessions" value={activeCount} color="indigo" />
        <StatCard label="Total Sessions" value={totalSessions} color="emerald" />
        <StatCard label="Projects" value={projectCount} color="amber" />
        <StatCard label="Plugins" value={pluginCount} color="red" />
      </div>

      {/* Two column: Activity + Chart */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-3">
          <ActivityFeed sessions={sessionHistory || []} />
        </div>
        <div className="md:col-span-2">
          <UsageChart data={usage?.dailyUsage || []} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify overview renders with live data**

```bash
npm run dev
```
Open `http://localhost:3000` — should see stat cards, activity feed, and chart populated from `~/.claude/` data.

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/ app/page.tsx
git commit -m "feat: add overview dashboard with stat cards, activity feed, and usage chart"
```

---

### Task 7: Sessions Page

**Files:**
- Create: `components/sessions/session-list.tsx`, `components/sessions/session-detail.tsx`, `app/sessions/page.tsx`

- [ ] **Step 1: Create session detail component**

Create `components/sessions/session-detail.tsx`:
```tsx
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
```

- [ ] **Step 2: Create session list component**

Create `components/sessions/session-list.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { SessionFull, ActiveSession } from '@/lib/types';
import SessionDetail from './session-detail';

interface SessionListProps {
  sessions: SessionFull[];
  activeSessions: ActiveSession[];
}

export default function SessionList({ sessions, activeSessions }: SessionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filtered = filter === 'active'
    ? sessions.filter(s => !s.facet.outcome)
    : filter === 'completed'
      ? sessions.filter(s => s.facet.outcome)
      : sessions;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Active sessions banner */}
      {activeSessions.length > 0 && (
        <div className="mb-4 space-y-2">
          {activeSessions.map((s) => (
            <div key={s.pid} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">Active — PID {s.pid}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {s.cwd} · {s.kind} · started {new Date(s.startedAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Session list */}
      <div className="space-y-2">
        {filtered.map((session, i) => {
          const id = session.facet.session_id || `session-${i}`;
          const isExpanded = expandedId === id;
          const outcomeColor = session.facet.outcome === 'fully_achieved'
            ? 'border-l-emerald-500'
            : session.facet.outcome === 'partially_achieved'
              ? 'border-l-amber-500'
              : 'border-l-primary';

          return (
            <div
              key={id}
              className={`rounded-lg bg-card border-l-[3px] p-3 cursor-pointer hover:bg-secondary/30 ${outcomeColor}`}
              onClick={() => setExpandedId(isExpanded ? null : id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.facet.brief_summary || session.facet.underlying_goal || 'Session'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.meta?.project_path?.split(/[/\\]/).pop() || 'unknown'}
                    {session.meta?.duration_minutes ? ` · ${session.meta.duration_minutes}min` : ''}
                    {session.facet.session_type ? ` · ${session.facet.session_type}` : ''}
                  </p>
                </div>
                {session.facet.outcome && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {session.facet.outcome.replace('_', ' ')}
                  </span>
                )}
              </div>
              {isExpanded && <SessionDetail session={session} />}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No sessions found</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create sessions page**

Create `app/sessions/page.tsx`:
```tsx
'use client';

import { useActiveSessions, useSessionHistory } from '@/hooks/use-claude-data';
import SessionList from '@/components/sessions/session-list';

export default function SessionsPage() {
  const { data: activeSessions } = useActiveSessions();
  const { data: sessionHistory } = useSessionHistory();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sessions</h1>
      <SessionList
        sessions={sessionHistory || []}
        activeSessions={activeSessions || []}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify sessions page**

Navigate to `http://localhost:3000/sessions` — should show session list with expandable details.

- [ ] **Step 5: Commit**

```bash
git add components/sessions/ app/sessions/
git commit -m "feat: add sessions page with filterable list and expandable details"
```

---

### Task 8: Memories Page with Edit/Delete

**Files:**
- Create: `components/memories/memory-card.tsx`, `components/memories/memory-editor.tsx`, `app/memories/page.tsx`

- [ ] **Step 1: Create memory card**

Create `components/memories/memory-card.tsx`:
```tsx
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
```

- [ ] **Step 2: Create memory editor**

Create `components/memories/memory-editor.tsx`:
```tsx
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
  // Reconstruct full file content with frontmatter
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
```

- [ ] **Step 3: Create memories page**

Create `app/memories/page.tsx`:
```tsx
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

      {/* MEMORY.md index */}
      {index && (
        <div className="rounded-lg bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-2">Memory Index (MEMORY.md)</h3>
          <pre className="whitespace-pre-wrap text-xs text-foreground/60 bg-background/50 rounded p-3 max-h-60 overflow-y-auto">
            {index}
          </pre>
        </div>
      )}

      {/* Tabs */}
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

      {/* Memory cards */}
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
```

- [ ] **Step 4: Verify memories page with edit/delete**

Navigate to `http://localhost:3000/memories` — should show memories with edit/delete buttons.

- [ ] **Step 5: Commit**

```bash
git add components/memories/ app/memories/
git commit -m "feat: add memories page with inline editing and delete"
```

---

### Task 9: Plugins & Skills Page

**Files:**
- Create: `components/plugins/plugin-card.tsx`, `app/plugins/page.tsx`

- [ ] **Step 1: Create plugin card**

Create `components/plugins/plugin-card.tsx`:
```tsx
import type { Plugin } from '@/lib/types';

interface PluginCardProps {
  plugin: Plugin;
}

export default function PluginCard({ plugin }: PluginCardProps) {
  return (
    <div className="rounded-lg bg-card p-4 flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary text-lg font-bold flex-shrink-0">
        {plugin.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{plugin.name}</p>
          {plugin.version && plugin.version !== 'unknown' && (
            <span className="text-xs text-muted-foreground">v{plugin.version}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Updated {new Date(plugin.lastUpdated).toLocaleDateString()}
          {plugin.scope ? ` · ${plugin.scope}` : ''}
        </p>
      </div>
      <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${plugin.enabled ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
    </div>
  );
}
```

- [ ] **Step 2: Create plugins page**

Create `app/plugins/page.tsx`:
```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add components/plugins/ app/plugins/
git commit -m "feat: add plugins and skills page"
```

---

### Task 10: Settings Page

**Files:**
- Create: `app/settings/page.tsx`

- [ ] **Step 1: Create settings page**

Create `app/settings/page.tsx`:
```tsx
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
    { label: 'Platform', value: typeof window !== 'undefined' ? navigator.platform : '—' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings & Config</h1>

      {/* Key-value config */}
      <div className="space-y-2">
        {configItems.map((item) => (
          <div key={item.label} className="rounded-lg bg-card p-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Enabled plugins */}
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

      {/* Policy limits */}
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

      {/* CLAUDE.md */}
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
```

- [ ] **Step 2: Commit**

```bash
git add app/settings/
git commit -m "feat: add settings and config page"
```

---

### Task 11: Usage & Costs Page

**Files:**
- Create: `app/costs/page.tsx`

- [ ] **Step 1: Create costs page**

Create `app/costs/page.tsx`:
```tsx
'use client';

import { useUsage } from '@/hooks/use-claude-data';
import StatCard from '@/components/dashboard/stat-card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#34d399', '#fbbf24'];

export default function CostsPage() {
  const { data: usage } = useUsage();

  if (!usage) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usage & Costs</h1>
        <p className="text-sm text-muted-foreground">Loading usage data...</p>
      </div>
    );
  }

  const totalTokens = usage.totalInputTokens + usage.totalOutputTokens;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usage & Costs</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Sessions" value={usage.totalSessions} color="indigo" />
        <StatCard label="Total Tokens" value={`${(totalTokens / 1_000_000).toFixed(1)}M`} color="emerald" />
        <StatCard label="Total Duration" value={`${Math.round(usage.totalDurationMinutes / 60)}h`} color="amber" />
        <StatCard label="Files Modified" value={usage.totalFilesModified} color="red" />
      </div>

      {/* Code stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Lines Added</p>
          <p className="text-xl font-bold text-emerald-400">+{usage.totalLinesAdded.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Lines Removed</p>
          <p className="text-xl font-bold text-red-400">-{usage.totalLinesRemoved.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Input / Output Tokens</p>
          <p className="text-sm font-medium text-foreground/80">
            {(usage.totalInputTokens / 1000).toFixed(0)}k / {(usage.totalOutputTokens / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Daily usage chart */}
      <div className="rounded-lg bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Daily Sessions</h3>
        {usage.dailyUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usage.dailyUsage}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                tickFormatter={(d: string) => d.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="sessions" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">No daily data available</p>
        )}
      </div>

      {/* Per-project breakdown */}
      <div className="rounded-lg bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">By Project</h3>
        {usage.projectBreakdown.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={usage.projectBreakdown}
                  dataKey="sessions"
                  nameKey="project"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ project }) => project}
                >
                  {usage.projectBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {usage.projectBreakdown.map((proj, i) => (
                <div key={proj.project} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-foreground/80 flex-1 truncate">{proj.project}</span>
                  <span className="text-xs text-muted-foreground">{proj.sessions} sessions</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No project data available</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/costs/
git commit -m "feat: add usage and costs page with charts"
```

---

### Task 12: Plans Page

**Files:**
- Create: `components/plans/plan-viewer.tsx`, `app/plans/page.tsx`

- [ ] **Step 1: Create plan viewer**

Create `components/plans/plan-viewer.tsx`:
```tsx
interface PlanViewerProps {
  content: string;
}

export default function PlanViewer({ content }: PlanViewerProps) {
  return (
    <div className="rounded-lg bg-card p-4">
      <pre className="whitespace-pre-wrap text-xs text-foreground/70 font-mono leading-relaxed max-h-[70vh] overflow-y-auto">
        {content}
      </pre>
    </div>
  );
}
```

- [ ] **Step 2: Create plans page**

Create `app/plans/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { usePlans } from '@/hooks/use-claude-data';
import PlanViewer from '@/components/plans/plan-viewer';
import type { PlanFile } from '@/lib/types';

export default function PlansPage() {
  const { data: plans } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<PlanFile | null>(null);

  const isRecent = (modifiedAt: number) => Date.now() - modifiedAt < 3600000; // 1 hour

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plans</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Plan list */}
        <div className="space-y-2">
          {(plans || []).map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className={`rounded-lg bg-card p-3 cursor-pointer hover:bg-secondary/30 transition-colors ${
                selectedPlan?.name === plan.name ? 'ring-1 ring-primary' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate flex-1">{plan.name}</p>
                {isRecent(plan.modifiedAt) && (
                  <div className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(plan.modifiedAt).toLocaleDateString()} · {(plan.sizeBytes / 1024).toFixed(1)}KB
              </p>
            </div>
          ))}
          {(!plans || plans.length === 0) && (
            <p className="text-sm text-muted-foreground">No plans found</p>
          )}
        </div>

        {/* Plan preview */}
        <div className="md:col-span-2">
          {selectedPlan ? (
            <PlanViewer content={selectedPlan.content} />
          ) : (
            <div className="rounded-lg bg-card p-8 text-center text-sm text-muted-foreground">
              Select a plan to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/plans/ app/plans/
git commit -m "feat: add plans page with markdown preview"
```

---

### Task 13: Projects Page

**Files:**
- Create: `components/projects/project-card.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create project card**

Create `components/projects/project-card.tsx`:
```tsx
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
      <div className="rounded-lg bg-card p-4 hover:bg-secondary/30 transition-colors cursor-pointer border border-border hover:border-primary/30">
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
```

- [ ] **Step 2: Create projects page**

Create `app/projects/page.tsx`:
```tsx
'use client';

import { useProjects } from '@/hooks/use-claude-data';
import ProjectCard from '@/components/projects/project-card';

export default function ProjectsPage() {
  const { data: projects } = useProjects();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(projects || []).map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
        {(!projects || projects.length === 0) && (
          <p className="text-sm text-muted-foreground">No projects found</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create project detail page**

Create `app/projects/[slug]/page.tsx`:
```tsx
'use client';

import { use } from 'react';
import { useProject } from '@/hooks/use-claude-data';

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data } = useProject(slug);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{slug.split('-').pop()}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Sessions</p>
          <p className="text-2xl font-bold text-primary mt-1">{data.sessionCount}</p>
        </div>
        <div className="rounded-lg bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Active Now</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{data.activeSessions?.length || 0}</p>
        </div>
        <div className="rounded-lg bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Memory Files</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{data.memoryFiles?.length || 0}</p>
        </div>
      </div>

      {/* Active sessions */}
      {data.activeSessions?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Sessions</h2>
          <div className="space-y-2">
            {data.activeSessions.map((s: { pid: number; cwd: string; startedAt: number }) => (
              <div key={s.pid} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-400">PID {s.pid}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.cwd}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project CLAUDE.md */}
      {data.projectClaudeMd && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Project CLAUDE.md</h2>
          <div className="rounded-lg bg-card p-4">
            <pre className="whitespace-pre-wrap text-xs text-foreground/60 font-mono">{data.projectClaudeMd}</pre>
          </div>
        </div>
      )}

      {/* Session files */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Session Files</h2>
        <div className="space-y-1">
          {(data.sessionFiles || []).map((file: string) => (
            <div key={file} className="rounded-md bg-card px-3 py-2 text-xs text-muted-foreground font-mono">
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/projects/ app/projects/
git commit -m "feat: add projects page with detail view"
```

---

### Task 14: History Page

**Files:**
- Create: `app/history/page.tsx`

- [ ] **Step 1: Create history page**

Create `app/history/page.tsx`:
```tsx
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

      {/* Search */}
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

      {/* History list */}
      <div className="space-y-1">
        {entries.map((entry, i) => (
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

      {/* Pagination */}
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
```

- [ ] **Step 2: Commit**

```bash
git add app/history/
git commit -m "feat: add prompt history page with search and pagination"
```

---

### Task 15: Final Polish & Verification

**Files:**
- Modify: `app/globals.css`, `next.config.ts`
- Create: `README.md` (only because this is a shareable open-source tool)

- [ ] **Step 1: Update next.config.ts for server-side fs access**

Verify `next.config.ts` allows server components to use `fs`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['gray-matter'],
};

export default nextConfig;
```

- [ ] **Step 2: Create README.md**

Create `README.md`:
```markdown
# Claude Command Center

A local web dashboard for visualizing your Claude Code activity, sessions, memories, plugins, costs, and settings.

## Features

- **Live Overview** — Active sessions, total stats, recent activity
- **Sessions** — History with goals, outcomes, satisfaction, friction details
- **Memories** — View, edit, and delete global + per-project memories
- **Plugins & Skills** — Installed plugins and custom skills
- **Settings** — Model, CLI version, policies, CLAUDE.md preview
- **Usage & Costs** — Token usage, duration, lines changed, per-project breakdown
- **Plans** — View implementation plans with markdown preview
- **Projects** — All projects with session counts and activity status
- **History** — Searchable prompt history

## Quick Start

\`\`\`bash
git clone <repo-url>
cd claudeCommandCenter
npm install
npm run dev
\`\`\`

Open http://localhost:3000

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_HOME` | `~/.claude` | Path to Claude config directory |
| `PORT` | `3000` | Dashboard port |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | `5000` | Polling interval (ms) |

## Requirements

- Node.js 18+
- Claude Code CLI installed (for data to display)

## How It Works

Reads files from your local `~/.claude/` directory. No API keys needed. No data leaves your machine.
```

- [ ] **Step 3: Full build verification**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 4: Run and test all pages**

```bash
npm run dev
```

Visit each page and verify:
1. `http://localhost:3000` — Overview with stats and activity
2. `http://localhost:3000/sessions` — Session list with expandable details
3. `http://localhost:3000/memories` — Memory cards with edit/delete
4. `http://localhost:3000/plugins` — Plugin and skill listings
5. `http://localhost:3000/settings` — Config display
6. `http://localhost:3000/costs` — Charts and usage stats
7. `http://localhost:3000/plans` — Plan list with preview
8. `http://localhost:3000/projects` — Project grid
9. `http://localhost:3000/history` — Search and pagination

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: final polish, README, and build verification"
```
