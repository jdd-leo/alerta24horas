import { useEffect, useState } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

// Fallback: João Pessoa/PB (região costeira sujeita a alagamentos)
const DEFAULT_CENTER: LatLng = { lat: -7.115, lng: -34.861 };

interface GeoState {
  center: LatLng;
  located: boolean;
  loading: boolean;
}

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({
    center: DEFAULT_CENTER,
    located: false,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          located: true,
          loading: false,
        });
      },
      () => setState((s) => ({ ...s, loading: false })),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  return state;
}
