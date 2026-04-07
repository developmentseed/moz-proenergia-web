'use client';
import { useState } from 'react';
import type { ReactElement } from 'react';
import maplibregl from 'maplibre-gl';
import { useControl, Marker, type MarkerProps, type ControlPosition } from 'react-map-gl/maplibre';
import MaplibreGeocoder, {
  type CarmenGeojsonFeature,
  type MaplibreGeocoderApi,
  type MaplibreGeocoderOptions,
} from '@maplibre/maplibre-gl-geocoder';
// CSS is imported in index.tsx alongside maplibre-gl.css

type GeocoderControlProps = Omit<MaplibreGeocoderOptions, 'maplibregl' | 'marker'> & {
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
  },
};

const noop = () => {};

export default function GeocoderControl(props: GeocoderControlProps) {
  const [marker, setMarker] = useState<ReactElement | null>(null);

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
      ctrl.on('results', onResults);
      ctrl.on('result', (evt) => {
        onResult(evt);
        const { result } = evt;
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
