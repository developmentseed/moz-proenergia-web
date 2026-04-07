const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const stringFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 2,
});

export const formatNumber = formatter.format.bind(formatter);

// Values are integers by default; pass hasDecimal=true to preserve decimal places.
export function formatDisplayNumber(value: number, hasDecimal?: boolean): string {
  const num = hasDecimal ? value : Math.round(value);
  // Use compact notation for large numbers (1K, 1M, 1.23B…)
  if (Math.abs(num) >= 1_000) return stringFormatter.format(num);
  return formatNumber(num);
}
