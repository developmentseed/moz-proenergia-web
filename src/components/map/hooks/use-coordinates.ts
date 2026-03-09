'use client';
import { useQueryStates, parseAsFloat, throttle } from 'nuqs';

export const DEFAULT_COORDS = [-18.76303, 36.78403];
export const DEFAULT_ZOOM = 5;

interface Coordinates {
  lat: number;
  lng: number;
  zoom: number;
}

interface UseCoordinatesReturn {
  coords: Coordinates;
  setCoords: (coords: Coordinates) => void;
  removeCoordinates: () => void;
}

export function useCoordinates(): UseCoordinatesReturn {
  const [coords, setOriginCoords] = useQueryStates({
    lat: parseAsFloat.withDefault(DEFAULT_COORDS[0]),
    lng: parseAsFloat.withDefault(DEFAULT_COORDS[1]),
    zoom: parseAsFloat.withDefault(DEFAULT_ZOOM),
  }, {
    limitUrlUpdates: throttle(500)
  });

  const setCoords = ({ lat, lng, zoom }: {lat: number; lng: number; zoom: number}) => {
    setOriginCoords({
      lat: parseFloat(lat.toFixed(5)),
      lng: parseFloat(lng.toFixed(5)),
      zoom: parseFloat(zoom.toFixed(5)),
    });
  };
  const removeCoordinates = () => {
    setOriginCoords({
      lat: null,lng: null, zoom: null
    });
  };
  return { coords, setCoords, removeCoordinates };
}