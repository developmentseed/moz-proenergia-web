import { describe, it, expect } from 'vitest';
import { FilterType } from '@/app/types';
import { MEDIA_URL_PREFIX } from '@/utils/api';
import {
  deriveFilterType,
  slugify,
  makeLabel,
  transformOptions,
  deriveSource,
  deriveLayerStyles,
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

    it('should transform string options to MapItemUnit', () => {
      const result = transformOptions(['Solar', 'Wind']);
      expect(result).toEqual([
        { id: 'Solar', label: 'Solar', color: undefined },
        { id: 'Wind', label: 'Wind', color: undefined },
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
        { id: 'Solar', label: 'Solar', color: '#FFD700' },
        { id: 'Wind', label: 'Wind', color: '#00CED1' },
        { id: 'Hydro', label: 'Hydro', color: undefined },
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
        url: `pmtiles://${MEDIA_URL_PREFIX}https://example.com/data.pmtiles`,
      });
    });

    it('should replace any file extension with .pmtiles', () => {
      expect(deriveSource('id', 'file.json').url).toBe(`pmtiles://${MEDIA_URL_PREFIX}file.pmtiles`);
      expect(deriveSource('id', 'file.csv').url).toBe(`pmtiles://${MEDIA_URL_PREFIX}file.pmtiles`);
      expect(deriveSource('id', 'path/to/file.geojson').url).toBe(`pmtiles://${MEDIA_URL_PREFIX}path/to/file.pmtiles`);
    });

    it('should use provided id', () => {
      const result = deriveSource('my-custom-id', 'file.json');
      expect(result.id).toBe('my-custom-id');
    });
  });

  describe('replaceSummaryIdColumn', () => {
    it('should replace "id" column with the first non-"id" key from metricField', () => {
      const fields = [
        { columns: ['id', 'pop_count'], label: 'Population' },
      ];
      const result = replaceSummaryIdColumn(fields, { id: 'int', technology: 'string' });

      expect(result).toEqual([
        { columns: ['pop_count', 'technology'], label: 'Population' },
      ]);
    });

    it('should not modify fields without "id" column', () => {
      const fields = [
        { columns: ['pop_count', 'area'], label: 'Stats' },
      ];
      const result = replaceSummaryIdColumn(fields, { id: 'int', technology: 'string' });

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
      const result = replaceSummaryIdColumn(fields, { id: 'int', grid_type: 'string' });

      expect(result).toEqual([
        { columns: ['connections', 'grid_type'], label: 'Connections' },
        { columns: ['area'], label: 'Area' },
        { columns: ['grid_type'], label: 'Count' },
      ]);
    });

    it('should throw when a field has an "id" column but metricField has no non-"id" key', () => {
      const fields = [
        { columns: ['id'], label: 'Summary' },
      ];

      expect(() => replaceSummaryIdColumn(fields, { id: 'int' })).toThrow(
        /no non-'id' key/,
      );
      expect(() => replaceSummaryIdColumn(fields, {})).toThrow(
        /no non-'id' key/,
      );
    });

    it('should not throw when no field has an "id" column, even if metricField only has "id"', () => {
      const fields = [
        { columns: ['pop_count'], label: 'Population' },
      ];

      // No 'id' column to replace, so the missing replacement key should never be consulted.
      expect(() => replaceSummaryIdColumn(fields, { id: 'int' })).not.toThrow();
    });
  });

  describe('deriveLayerStyles', () => {
    it('should return circle, line, and polygon layer styles', () => {
      const result = deriveLayerStyles('source-1', '#ff0000');

      expect(result.circleLayer).toBeDefined();
      expect(result.lineLayer).toBeDefined();
      expect(result.polygonLayer).toBeDefined();
    });

    it('should derive layer ids from the sourceId', () => {
      const result = deriveLayerStyles('my-source', '#ff0000');

      expect(result.circleLayer.id).toBe('my-source-circle-layer');
      expect(result.lineLayer.id).toBe('my-source-line-layer');
      expect(result.polygonLayer.id).toBe('my-source-polygon-layer');
    });

    it('should use the sourceId and default source-layer name on every layer', () => {
      const result = deriveLayerStyles('source-1', '#ff0000');

      for (const layer of [result.circleLayer, result.lineLayer, result.polygonLayer]) {
        expect(layer.source).toBe('source-1');
        expect(layer['source-layer']).toBe('data');
      }
    });

    it('should set the correct maplibre type on each layer', () => {
      const result = deriveLayerStyles('source-1', '#ff0000');

      expect(result.circleLayer.type).toBe('circle');
      expect(result.lineLayer.type).toBe('line');
      expect(result.polygonLayer.type).toBe('fill');
    });

    it('should apply the color to each layer paint', () => {
      const result = deriveLayerStyles('source-1', '#abcdef');

      expect(result.circleLayer.paint?.['circle-color']).toBe('#abcdef');
      expect(result.circleLayer.paint?.['circle-stroke-color']).toBe('#fff');
      expect(result.lineLayer.paint?.['line-color']).toBe('#abcdef');
      expect(result.polygonLayer.paint?.['fill-color']).toBe('#abcdef');
      expect(result.polygonLayer.paint?.['fill-outline-color']).toBe('#abcdef');
    });

    it('should default opacity to 1 when omitted', () => {
      const result = deriveLayerStyles('source-1', '#ff0000');

      // circle/line layers use 0.8 * opacity, polygon uses 0.5 * opacity
      expect(result.circleLayer.paint?.['circle-opacity']).toBeCloseTo(0.8);
      expect(result.lineLayer.paint?.['line-opacity']).toBeCloseTo(0.8);
      expect(result.polygonLayer.paint?.['fill-opacity']).toBeCloseTo(0.5);
    });

    it('should scale layer opacities by the opacity argument', () => {
      const result = deriveLayerStyles('source-1', '#ff0000', 0.5);

      expect(result.circleLayer.paint?.['circle-opacity']).toBeCloseTo(0.4); // 0.8 * 0.5
      expect(result.lineLayer.paint?.['line-opacity']).toBeCloseTo(0.4); // 0.8 * 0.5
      expect(result.polygonLayer.paint?.['fill-opacity']).toBeCloseTo(0.25); // 0.5 * 0.5
    });

  });

});
