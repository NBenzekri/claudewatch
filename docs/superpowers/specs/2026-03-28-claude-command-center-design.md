# Claude Command Center — Design Spec

## Context

Developers using Claude Code across multiple terminals, repos, and projects lose track of what's happening — active sessions, token usage, memories, plugins, costs. There's no single view of Claude Code's local state. This app provides a local web dashboard that reads `~/.claude/` and presents everything in one place.

**Target audience:** Any Claude Code user. The app auto-detects `~/.claude/` and works out of the box. Will be open-sourced on GitHub.

## Tech Stack

- **Next.js 16** (App Router, Server Components, Route Handlers, built-in memoization)
- **React 19**
- **shadcn/ui + Tailwind CSS v4** — Deep Navy + Indigo theme
- **TanStack React Query** — 5s polling for live auto-refresh
- **Recharts** — Usage/cost charts
- **No database** — reads directly from `~/.claude/` filesystem
- **TypeScript** throughout

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_HOME` | `~/.claude` (auto-detected via `os.homedir()`) | Override path to Claude config directory |
| `PORT` | `3000` | Dashboard port |
| `REFRESH_INTERVAL` | `5000` | Polling interval in ms |

No API keys or auth credentials required.

## Architecture

### Layout: Icon Sidebar + Content

- Compact icon sidebar (50-60px wide) on the left, always visible
- 9 navigation items with icons (no text labels, tooltip on hover)
- Main content area fills remaining space
- Responsive: sidebar collapses to bottom nav on mobile

### Theme: Deep Navy + Indigo

- Background: `#0a0e1a` (deep navy)
- Surface: `#111827` / `#1e293b` (slate panels)
- Primary accent: `#6366f1` / `#818cf8` (indigo)
- Success: `#34d399` (emerald)
- Warning: `#fbbf24` (amber)
- Error: `#f87171` (red)
- Text: white at varying opacities (0.9, 0.7, 0.4)
- Borders: `rgba(255,255,255,0.06)` subtle

### Data Layer

```
lib/
├── claude-fs.ts    # Resolves ~/.claude path (cross-platform), provides read/write helpers
├── parsers.ts      # Parse JSONL, session JSON, facets, memory frontmatter, settings
└── types.ts        # TypeScript interfaces for all Claude data structures
```

**`claude-fs.ts`** — Core filesystem module:
- `getClaudeHome()` — returns `CLAUDE_HOME` env var or `path.join(os.homedir(), '.claude')`
- Cross-platform: Windows (`%USERPROFILE%`), macOS/Linux (`$HOME`)
- All file reads go through this module
- Handles missing files/directories gracefully (returns empty arrays, not errors)

**`parsers.ts`** — Data parsing:
- `parseJsonl(filePath)` — streams JSONL files line by line
- `parseSessionFacet(filePath)` — extracts goal, outcome, satisfaction, friction from facet JSON
- `parseMemoryFile(filePath)` — extracts YAML frontmatter (name, type, description) + body
- `parseSettingsJson(filePath)` — typed settings extraction
- `parsePluginsJson(filePath)` — plugin list with versions and dates

### API Routes

All routes are GET by default. Memory routes also support PUT/DELETE for light editing.

| Route | Method | Source Files | Returns |
|-------|--------|-------------|---------|
| `/api/sessions` | GET | `sessions/*.json` | Active sessions (PID, project, started) |
| `/api/sessions/history` | GET | `usage-data/facets/*.json` | Past sessions with goals, outcomes, satisfaction |
| `/api/memories` | GET | `memory/MEMORY.md` + `memory/*.md` + `projects/*/memory/` | All memories grouped by scope |
| `/api/memories` | PUT | `memory/*.md` | Update a memory file |
| `/api/memories` | DELETE | `memory/*.md` | Delete a memory file |
| `/api/plugins` | GET | `plugins/installed_plugins.json` + `skills/` | Plugins with versions + custom skills |
| `/api/settings` | GET | `settings.json` + `policy-limits.json` | Full config |
| `/api/usage` | GET | `telemetry/` + `usage-data/` | Usage stats and cost data |
| `/api/plans` | GET | `plans/*.md` | Plan files with content |
| `/api/projects` | GET | `projects/` directory listing | Project list with session counts |
| `/api/projects/[slug]` | GET | `projects/[slug]/` | Single project detail with sessions |
| `/api/history` | GET | `history.jsonl` | Prompt history (paginated, searchable) |
| `/api/health` | GET | Checks `~/.claude` exists | Health check + CLI version |

### React Query Hooks

```typescript
// hooks/use-claude-data.ts
// Each hook wraps an API route with React Query + polling

useActiveSessions()     // refetchInterval: 5000
useSessionHistory()     // refetchInterval: 10000
useMemories()           // refetchInterval: 10000
usePlugins()            // refetchInterval: 30000 (rarely changes)
useSettings()           // refetchInterval: 30000
useUsage()              // refetchInterval: 15000
usePlans()              // refetchInterval: 10000
useProjects()           // refetchInterval: 10000
useHistory(query, page) // on-demand, not polling
```

## Pages

### 1. Overview (Home) — `/`
- **4 stat cards:** Active sessions, total sessions, projects count, plugins count
- **Recent activity:** Last 10 sessions from facets, showing goal + outcome + project
- **Usage mini-chart:** 7-day bar chart of session count or token usage
- **Quick links:** Jump to any section

### 2. Sessions — `/sessions`
- **Tabs:** All | Active | Completed
- **Filter:** By project (dropdown)
- **List items show:** Session name (from facet summary), project, duration, model, outcome status
- **Expandable details:** Goals, satisfaction scores, friction details, full summary
- **Active sessions:** Show green dot, PID, working directory, started timestamp

