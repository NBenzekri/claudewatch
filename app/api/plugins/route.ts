import { NextResponse } from 'next/server';
import { getPlugins, getSkills, getSettings } from '@/lib/parsers';

export async function GET() {
  const settings = await getSettings();
  const plugins = await getPlugins(settings);
  const skills = await getSkills();
  return NextResponse.json({ plugins, skills });
}
