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

// Matches ISO 8601 dates/datetimes only, e.g. "2023-01-15" or
// "2023-01-15T10:30:00Z". `new Date(str)` is too lenient for arbitrary
// strings (e.g. it parses "EPSG:3857" as the year 3857), so we only
// attempt parsing when the string already looks like an ISO date.
const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * Formats a string as a date if it is a valid ISO 8601 date string.
 * @param value - The value to check and potentially format.
 * @returns The formatted date string or the original value.
 */
export function formatIfDate(value: any): string | any {
  if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
    const date = new Date(value);

    // Check if the date object is valid using .getTime()
    // A valid date returns a number; an invalid one returns NaN
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }

  return value; // Return original if not a date
}
