import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { api } from '../api/client';
import type { Flood, FloodsResponse, Signal } from '../api/types';

interface MapDataValue {
  floods: Flood[];
  signals: Signal[];
  lastUpdatedAt: string | null;
  loading: boolean;
  registerMap: (map: LeafletMap) => void;
  refresh: () => Promise<void>;
}

const MapDataContext = createContext<MapDataValue | null>(null);

function bboxParam(map: LeafletMap): string {
  const b = map.getBounds();
  const sw = b.getSouthWest();
  const ne = b.getNorthEast();
  return `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
}

export function MapDataProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [floods, setFloods] = useState<Flood[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    setLoading(true);
    try {
      const bbox = bboxParam(map);
      const [floodsResp, signalsResp] = await Promise.all([
        api.get<FloodsResponse>(`/floods?bbox=${bbox}`),
        api.get<Signal[]>(`/signals?bbox=${bbox}`),
      ]);
      setFloods(floodsResp.items);
      setSignals(signalsResp);
      setLastUpdatedAt(floodsResp.lastUpdatedAt);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerMap = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  return (
    <MapDataContext.Provider
      value={{ floods, signals, lastUpdatedAt, loading, registerMap, refresh }}
    >
      {children}
    </MapDataContext.Provider>
  );
}

export function useMapData(): MapDataValue {
  const ctx = useContext(MapDataContext);
  if (!ctx) throw new Error('useMapData deve ser usado dentro de MapDataProvider');
  return ctx;
}
