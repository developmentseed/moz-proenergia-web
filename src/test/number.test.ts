import { describe, it, expect } from 'vitest';
import { formatNumber, formatDisplayNumber } from '@/utils/number';

describe('formatNumber', () => {
  it('formats with locale separators', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });
});

describe('formatDisplayNumber', () => {
  it('returns abbreviated billions', () => {
    expect(formatDisplayNumber(3_500_000_000)).toBe('3.5B');
  });

  it('returns abbreviated millions', () => {
    expect(formatDisplayNumber(1_200_000)).toBe('1.2M');
  });

  it('falls back to formatNumber for numbers below 1M', () => {
    expect(formatDisplayNumber(12345)).toBe('12,345');
  });

  it('rounds to integer for integerColumns (case-insensitive)', () => {
    expect(formatDisplayNumber(1234.7, 'population')).toBe('1,235');
    expect(formatDisplayNumber(1234.7, 'Population')).toBe('1,235');
  });

  it('rounds integer column values before abbreviating', () => {
    expect(formatDisplayNumber(1_230_000.8, 'Population')).toBe('1.23M');
  });

  it('preserves decimals for non-integer columns', () => {
    expect(formatDisplayNumber(999.99)).toBe('999.99');
  });

  it('matches partial column names', () => {
    expect(formatDisplayNumber(1234.7, 'PopStartYear')).toBe('1,235');
  });
});
