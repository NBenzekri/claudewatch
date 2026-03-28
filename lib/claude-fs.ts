import os from 'os';
import path from 'path';
import fs from 'fs/promises';

export function getClaudeHome(): string {
  if (process.env.CLAUDE_HOME) {
    return process.env.CLAUDE_HOME;
  }
  return path.join(os.homedir(), '.claude');
}

export function claudePath(...segments: string[]): string {
  return path.join(getClaudeHome(), ...segments);
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function writeTextFile(filePath: string, content: string): Promise<boolean> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listDir(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

export async function listJsonFiles(dirPath: string): Promise<string[]> {
  const files = await listDir(dirPath);
  return files.filter(f => f.endsWith('.json'));
}

export async function listMdFiles(dirPath: string): Promise<string[]> {
  const files = await listDir(dirPath);
  return files.filter(f => f.endsWith('.md'));
}

export async function fileStats(filePath: string): Promise<{ modifiedAt: number; sizeBytes: number } | null> {
  try {
    const stat = await fs.stat(filePath);
    return { modifiedAt: stat.mtimeMs, sizeBytes: stat.size };
  } catch {
    return null;
  }
}

export async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
