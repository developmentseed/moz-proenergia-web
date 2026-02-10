'use client';
import { useQueryStates, parseAsFloat, throttle } from 'nuqs';

const COORDS = [-18.76304, 36.78403];
const ZOOM = 4.97;

export function useCoordinates() {
  return useQueryStates({
    lat: parseAsFloat.withDefault(COORDS[0]),
    lng: parseAsFloat.withDefault(COORDS[1]),
    zoom: parseAsFloat.withDefault(ZOOM),
  }, {
      limitUrlUpdates: throttle(500)
  });
}