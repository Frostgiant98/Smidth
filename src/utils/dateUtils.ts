/**
 * Date Utilities for Monday-based week calculations
 * 
 * All weeks run Monday → Sunday
 * Payments can only be made on Mondays
 */

/**
 * Get the Monday of the week containing the given date
 * @param date - Any date
 * @returns Date object set to Monday of that week
 */
export function getMonday(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  return d;
}

/**
 * Get the Sunday of the week containing the given date
 * @param date - Any date
 * @returns Date object set to Sunday of that week
 */
export function getSunday(date: Date = new Date()): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return sunday;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse ISO date string to Date object
 */
export function parseDateISO(isoString: string): Date {
  return new Date(isoString + 'T00:00:00');
}

/**
 * Get all Monday dates from start date for N weeks
 * @param startDate - Monday start date
 * @param weeks - Number of weeks
 * @returns Array of Monday dates as ISO strings
 */
export function getWeekMondays(startDate: string, weeks: number): string[] {
  const start = parseDateISO(startDate);
  const mondays: string[] = [];
  
  for (let i = 0; i < weeks; i++) {
    const monday = new Date(start);
    monday.setDate(monday.getDate() + (i * 7));
    mondays.push(formatDateISO(monday));
  }
  
  return mondays;
}

/**
 * Check if a date string is a Monday
 */
export function isMonday(dateString: string): boolean {
  const date = parseDateISO(dateString);
  return date.getDay() === 1;
}

/**
 * Get week number (0-indexed) from start date
 */
export function getWeekNumber(weekStartDate: string, loanStartDate: string): number {
  const start = parseDateISO(loanStartDate);
  const week = parseDateISO(weekStartDate);
  const diffTime = week.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

