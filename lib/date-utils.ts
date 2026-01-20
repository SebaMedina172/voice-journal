/**
   Parse a date string (YYYY-MM-DD) as local midnight, not UTC
 */
export function parseLocalDate(dateString: string): Date {
  // Split the date string
  const [year, month, day] = dateString.split('-').map(Number)
  
  // Create date in LOCAL timezone (not UTC)
  // Note: month is 0-indexed in JavaScript
  return new Date(year, month - 1, day)
}

/**
   Get today's date at local midnight
 */
export function getTodayLocal(): Date {
  const now = new Date()
  // Use local date components to get the correct date
  const localYear = now.getFullYear()
  const localMonth = now.getMonth()
  const localDate = now.getDate()
  
  return new Date(localYear, localMonth, localDate)
}

/**
   Format a date as YYYY-MM-DD in local timezone
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
   Compare two dates
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
   Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, getTodayLocal())
}