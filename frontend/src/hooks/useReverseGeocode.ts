import { useEffect, useState } from 'react';
import type { LatLng } from './useGeolocation';

export interface PlaceName {
  /** Bairro/distrito quando disponível. */
  neighborhood: string | null;
  /** Cidade/município. */
  city: string | null;
  /** Sigla da UF (ex.: "PB"), extraída de ISO3166-2. */
  state: string | null;
}

interface NominatimAddress {
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  quarter?: string;
  hamlet?: string;
  city?: string;
  town?: string;
  municipality?: string;
  village?: string;
  'ISO3166-2-lvl4'?: string;
}

/**
 * Resolve o nome do lugar (bairro/cidade/UF) a partir de coordenadas usando o
 * serviço público do Nominatim (OpenStreetMap, sem chave). Reconsulta quando as
 * coordenadas mudam de forma significativa.
 */
export function useReverseGeocode(center: LatLng): PlaceName {
  const [place, setPlace] = useState<PlaceName>({
    neighborhood: null,
    city: null,
    state: null,
  });

  // Arredonda (~110m) para evitar reconsultas a cada micro-variação ao navegar.
  const lat = center.lat.toFixed(3);
  const lng = center.lng.toFixed(3);

  useEffect(() => {
    const controller = new AbortController();
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=14` +
      `&addressdetails=1&lat=${lat}&lon=${lng}`;

    fetch(url, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'pt-BR' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { address?: NominatimAddress }) => {
        const a = data.address ?? {};
        setPlace({
          neighborhood:
            a.suburb ?? a.neighbourhood ?? a.city_district ?? a.quarter ?? a.hamlet ?? null,
          city: a.city ?? a.town ?? a.municipality ?? a.village ?? null,
          state: a['ISO3166-2-lvl4']?.split('-')[1] ?? null,
        });
      })
      .catch(() => {
        /* offline ou bloqueado: mantém o estado anterior */
      });

    return () => controller.abort();
  }, [lat, lng]);

  return place;
}
