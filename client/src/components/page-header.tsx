import React from 'react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRightIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string, href?: string }>;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
}

export function PageHeader({ title, description, breadcrumbs, actionButton }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:space-y-0 mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-2">
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index}>
                {crumb.href ? (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actionButton && (
        <Button 
          onClick={actionButton.onClick}
          variant={actionButton.variant || 'default'}
          className="h-10"
        >
          {actionButton.icon && (
            <span className="mr-2">{actionButton.icon}</span>
          )}
          {actionButton.label}
        </Button>
      )}
    </div>
  );
}

export default PageHeader;