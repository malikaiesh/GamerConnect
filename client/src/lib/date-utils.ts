import { format, formatDistanceToNow, isValid } from "date-fns";

/**
 * Format a date to a readable string
 * @param date Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (!isValid(dateObj)) return "";
    
    return format(dateObj, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Format a date with time
 * @param date Date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (!isValid(dateObj)) return "";
    
    return format(dateObj, "MMM d, yyyy h:mm a");
  } catch (error) {
    console.error("Error formatting date and time:", error);
    return "";
  }
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 * @param date Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (!isValid(dateObj)) return "";
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "";
  }
}