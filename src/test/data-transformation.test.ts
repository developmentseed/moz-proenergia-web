import { describe, it, expect } from 'vitest';
import { FilterType } from '@/app/types';
import {
  deriveFilterType,
  slugify,
  makeLabel,
  transformOptions,
  deriveSource,
  geometryTypeToLayerType,
  getColormap,
} from '@/utils/data-transformation';

describe('data-transformation', () => {
  describe('deriveFilterType', () => {
    it('should return admin type for Admin_1 column', () => {
      expect(deriveFilterType('Admin_1', [])).toBe(FilterType.admin);
    });

    it('should return admin type for District column', () => {
      expect(deriveFilterType('District', [])).toBe(FilterType.admin);
    });

    it('should return admin type for Posto column', () => {
      expect(deriveFilterType('Posto', [])).toBe(FilterType.admin);
    });

    it('should return admin type for Localidade column', () => {
      expect(deriveFilterType('Localidade', [])).toBe(FilterType.admin);
    });

    it('should return numeric type for two-element number array (range)', () => {
      expect(deriveFilterType('pop_count', [0, 1000])).toBe(FilterType.numeric);
    });

    it('should return checkbox type for string options', () => {
      expect(deriveFilterType('energy_type', ['Solar', 'Wind', 'Hydro'])).toBe(FilterType.checkbox);
    });

    it('should return checkbox type for empty options', () => {
      expect(deriveFilterType('some_column', [])).toBe(FilterType.checkbox);
    });

    it('should return checkbox type for null/undefined options', () => {
      expect(deriveFilterType('nullable', null)).toBe(FilterType.checkbox);
      expect(deriveFilterType('undefined', undefined)).toBe(FilterType.checkbox);
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('Hello')).toBe('hello');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
    });

    it('should replace underscores with hyphens', () => {
      expect(slugify('hello_world')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('hello@world!')).toBe('hello-world');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(slugify('_hello world_')).toBe('hello-world');
    });

    it('should handle multiple consecutive non-alphanumeric chars', () => {
      expect(slugify('hello___world')).toBe('hello-world');
    });

    it('should handle CamelCase', () => {
      expect(slugify('HelloWorld')).toBe('helloworld');
    });
  });

  describe('makeLabel', () => {
    it('should replace underscores with spaces', () => {
      expect(makeLabel('hello_world')).toBe('hello world');
    });

    it('should add space before capital letters', () => {
      expect(makeLabel('helloWorld')).toBe('hello World');
    });

    it('should handle both patterns together', () => {
      expect(makeLabel('hello_worldTest')).toBe('hello world Test');
    });

    it('should not modify already spaced strings', () => {
      expect(makeLabel('hello world')).toBe('hello world');
    });

    it('should handle column names like Technology2030', () => {
      expect(makeLabel('Technology2030')).toBe('Technology2030');
    });

    it('should handle PascalCase', () => {
      expect(makeLabel('HelloWorld')).toBe('Hello World');
    });
  });

  describe('transformOptions', () => {
    it('should return empty array for non-array input', () => {
      expect(transformOptions(null)).toEqual([]);
      expect(transformOptions(undefined)).toEqual([]);
      expect(transformOptions('string')).toEqual([]);
    });

    it('should transform string options to ItemUnit', () => {
      const result = transformOptions(['Solar', 'Wind']);
      expect(result).toEqual([
        { value: 'Solar', label: 'Solar', color: null },
        { value: 'Wind', label: 'Wind', color: null },
      ]);
    });

    it('should apply makeLabel to option values', () => {
      const result = transformOptions(['hello_world']);
      expect(result[0].label).toBe('hello world');
    });

    it('should apply colormap when provided', () => {
      const colormap = [
        { value: 'Solar', color: '#FFD700' },
        { value: 'Wind', color: '#00CED1' },
      ];
      const result = transformOptions(['Solar', 'Wind', 'Hydro'], colormap);

      expect(result).toEqual([
        { value: 'Solar', label: 'Solar', color: '#FFD700' },
        { value: 'Wind', label: 'Wind', color: '#00CED1' },
        { value: 'Hydro', label: 'Hydro', color: null },
      ]);
    });

    it('should handle colormap with missing entries', () => {
      const colormap = [{ value: 'Solar', color: '#FFD700' }];
      const result = transformOptions(['Solar', 'Wind'], colormap);

      expect(result[0].color).toBe('#FFD700');
      expect(result[1].color).toBe(null);
    });

    it('should filter colormap entries without value or color', () => {
      const colormap = [
        { value: 'Solar', color: '#FFD700' },
        { value: '', color: '#000000' },
        { value: 'Wind', color: '' },
      ];
      const result = transformOptions(['Solar', 'Wind'], colormap);

      expect(result[0].color).toBe('#FFD700');
      expect(result[1].color).toBe(null);
    });

    it('should pass through non-string options unchanged', () => {
      const existingItem = { value: 'test', label: 'Test Label', color: '#FFF' };
      const result = transformOptions([existingItem]);
      expect(result[0]).toBe(existingItem);
    });
  });

  describe('deriveSource', () => {
    it('should create source config with pmtiles URL', () => {
      const result = deriveSource('source-1', 'https://example.com/data.csv');

      expect(result).toEqual({
        id: 'source-1',
        type: 'vector',
        minzoom: 5,
        maxzoom: 15,
        url: 'pmtiles://https://example.com/data.pmtiles',
      });
    });

    it('should replace any file extension with .pmtiles', () => {
      expect(deriveSource('id', 'file.json').url).toBe('pmtiles://file.pmtiles');
      expect(deriveSource('id', 'file.csv').url).toBe('pmtiles://file.pmtiles');
      expect(deriveSource('id', 'path/to/file.geojson').url).toBe('pmtiles://path/to/file.pmtiles');
    });

    it('should use provided id', () => {
      const result = deriveSource('my-custom-id', 'file.json');
      expect(result.id).toBe('my-custom-id');
    });
  });

  describe('getColormap', () => {
    it('should return colormap for Technology2030', () => {
      const result = getColormap('Technology2030');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
      expect(result!.some(c => c.value === 'GridExtension')).toBe(true);
    });

    it('should return colormap for LeastCostTech', () => {
      const result = getColormap('LeastCostTech');
      expect(result).toBeDefined();
      expect(result!.some(c => c.value === 'SHS')).toBe(true);
    });

    it('should return colormap for PUE_potential', () => {
      const result = getColormap('PUE_potential');
      expect(result).toBeDefined();
      expect(result!.some(c => c.value === 'High')).toBe(true);
    });

    it('should return null for unknown column', () => {
      expect(getColormap('unknown_column')).toBeNull();
    });
  });
});
