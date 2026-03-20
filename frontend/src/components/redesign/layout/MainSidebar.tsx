import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarLink {
  label: string;
  icon: ReactNode;
  href: string;
}

interface MainSidebarProps {
  isCollapsed: boolean;
  activeKey: string;
  links: SidebarLink[];
  onToggle?: () => void;
  className?: string;
}

export function MainSidebar({
  isCollapsed,
  activeKey,
  links,
  onToggle,
  className,
}: MainSidebarProps) {
  return (
    <aside
      className={cn(
        'sticky top-0 h-screen border-r border-slate-200 bg-white transition-all duration-200',
        isCollapsed ? 'w-20' : 'w-72',
        className,
      )}
      aria-label="Teacher Navigation"
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
        <div className={cn('font-semibold text-slate-900', isCollapsed && 'sr-only')}>
          Smart-MathAI
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="space-y-1 p-3">
        {links.map((link) => {
          const key = link.label.toLowerCase().replace(/\s+/g, '-');
          const isActive = key === activeKey;

          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                isCollapsed && 'justify-center',
              )}
              title={link.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="h-5 w-5 shrink-0">{link.icon}</span>
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
