'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Zap, Brain, Plug, Settings,
  BarChart3, FileText, FolderOpen, History,
} from 'lucide-react';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Overview' },
  { href: '/sessions', icon: Zap, label: 'Sessions' },
  { href: '/memories', icon: Brain, label: 'Memories' },
  { href: '/plugins', icon: Plug, label: 'Plugins & Skills' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/costs', icon: BarChart3, label: 'Usage & Costs' },
  { href: '/plans', icon: FileText, label: 'Plans' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/history', icon: History, label: 'History' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[56px] flex-col items-center border-r border-border bg-card py-4">
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          CC
        </div>
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
