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

  const decodedPath = slug.replace(/--/g, ':/').replace(/-/g, '/');
  const projectClaudeMd = await readTextFile(path.join(decodedPath, 'CLAUDE.md'));

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
