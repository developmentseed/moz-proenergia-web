const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const decimalFormatter = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 2 });
const stringFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 2,
});

export const formatNumber = formatter.format.bind(formatter);

// Values are integers by default; pass hasDecimal=true to use significant-figure display.
export function formatDisplayNumber(value: number, hasDecimal?: boolean): string {
  const num = hasDecimal ? value : Math.round(value);
  // Use compact notation for large numbers (1K, 1M, 1.23B…)
  if (Math.abs(num) >= 1_000) return stringFormatter.format(num);
  if (hasDecimal) {
    // For values < 1, use significant figures so small numbers like 0.0045 aren't shown as "0.00"
    if (num !== 0 && Math.abs(num) < 1) return decimalFormatter.format(num);
    return formatNumber(num);
  }
  return formatNumber(num);
}
