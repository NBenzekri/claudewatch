import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/parsers';

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}
