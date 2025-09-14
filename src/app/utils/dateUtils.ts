// Simple date utilities to replace date-fns
export const format = (date: Date, formatString: string): string => {
  const pad = (num: number) => num.toString().padStart(2, '0')
  
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  const monthName = monthNames[date.getMonth()]
  const shortMonthName = shortMonthNames[date.getMonth()]
  
  return formatString
    .replace('yyyy', year.toString())
    .replace('YYYY', year.toString())
    .replace('MMMM', monthName)
    .replace('MMM', shortMonthName)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }): string => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  let result = ''
  
  if (diffInMinutes < 1) {
    result = 'less than a minute'
  } else if (diffInMinutes < 60) {
    result = `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`
  } else if (diffInHours < 24) {
    result = `${diffInHours} hour${diffInHours === 1 ? '' : 's'}`
  } else if (diffInDays < 30) {
    result = `${diffInDays} day${diffInDays === 1 ? '' : 's'}`
  } else {
    const diffInMonths = Math.floor(diffInDays / 30)
    result = `${diffInMonths} month${diffInMonths === 1 ? '' : 's'}`
  }
  
  return options?.addSuffix ? `${result} ago` : result
}
