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

```bash
git clone <repo-url>
cd claudeCommandCenter
npm install
npm run dev
```

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
