/**
 * Date utilities for week management
 */

/**
 * Get the Monday-Friday range for a given date
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const current = new Date(date);
  const dayOfWeek = current.getDay();
  
  // Calculate days to Monday (0 = Sunday, 1 = Monday, etc.)
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  // Get Monday
  const monday = new Date(current);
  monday.setDate(current.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);
  
  // Get Friday
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: friday };
}

/**
 * Format week range as "Jan 6-10"
 */
export function formatWeekRange(startDate: Date, endDate: Date): string {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = monthNames[startDate.getMonth()];
  
  // Check if same month
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${month} ${startDay}-${endDay}`;
  } else {
    const endMonth = monthNames[endDate.getMonth()];
    return `${month} ${startDay} - ${endMonth} ${endDay}`;
  }
}

/**
 * Get next week's Monday
 */
export function getNextWeek(date: Date): Date {
  const { start } = getWeekRange(date);
  const nextMonday = new Date(start);
  nextMonday.setDate(start.getDate() + 7);
  return nextMonday;
}

/**
 * Get previous week's Monday
 */
export function getPreviousWeek(date: Date): Date {
  const { start } = getWeekRange(date);
  const previousMonday = new Date(start);
  previousMonday.setDate(start.getDate() - 7);
  return previousMonday;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get day name from date
 */
export function getDayName(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

/**
 * Get all days in a week (Monday-Friday) with dates
 */
export function getWeekDays(startDate: Date): Array<{ day: string; date: Date }> {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return days.map((day, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return { day, date };
  });
}

