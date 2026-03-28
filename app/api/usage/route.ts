import { NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/parsers';

export async function GET() {
  const stats = await getUsageStats();
  return NextResponse.json(stats);
}
