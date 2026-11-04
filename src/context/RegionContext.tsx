'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Region } from '@/lib/region';

const RegionContext = createContext<Region>('all');

export function RegionProvider({ region, children }: { region: Region; children: ReactNode }) {
  return <RegionContext.Provider value={region}>{children}</RegionContext.Provider>;
}

export function useRegion(): Region {
  return useContext(RegionContext);
}
