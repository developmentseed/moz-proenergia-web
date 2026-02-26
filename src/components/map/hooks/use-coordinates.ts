'use client';
import { useQueryStates, parseAsFloat, throttle } from 'nuqs';

export const DEFAULT_COORDS = [-18.76303999999999, 36.78403000000003];
export const DEFAULT_ZOOM = 5;

export function useCoordinates() {
  return useQueryStates({
    lat: parseAsFloat.withDefault(DEFAULT_COORDS[0]),
    lng: parseAsFloat.withDefault(DEFAULT_COORDS[1]),
    zoom: parseAsFloat.withDefault(DEFAULT_ZOOM),
  }, {
      limitUrlUpdates: throttle(500)
  });
}