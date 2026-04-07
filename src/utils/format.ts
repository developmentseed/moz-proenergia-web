export function truncatedClean(str: string | null, maxLength: number) {
  if (!str) return '';
  // Check if the string is already shorter than or equal to the max length
  if (str.length <= maxLength) {
    return str;
  }

  // Slice the string up to the maximum length
  let truncated = str.slice(0, maxLength);

  // Find the index of the last space in the truncated portion
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  // If a space is found and it's not the first character, slice again at the last space
  // This removes any partial word at the end
  if (lastSpaceIndex !== -1) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }

  return truncated;
}

/**
 * Formats a string as a date if it is a valid date string.
 * @param value - The value to check and potentially format.
 * @returns The formatted date string or the original value.
 */
export function formatIfDate(value: any): string | any {
  // Check if value is a string and not just a numeric string
  if (typeof value === 'string' && isNaN(Number(value))) {
    const date = new Date(value);

    // Check if the date object is valid using .getTime()
    // A valid date returns a number; an invalid one returns NaN
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }
  
  return value; // Return original if not a date
}
