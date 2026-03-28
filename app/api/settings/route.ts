import { NextResponse } from 'next/server';
import { getSettings, getPolicyLimits } from '@/lib/parsers';
import { readTextFile, claudePath } from '@/lib/claude-fs';
import { execSync } from 'child_process';

export async function GET() {
  const settings = await getSettings();
  const policies = await getPolicyLimits();
  const claudeMd = await readTextFile(claudePath('CLAUDE.md'));

  let cliVersion: string | null = null;
  try {
    cliVersion = execSync('claude --version', { encoding: 'utf-8' }).trim();
  } catch { /* CLI not in PATH */ }

  return NextResponse.json({ settings, policies, claudeMd, cliVersion });
}
