'use client';

import { createContext, useContext, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useQueryStates, parseAsFloat, throttle } from 'nuqs';

export const DEFAULT_COORDS = [-18.76303, 36.78403];
export const DEFAULT_ZOOM = 5;

export const coordinateParsers = {
  lat: parseAsFloat.withDefault(DEFAULT_COORDS[0]),
  lng: parseAsFloat.withDefault(DEFAULT_COORDS[1]),
  zoom: parseAsFloat.withDefault(DEFAULT_ZOOM),
};

interface Coordinates {
  lat: number;
  lng: number;
  zoom: number;
}

type MapCoordsContextType = {
  coords: Coordinates;
  setCoords: (coords: Coordinates) => void;
  removeCoordinates: () => void;
};

const MapCoordsContext = createContext<MapCoordsContextType | null>(null);

export function MapCoordsProvider({ children }: { children: ReactNode }) {
  const [coords, setOriginCoords] = useQueryStates(coordinateParsers, {
    limitUrlUpdates: throttle(500),
  });

  const setCoords = useCallback(
    ({ lat, lng, zoom }: Coordinates) => {
      setOriginCoords({
        lat: parseFloat(lat.toFixed(5)),
        lng: parseFloat(lng.toFixed(5)),
        zoom: parseFloat(zoom.toFixed(5)),
      });
    },
    [setOriginCoords],
  );

  const removeCoordinates = useCallback(() => {
    setOriginCoords({ lat: null, lng: null, zoom: null });
  }, [setOriginCoords]);

  // Clean up URL params when leaving model pages (provider unmounts)
  useEffect(() => {
    return () => {
      removeCoordinates();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ coords, setCoords, removeCoordinates }),
    [coords, setCoords, removeCoordinates],
  );

  return (
    <MapCoordsContext.Provider value={value}>
      {children}
    </MapCoordsContext.Provider>
  );
}

export const useMapCoords = () => {
  const context = useContext(MapCoordsContext);
  if (!context) {
    throw new Error('useMapCoords must be used within MapCoordsProvider (model layout)');
  }
  return context;
};
