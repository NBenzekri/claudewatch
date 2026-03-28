import { NextResponse } from 'next/server';
import { getClaudeHome, dirExists } from '@/lib/claude-fs';
import os from 'os';
import { execSync } from 'child_process';

export async function GET() {
  const claudeHome = getClaudeHome();
  const exists = await dirExists(claudeHome);

  let cliVersion: string | null = null;
  try {
    cliVersion = execSync('claude --version', { encoding: 'utf-8' }).trim();
  } catch { /* CLI not in PATH */ }

  return NextResponse.json({
    ok: exists,
    claudeHome,
    cliVersion,
    platform: os.platform(),
  });
}
