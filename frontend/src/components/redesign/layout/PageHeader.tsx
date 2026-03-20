import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header className={className}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <Fragment key={`${item.label}-${index}`}>
              {item.href ? (
                <Link to={item.href} className="hover:text-slate-800">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
