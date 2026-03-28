# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**claudewatch** — A local Next.js dashboard that reads `~/.claude/` to monitor Claude Code sessions, usage, memories, plugins, and costs in real-time. Zero database, zero API keys, all local.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build — run this to verify changes compile
npm run lint         # ESLint
```

No test framework is configured yet.

## Architecture

```
Pages (app/*.tsx)  →  React Query hooks (hooks/use-claude-data.ts)
                          ↓ polling (5-30s intervals)
                   API Routes (app/api/*/route.ts)
                          ↓
                   Parsers (lib/parsers.ts)
                          ↓
                   FS Layer (lib/claude-fs.ts)
                          ↓
                   ~/.claude/ (local files)
```

**Three-layer data flow:**
- `lib/claude-fs.ts` — Low-level filesystem helpers. All reads return `null` on error (never throws). Resolves `~/.claude/` via `os.homedir()`, overridable with `CLAUDE_HOME` env var.
- `lib/parsers.ts` — Domain-specific parsers that aggregate multiple files into typed objects (e.g., combines `usage-data/facets/*.json` + `usage-data/session-meta/*.json` into `SessionFull[]`).
- `hooks/use-claude-data.ts` — React Query hooks wrapping each API route with polling intervals. Client-side only (`'use client'`).

**Write operations exist only for memories** — `PUT`/`DELETE` on `/api/memories` with path traversal validation against `getClaudeHome()`.

## Key Types (lib/types.ts)

- `SessionFull` = `{ facet: SessionFacet, meta: SessionMeta | null }` — combined from two separate JSON files matched by filename
- `Memory` — parsed from markdown with YAML frontmatter (via `gray-matter`)
- `UsageStats` — aggregated from all session-meta files with daily and per-project breakdowns

## Non-Obvious Details

- **shadcn/ui uses Base UI** (not Radix). Component APIs differ — read `components/ui/*.tsx` before using them.
- **Project directory names encode Windows paths**: `D--dev-MyProject` decodes to `D:\dev\MyProject`. See `getProjects()` in parsers.ts.
- **Sidebar state** persists via `localStorage('sidebar-expanded')` and communicates to `MainContent` via `MutationObserver` on `document.body` class.
- **Theme** uses `next-themes` with `attribute="class"`. Use `resolvedTheme` (not `theme`) when checking current mode.
- **`gray-matter`** is listed in `serverExternalPackages` in next.config.ts (CommonJS compatibility).
- **History endpoint** (`/api/history`) paginates `history.jsonl` server-side (50 items/page) since the file can be large.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_HOME` | `~/.claude` | Claude config directory path |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | `5000` | Polling interval (ms), exposed to client |

## Adding a New Data Page

1. Add parser function in `lib/parsers.ts` reading from `~/.claude/`
2. Add API route in `app/api/<name>/route.ts` calling the parser
3. Add React Query hook in `hooks/use-claude-data.ts` with appropriate polling interval
4. Create page in `app/<name>/page.tsx` (must be `'use client'` if using hooks)
5. Add nav entry in `components/layout/sidebar.tsx` `navItems` array
