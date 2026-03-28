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
