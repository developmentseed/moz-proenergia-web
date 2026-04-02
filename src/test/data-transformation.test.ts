import { describe, it, expect } from 'vitest';
import { FilterType } from '@/app/types';
import {
  deriveFilterType,
  slugify,
  makeLabel,
  transformOptions,
  deriveSource,
  deriveLayerStyles,
  getColormap,
  replaceSummaryIdColumn,
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
        { value: 'Solar', label: 'Solar', color: undefined },
        { value: 'Wind', label: 'Wind', color: undefined },
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
        { value: 'Hydro', label: 'Hydro', color: undefined },
      ]);
    });

    it('should handle colormap with missing entries', () => {
      const colormap = [{ value: 'Solar', color: '#FFD700' }];
      const result = transformOptions(['Solar', 'Wind'], colormap);

      expect(result[0].color).toBe('#FFD700');
      expect(result[1].color).toBe(undefined);
    });

    it('should filter colormap entries without value or color', () => {
      const colormap = [
        { value: 'Solar', color: '#FFD700' },
        { value: '', color: '#000000' },
        { value: 'Wind', color: '' },
      ];
      const result = transformOptions(['Solar', 'Wind'], colormap);

      expect(result[0].color).toBe('#FFD700');
      expect(result[1].color).toBe(undefined);
    });

  });

  describe('deriveSource', () => {
    it('should create source config with pmtiles URL', () => {
      const result = deriveSource('source-1', 'https://example.com/data.csv');

      expect(result).toEqual({
        id: 'source-1',
        type: 'vector',
        minzoom: 5,
        url: 'pmtiles://https://proenergia-staging.ds.io/media/https://example.com/data.pmtiles',
      });
    });

    it('should replace any file extension with .pmtiles', () => {
      expect(deriveSource('id', 'file.json').url).toBe('pmtiles://https://proenergia-staging.ds.io/media/file.pmtiles');
      expect(deriveSource('id', 'file.csv').url).toBe('pmtiles://https://proenergia-staging.ds.io/media/file.pmtiles');
      expect(deriveSource('id', 'path/to/file.geojson').url).toBe('pmtiles://https://proenergia-staging.ds.io/media/path/to/file.pmtiles');
    });

    it('should use provided id', () => {
      const result = deriveSource('my-custom-id', 'file.json');
      expect(result.id).toBe('my-custom-id');
    });
  });

  describe('replaceSummaryIdColumn', () => {
    it('should replace "id" column with mainColumn', () => {
      const fields = [
        { columns: ['id', 'pop_count'], label: 'Population' },
      ];
      const result = replaceSummaryIdColumn(fields, 'technology');

      expect(result).toEqual([
        { columns: ['pop_count', 'technology'], label: 'Population' },
      ]);
    });

    it('should not modify fields without "id" column', () => {
      const fields = [
        { columns: ['pop_count', 'area'], label: 'Stats' },
      ];
      const result = replaceSummaryIdColumn(fields, 'technology');

      expect(result).toEqual([
        { columns: ['pop_count', 'area'], label: 'Stats' },
      ]);
    });

    it('should handle mix of fields with and without "id"', () => {
      const fields = [
        { columns: ['id', 'connections'], label: 'Connections' },
        { columns: ['area'], label: 'Area' },
        { columns: ['id'], label: 'Count' },
      ];
      const result = replaceSummaryIdColumn(fields, 'grid_type');

      expect(result).toEqual([
        { columns: ['connections', 'grid_type'], label: 'Connections' },
        { columns: ['area'], label: 'Area' },
        { columns: ['grid_type'], label: 'Count' },
      ]);
    });

    it('should use DEFAULT_COL as mainColumn when visualization_column is empty', () => {
      const fields = [
        { columns: ['id'], label: 'Summary' },
      ];
      const result = replaceSummaryIdColumn(fields, 'default');

      expect(result).toEqual([
        { columns: ['default'], label: 'Summary' },
      ]);
    });
  });

  describe('deriveLayerStyles', () => {
    it('should return both circle and line layer styles', () => {
      const result = deriveLayerStyles('source-1');

      expect(result.circleLayer).toBeDefined();
      expect(result.lineLayer).toBeDefined();
    });

  });

});
