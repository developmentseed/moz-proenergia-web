const integerColumns = ['population', 'pop'];

const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const stringFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 2
});
// 9.877E8

export const formatNumber = formatter.format.bind(formatter);

export function formatDisplayNumber(value: number, column?: string): string {
  const isInteger = column && integerColumns.some(
    // @TODO: this... seems fragile - doing substring match because column names across models are not consistent
    (col) => column.toLowerCase().includes(col.toLowerCase())
  );
  const num = isInteger ? Math.round(value) : value;

  // if more than million, return compact form of the number (1M, 1B, 1.23B...)
  if (Math.abs(num) >= 1_000) {
    return stringFormatter.format(num);
  }

  return formatNumber(num);
}
