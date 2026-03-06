export function truncatedClean(str: string, maxLength: number) {
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