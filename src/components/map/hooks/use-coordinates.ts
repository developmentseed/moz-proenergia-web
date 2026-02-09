'use client';
import { useQueryStates, parseAsFloat, throttle } from 'nuqs';

const COORDS = [-18.841,35.57];
const ZOOM = 5.5;

export function useCoordinates() {
  return useQueryStates({
    lat: parseAsFloat.withDefault(COORDS[0]),
    lng: parseAsFloat.withDefault(COORDS[1]),
    zoom: parseAsFloat.withDefault(ZOOM),
  }, {
      limitUrlUpdates: throttle(500)
  });
}