### 3. Memories — `/memories`
- **Tabs:** Global | Per-project (one tab per project that has memories)
- **Each memory card:** Type badge (user/feedback/project/reference), name, description preview
- **Edit:** Click edit to open inline editor, save writes back to the `.md` file
- **Delete:** Confirmation dialog, removes the `.md` file and updates MEMORY.md index
- **MEMORY.md index:** Shown at top as the "index view"

### 4. Plugins & Skills — `/plugins`
- **Plugins list:** Name, version, install date, last updated, enabled status (green/gray dot)
- **Custom skills:** Cards showing skill name and directory
- **Plugin details:** Expandable to show install path, git commit SHA

### 5. Settings & Config — `/settings`
- **Key-value display:** Model, CLI version, auto-updates channel, voice enabled
- **Enabled plugins:** Toggle list (read-only, shows current state)
- **Policy limits:** Restrictions display
- **CLAUDE.md preview:** Global CLAUDE.md content rendered as markdown
- **Per-project CLAUDE.md:** If any exist, show them in tabs

### 6. Usage & Costs — `/costs`
- **Summary cards:** Today, this week, this month totals
- **30-day bar chart:** Daily usage/cost trend
- **Per-project breakdown:** Which projects consume the most
- **Session cost distribution:** Chart showing cost per session type
- Note: Cost data depends on what Claude Code writes to `telemetry/` and `usage-data/`. Session counts and activity timelines are reliable. Token counts and dollar costs are shown only if the data exists in the telemetry files — the dashboard does not call any external API for billing data.

### 7. Plans — `/plans`
- **List view:** All `.md` files in `plans/` directory
- **Each item:** Filename, last modified, file size
- **Preview panel:** Click a plan to see rendered markdown on the right
- **Active indicator:** Plans modified recently get a green badge

### 8. Projects — `/projects`
- **Card grid:** One card per project directory
- **Each card:** Project name (derived from directory), repo count, session count, active/idle status
- **Click through:** Goes to `/projects/[slug]` with that project's sessions, memories, and CLAUDE.md

### 9. History — `/history`
- **Search bar:** Full-text search across prompts
- **Paginated list:** Shows prompt text, project, session ID, timestamp
- **Filter:** By project, by date range
- **Note:** `history.jsonl` can be large — API paginates (50 items per page), search is server-side

## Cross-Platform Support

The app must work on:
- **Windows** — `C:\Users\<user>\.claude\`
- **macOS** — `/Users/<user>/.claude/`
- **Linux** — `/home/<user>/.claude/`

`claude-fs.ts` uses `os.homedir()` + `path.join()` for all path resolution. No hardcoded paths.

## Light Management Features

These are the only write operations the dashboard supports:

1. **Edit memory** — PUT to `/api/memories` with updated file content
2. **Delete memory** — DELETE to `/api/memories` with file path
3. **All other management** stays in the CLI

## File Structure

```
claudeCommandCenter/
├── app/
│   ├── layout.tsx                 # Root layout: sidebar + providers
│   ├── page.tsx                   # Overview dashboard
│   ├── sessions/page.tsx
│   ├── memories/page.tsx
│   ├── plugins/page.tsx
│   ├── settings/page.tsx
│   ├── costs/page.tsx
│   ├── plans/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── history/page.tsx
│   └── api/
│       ├── sessions/route.ts
│       ├── sessions/history/route.ts
│       ├── memories/route.ts
│       ├── plugins/route.ts
│       ├── settings/route.ts
│       ├── usage/route.ts
│       ├── plans/route.ts
│       ├── projects/route.ts
│       ├── projects/[slug]/route.ts
│       ├── history/route.ts
│       └── health/route.ts
├── components/
│   ├── layout/
│   │   └── sidebar.tsx
│   ├── ui/                        # shadcn/ui components
│   ├── dashboard/
│   │   ├── stat-card.tsx
│   │   ├── activity-feed.tsx
│   │   └── usage-chart.tsx
│   ├── sessions/
│   │   ├── session-list.tsx
│   │   └── session-detail.tsx
│   ├── memories/
│   │   ├── memory-card.tsx
│   │   └── memory-editor.tsx
│   └── ...per-page components
├── hooks/
│   └── use-claude-data.ts
├── lib/
│   ├── claude-fs.ts
│   ├── parsers.ts
│   ├── types.ts
│   └── utils.ts
├── .env.example
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## Key Data Type Interfaces

```typescript
interface ActiveSession {
  pid: number;
  sessionId: string;
  cwd: string;
  startedAt: number;
  kind: string;
  entrypoint: string;
}

interface SessionFacet {
  sessionId: string;
  briefSummary: string;
  underlyingGoal: string;
  goalCategories: Record<string, number>;
  outcome: string;
  userSatisfactionCounts: Record<string, number>;
  claudeHelpfulness: string;
  sessionType: string;
  frictionCounts: Record<string, number>;
  frictionDetail: string;
  primarySuccess: string;
}

interface Memory {
  filePath: string;
  name: string;
  type: 'user' | 'feedback' | 'project' | 'reference';
  description: string;
  body: string;
  scope: 'global' | string; // project name if per-project
}

interface Plugin {
  name: string;
  scope: string;
  version: string;
  installPath: string;
  installedAt: string;
  lastUpdated: string;
  enabled: boolean;
}

interface HistoryEntry {
  display: string;
  timestamp: number;
  project: string;
  sessionId: string;
}

interface Project {
  name: string;
  slug: string;
  path: string;
  sessionCount: number;
  lastActivity: number;
  hasMemories: boolean;
  activeSessionCount: number;
}
```
