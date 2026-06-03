export interface Basemap {
  id: string;
  label: string;
  url: string;
  attribution: string;
  subdomains?: string;
  /** Camada transparente de rótulos (nomes de ruas) sobreposta à base, quando a base não os traz. */
  labelsUrl?: string;
}

export const BASEMAPS: Basemap[] = [
  {
    id: 'dark',
    label: 'Escuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
  },
  {
    id: 'light',
    label: 'Claro',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
  },
  {
    id: 'standard',
    label: 'Padrão',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  },
  {
    id: 'satellite',
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    labelsUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
  },
];

const STORAGE_KEY = 'alerta24h_basemap';
const DEFAULT_BASEMAP_ID = 'standard';

export function getBasemap(id: string | null): Basemap {
  return (
    BASEMAPS.find((b) => b.id === id) ??
    BASEMAPS.find((b) => b.id === DEFAULT_BASEMAP_ID)!
  );
}

export function loadBasemapId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_BASEMAP_ID;
}

export function saveBasemapId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}
