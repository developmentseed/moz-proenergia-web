import { describe, it, expect } from 'vitest';
import { formatNumber, formatDisplayNumber } from '@/utils/number';

describe('formatNumber', () => {
  it('formats with locale separators', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });
});

describe('formatDisplayNumber', () => {
  describe('default (rounds to integer)', () => {
    it('abbreviates billions', () => {
      expect(formatDisplayNumber(3_500_000_000)).toBe('3.5B');
    });

    it('abbreviates millions', () => {
      expect(formatDisplayNumber(1_200_000)).toBe('1.2M');
    });

    it('abbreviates thousands', () => {
      expect(formatDisplayNumber(12_345)).toBe('12.35K');
    });

    it('uses compact notation starting at the 1,000 boundary', () => {
      expect(formatDisplayNumber(1_000)).toBe('1K');
      expect(formatDisplayNumber(1_234)).toBe('1.23K');
    });

    it('formats sub-thousand integers without abbreviation', () => {
      expect(formatDisplayNumber(999)).toBe('999');
      expect(formatDisplayNumber(0)).toBe('0');
    });

    it('rounds decimal inputs to the nearest integer', () => {
      expect(formatDisplayNumber(12.7)).toBe('13');
    });

    it('rounds up into the compact range when rounding crosses 1,000', () => {
      // Math.round(999.99) === 1000, which triggers compact notation.
      expect(formatDisplayNumber(999.99)).toBe('1K');
    });

    it('stays below the compact threshold when rounding stays under 1,000', () => {
      // Math.round(999.4) === 999, below 1000, formatted normally.
      expect(formatDisplayNumber(999.4)).toBe('999');
    });
  });

  describe('hasDecimal=true (significant figures for values < 1, two decimal places otherwise)', () => {
    it('keeps up to two decimal places for values >= 1', () => {
      expect(formatDisplayNumber(12.3, true)).toBe('12.3');
      expect(formatDisplayNumber(12.34, true)).toBe('12.34');
      expect(formatDisplayNumber(999.4, true)).toBe('999.4');
      expect(formatDisplayNumber(999.99, true)).toBe('999.99');
    });

    it('uses 2 significant figures for values < 1 to preserve small numbers', () => {
      expect(formatDisplayNumber(0.0045, true)).toBe('0.0045');
      expect(formatDisplayNumber(0.001234, true)).toBe('0.0012');
      expect(formatDisplayNumber(0.5, true)).toBe('0.5');
    });

    it('abbreviates thousands while capping at two fraction digits', () => {
      expect(formatDisplayNumber(1234.56, true)).toBe('1.23K');
    });

    it('abbreviates millions while capping at two fraction digits', () => {
      expect(formatDisplayNumber(1_234_567.89, true)).toBe('1.23M');
    });
  });

  describe('negative values', () => {
    it('abbreviates large negative values', () => {
      expect(formatDisplayNumber(-2_500_000)).toBe('-2.5M');
    });

    it('triggers compact notation via the absolute value threshold', () => {
      expect(formatDisplayNumber(-1_000)).toBe('-1K');
    });
  });
});
