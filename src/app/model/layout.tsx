'use client';
import { Suspense } from 'react';
import { MapCoordsProvider } from '@/utils/context/map-coords';

export default function ModelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense><MapCoordsProvider>{children}</MapCoordsProvider></Suspense>;
}
