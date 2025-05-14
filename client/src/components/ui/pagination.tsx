import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

// Shadcn-style named exports
export interface PaginationProps extends React.ComponentProps<"nav"> {
  className?: string;
}

export function Pagination({ className, ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={className}
      {...props}
    />
  )
}

export interface PaginationContentProps extends React.ComponentProps<"ul"> {
  className?: string;
}

export function PaginationContent({
  className,
  ...props
}: PaginationContentProps) {
  return (
    <ul className="flex flex-row items-center gap-1">
      {props.children}
    </ul>
  )
}

export interface PaginationItemProps extends React.ComponentProps<"li"> {
  className?: string;
}

export function PaginationItem({
  className,
  ...props
}: PaginationItemProps) {
  return (
    <li className={className} {...props} />
  )
}

export function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      aria-label="Go to previous page"
      size="icon"
      variant="outline"
      className={className}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  )
}

export function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      aria-label="Go to next page"
      size="icon"
      variant="outline"
      className={className}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  )
}

export interface PaginationLinkProps
  extends React.ComponentProps<"a"> {
  isActive?: boolean;
}

export function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-transparent hover:bg-secondary hover:text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
}

// Keep our original pagination component as default export
interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationComponentProps) {
  if (totalPages <= 1) return null;

  // Logic to determine which page numbers to show
  let pages: (number | 'ellipsis')[] = [];
  
  if (totalPages <= maxVisiblePages) {
    // If total pages are less than or equal to max visible, show all pages
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    // Always include first page, last page, current page,
    // and the pages immediately before and after current page
    const firstPage = 1;
    const lastPage = totalPages;
    
    // Determine range around current page
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(lastPage - 1, currentPage + 1);
    
    // Adjust range to show more pages if we're at the beginning or end
    if (currentPage <= 2) {
      rangeEnd = Math.min(lastPage - 1, maxVisiblePages - 1);
    } else if (currentPage >= lastPage - 1) {
      rangeStart = Math.max(2, lastPage - maxVisiblePages + 2);
    }
    
    // Build the pages array
    pages = [firstPage];
    
    // Add ellipsis if needed before the range
    if (rangeStart > 2) {
      pages.push('ellipsis');
    }
    
    // Add the range of pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed after the range
    if (rangeEnd < lastPage - 1) {
      pages.push('ellipsis');
    }
    
    // Add the last page
    if (lastPage !== firstPage) {
      pages.push(lastPage);
    }
  }

  return (
    <Pagination className="flex justify-center items-center gap-1">
      <PaginationItem>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </PaginationItem>
      
      {pages.map((page, index) => (
        <PaginationItem key={page === 'ellipsis' ? `ellipsis-${index}` : page}>
          {page === 'ellipsis' ? (
            <Button
              variant="outline"
              size="icon"
              disabled
              className="cursor-default"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          )}
        </PaginationItem>
      ))}
      
      <PaginationItem>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </PaginationItem>
    </Pagination>
  );
}