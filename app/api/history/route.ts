import { NextRequest, NextResponse } from 'next/server';
import { getHistory } from '@/lib/parsers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const result = await getHistory(query || undefined, page);
  return NextResponse.json(result);
}
