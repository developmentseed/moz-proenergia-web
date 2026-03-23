'use client';

import { MapCoordsProvider } from '@/utils/context/map-coords';

export default function ModelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MapCoordsProvider>{children}</MapCoordsProvider>;
}
