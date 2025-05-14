import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
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
    <nav className="flex justify-center items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pages.map((page, index) => 
        page === 'ellipsis' ? (
          <Button
            key={`ellipsis-${index}`}
            variant="outline"
            size="icon"
            disabled
            className="cursor-default"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        )
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}