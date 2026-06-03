import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { Flood } from '../api/types';
import { FLOOD_LEVEL_INTENSITY } from '../api/types';

interface Props {
  floods: Flood[];
}

// react-leaflet não tipa o plugin; criamos a layer manualmente.
type HeatLayer = L.Layer & { setLatLngs: (points: [number, number, number][]) => void };

export default function HeatLayer({ floods }: Props) {
  const map = useMap();
  const layerRef = useRef<HeatLayer | null>(null);

  useEffect(() => {
    const points: [number, number, number][] = floods.map((f) => [
      f.lat,
      f.lng,
      FLOOD_LEVEL_INTENSITY[f.level],
    ]);

    if (!layerRef.current) {
      layerRef.current = L.heatLayer(points, {
        radius: 45,
        blur: 18,
        max: 1.0,
        minOpacity: 0.45,
        maxZoom: 17,
        gradient: {
          0.2: '#22d3ee',
          0.4: '#3b82f6',
          0.6: '#f59e0b',
          0.8: '#f97316',
          1.0: '#ef4444',
        },
      }).addTo(map) as HeatLayer;
    } else {
      layerRef.current.setLatLngs(points);
    }
  }, [floods, map]);

  useEffect(() => {
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  return null;
}
