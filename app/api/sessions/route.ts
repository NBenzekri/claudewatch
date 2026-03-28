import { NextResponse } from 'next/server';
import { getActiveSessions } from '@/lib/parsers';

export async function GET() {
  const sessions = await getActiveSessions();
  return NextResponse.json(sessions);
}
