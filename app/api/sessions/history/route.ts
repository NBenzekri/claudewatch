import { NextResponse } from 'next/server';
import { getSessionHistory } from '@/lib/parsers';

export async function GET() {
  const history = await getSessionHistory();
  return NextResponse.json(history);
}
