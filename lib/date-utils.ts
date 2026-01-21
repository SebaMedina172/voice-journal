/**
   Parse a date string (YYYY-MM-DD)
 */
export function parseLocalDate(dateString: string): Date {
  // Split the date string
  const [year, month, day] = dateString.split('-').map(Number)
  // Create a LOCAL date (not UTC) so it represents midnight of that day in the user's timezone
  return new Date(year, month - 1, day)
}

/**
   Get today's date at local midnight
 */
export function getClientTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
   Get today's date as a Date object at LOCAL midnight
   Used for comparisons everywhere
 */
export function getTodayLocal(): Date {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const date = now.getDate()
  
  return new Date(year, month, date)
}

/**
   Format a date as YYYY-MM-DD
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