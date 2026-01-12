'use client';
import { useQueryStates, parseAsFloat } from 'nuqs';

const COORDS = [-25.9692, 32.5732];
const ZOOM = 7;

export function useCoordinates() {
  return useQueryStates({
    lat: parseAsFloat.withDefault(COORDS[0]),
    lng: parseAsFloat.withDefault(COORDS[1]),
    zoom: parseAsFloat.withDefault(ZOOM),
  });
}