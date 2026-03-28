'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, Zap, Brain, Plug, Settings,
  BarChart3, FileText, FolderOpen, History,
  PanelLeftClose, PanelLeftOpen, Sun, Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Overview' },
  { href: '/sessions', icon: Zap, label: 'Sessions' },
  { href: '/memories', icon: Brain, label: 'Memories' },
  { href: '/plugins', icon: Plug, label: 'Plugins' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/costs', icon: BarChart3, label: 'Usage & Costs' },
  { href: '/plans', icon: FileText, label: 'Plans' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/history', icon: History, label: 'History' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-expanded') === 'true';
    }
    return false;
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', String(expanded));
    document.body.classList.toggle('sidebar-expanded', expanded);
  }, [expanded]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card py-4 transition-all duration-200',
        expanded ? 'w-[220px]' : 'w-[56px]'
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center mb-4 px-3',
        expanded ? 'justify-between' : 'justify-center'
      )}>
        <div className={cn(
          'flex items-center gap-3',
          !expanded && 'justify-center'
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
            CC
          </div>
          {expanded && (
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              Command Center
            </span>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg transition-colors h-10 px-2.5',
                expanded ? 'justify-start' : 'justify-center',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {expanded && (
                <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-2 pt-2 border-t border-border mt-2 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-3 rounded-lg h-10 px-2.5 w-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors',
            expanded ? 'justify-start' : 'justify-center'
          )}
        >
          {mounted && (theme === 'dark' ? (
            <Sun className="h-[18px] w-[18px] flex-shrink-0" />
          ) : (
            <Moon className="h-[18px] w-[18px] flex-shrink-0" />
          ))}
          {expanded && (
            <span className="text-[13px] font-medium">{mounted && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}</span>
          )}
        </button>

        {/* Expand/Collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center gap-3 rounded-lg h-10 px-2.5 w-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors',
            expanded ? 'justify-start' : 'justify-center'
          )}
        >
          {expanded ? (
            <>
              <PanelLeftClose className="h-[18px] w-[18px] flex-shrink-0" />
              <span className="text-[13px] font-medium">Collapse</span>
            </>
          ) : (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </aside>
  );
}
