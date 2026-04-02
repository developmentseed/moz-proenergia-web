'use client';
import { useState, useRef } from 'react';
import type { ReactElement } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useControl, useMap, Marker, type MarkerProps, type ControlPosition } from 'react-map-gl/maplibre';
import MaplibreGeocoder, {
  type CarmenGeojsonFeature,
  type MaplibreGeocoderApi,
  type MaplibreGeocoderOptions,
} from '@maplibre/maplibre-gl-geocoder';
// CSS is imported in index.tsx alongside maplibre-gl.css

type GeocoderControlProps = Omit<MaplibreGeocoderOptions, 'maplibregl' | 'marker' | 'reverseGeocode'> & {
  marker?: boolean | Omit<MarkerProps, 'longitude' | 'latitude'>;
  position: ControlPosition;
  onLoading?: (e: object) => void;
  onResults?: (e: object) => void;
  onResult?: (e: object) => void;
  onError?: (e: object) => void;
};

const geocoderApi: MaplibreGeocoderApi = {
  forwardGeocode: async (config) => {
    const features: CarmenGeojsonFeature[] = [];

    // Detect "lat, lng" or "lat lng" — e.g. "-25.123, 32.456" or "-25.123 32.456".
    const rawQuery = String(config.query).trim();
    const coordMatch = rawQuery.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
    if (coordMatch) {
      let lat = parseFloat(coordMatch[1]);
      let lng = parseFloat(coordMatch[2]);

      // Auto-correct if the user entered lng, lat instead of lat, lng.
      if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
        [lat, lng] = [lng, lat];
      }

      // Reject out-of-range values rather than flying to an invalid location.
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return { type: 'FeatureCollection', features: [] };
      }

      const center: [number, number] = [lng, lat];
      return {
        type: 'FeatureCollection',
        features: [{
          id: `coord-${lat}-${lng}`,
          type: 'Feature',
          geometry: { type: 'Point', coordinates: center },
          place_name: `${lat}, ${lng}`,
          properties: {},
          text: `${lat}, ${lng}`,
          place_type: ['place'],
          center,
        } as CarmenGeojsonFeature],
      };
    }

    try {
      const params = new URLSearchParams({
        q: String(config.query),
        format: 'geojson',
        polygon_geojson: '1',
        addressdetails: '1',
      });
      if (config.bbox) {
        // Nominatim viewbox: minLng,minLat,maxLng,maxLat — same order as geocoder bbox
        params.set('viewbox', config.bbox.join(','));
        params.set('bounded', '1');
      }
      if (config.countries) {
        params.set('countrycodes', config.countries);
      }
      const request = `https://nominatim.openstreetmap.org/search?${params}`;
      const response = await fetch(request);
      const geojson = await response.json();
      for (const feature of geojson.features) {
        const center = [
          feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
          feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
        ];
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: center },
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ['place'],
          center,
        } as CarmenGeojsonFeature);
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }
    return { type: 'FeatureCollection', features };
  }
};

const noop = () => {};

export default function GeocoderControl(props: GeocoderControlProps) {
  const [marker, setMarker] = useState<ReactElement | null>(null);

  const { current: mapRef } = useMap();
  const pendingCoordRef = useRef<[number, number] | null>(null);

  const {
    onLoading = noop,
    onResults = noop,
    onResult = noop,
    onError = noop,
    marker: showMarker = true,
    position,
    ...geocoderProps
  } = props;

  useControl<MaplibreGeocoder>(
    () => {
      const ctrl = new MaplibreGeocoder(geocoderApi, {
        ...geocoderProps,
        marker: false,
        maplibregl,
      });
      ctrl.on('loading', onLoading);
      ctrl.on('results', (evt) => {
        onResults(evt);
        const features = (evt as { features?: CarmenGeojsonFeature[] }).features ?? [];
        if (features.length === 1 && String(features[0].id ?? '').startsWith('coord-')) {
          // Store the coord — flyTo only fires when the user presses Enter.
          pendingCoordRef.current = features[0].center as [number, number];
        } else {
          pendingCoordRef.current = null;
        }
      });

      // Attach Enter key listener using capture so it fires before the geocoder's
      // own handler, which would otherwise select the first dropdown result.
      setTimeout(() => {
        const input = (ctrl as unknown as { container: HTMLElement }).container?.querySelector('input');
        if (input) {
          input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && pendingCoordRef.current) {
              // Prevent the geocoder from selecting a (potentially stale) place result.
              e.stopImmediatePropagation();
              const [lng, lat] = pendingCoordRef.current;
              mapRef?.flyTo({ center: [lng, lat], zoom: 16 });
              pendingCoordRef.current = null;
            }
          }, { capture: true });
        }
      }, 0);
      ctrl.on('result', (evt) => {
        onResult(evt);
        const { result } = evt;
        // If the geocoder selected a coord feature, re-fly at the correct zoom —
        // the geocoder's internal flyTo may use a different zoom.
        if (String(result?.id ?? '').startsWith('coord-') && result?.center) {
          mapRef?.flyTo({ center: result.center as [number, number], zoom: 16 });
          return;
        }
        const location =
          result &&
          (result.center ||
            (result.geometry?.type === 'Point' && result.geometry.coordinates));
        if (location && showMarker) {
          const markerProps = typeof showMarker === 'object' ? showMarker : {};
          setMarker(
            <Marker {...markerProps} longitude={location[0]} latitude={location[1]} />,
          );
        } else {
          setMarker(null);
        }
      });
      ctrl.on('error', onError);
      return ctrl;
    },
    { position },
  );

  return marker;
}
