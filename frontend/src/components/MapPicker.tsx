import { MapContainer, useMapEvents } from 'react-leaflet';
import type { LatLng } from '../hooks/useGeolocation';
import { getBasemap, loadBasemapId } from '../lib/basemaps';
import BasemapTileLayer from './BasemapTileLayer';

interface Props {
  center: LatLng;
  onChange: (coords: LatLng) => void;
}

function CenterTracker({ onChange }: { onChange: (c: LatLng) => void }) {
  const map = useMapEvents({
    move: () => {
      const c = map.getCenter();
      onChange({ lat: c.lat, lng: c.lng });
    },
  });
  return null;
}

/**
 * Mapa arrastável com pino central fixo: o centro define lat/lng.
 * O componente só deve ser montado depois que `center` estiver definido
 * (localização do usuário resolvida), pois o MapContainer fixa o centro na montagem.
 */
export default function MapPicker({ center, onChange }: Props) {
  const basemap = getBasemap(loadBasemapId());
  return (
    <div className="map-picker">
      <MapContainer center={[center.lat, center.lng]} zoom={16} zoomControl={false}>
        <BasemapTileLayer basemap={basemap} />
        <CenterTracker onChange={onChange} />
      </MapContainer>
      <div className="center-pin">📍</div>
    </div>
  );
}
