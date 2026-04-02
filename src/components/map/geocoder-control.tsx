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

// Zoom level used when navigating to entered coordinates.
const COORD_ZOOM = 16;
// Prefix used to identify synthetic coordinate features in results.
const COORD_ID_PREFIX = 'coord-';

// Returns [lng, lat] if the query is coordinate-shaped ("lat, lng" or "lat lng").
// Auto-swaps if values appear reversed. Returns false (not null) when the shape
// matches but values are out of range — caller should not fall back to geocoding.
function parseCoords(query: string): [number, number] | false | null {
  const match = String(query).trim().match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  let lat = parseFloat(match[1]);
  let lng = parseFloat(match[2]);
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) [lat, lng] = [lng, lat];
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  return [lng, lat];
}

const geocoderApi: MaplibreGeocoderApi = {
  forwardGeocode: async (config) => {
    const coords = parseCoords(String(config.query));
    if (coords === false) return { type: 'FeatureCollection', features: [] };
    if (coords) {
      const [lng, lat] = coords;
      const center: [number, number] = [lng, lat];
      return {
        type: 'FeatureCollection',
        features: [{
          id: `${COORD_ID_PREFIX}${lat}-${lng}`,
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

    const features: CarmenGeojsonFeature[] = [];
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
      if (config.countries) params.set('countrycodes', config.countries);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
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
  },

  // Required by MaplibreGeocoderApi but unused — users don't click the map to reverse geocode.
  reverseGeocode: async () => ({ type: 'FeatureCollection', features: [] }),
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
              mapRef?.flyTo({ center: [lng, lat], zoom: COORD_ZOOM });
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
          mapRef?.flyTo({ center: result.center as [number, number], zoom: COORD_ZOOM });
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
