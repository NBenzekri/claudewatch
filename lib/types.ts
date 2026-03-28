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

export interface SessionFull {
  facet: SessionFacet;
  meta: SessionMeta | null;
}

export interface Memory {
  filePath: string;
  fileName: string;
  name: string;
  type: 'user' | 'feedback' | 'project' | 'reference' | 'unknown';
  description: string;
  body: string;
  scope: string;
}

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

export interface Skill {
  name: string;
  path: string;
}

export interface ClaudeSettings {
  model: string;
  enabledPlugins: Record<string, boolean>;
  autoUpdatesChannel: string;
  voiceEnabled: boolean;
  statusLine: { type: string; command: string } | null;
}

export interface PolicyLimits {
  restrictions: Record<string, { allowed: boolean }>;
}

export interface HistoryEntry {
  display: string;
  pastedContents: Record<string, unknown>;
  timestamp: number;
  project: string;
  sessionId: string;
}

export interface PlanFile {
  name: string;
  path: string;
  content: string;
  modifiedAt: number;
  sizeBytes: number;
}

export interface Project {
  name: string;
  slug: string;
  dirName: string;
  sessionCount: number;
  lastActivity: number;
  hasMemories: boolean;
  activeSessionCount: number;
}

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

export interface HealthStatus {
  ok: boolean;
  claudeHome: string;
  cliVersion: string | null;
  platform: string;
}
