import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { Signal } from '../api/types';
import { useGeolocation, type LatLng } from '../hooks/useGeolocation';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import { useAuth } from '../auth/AuthContext';
import { useMapData } from '../map/MapDataContext';
import { relativeTime } from '../lib/relativeTime';
import { getBasemap, loadBasemapId, saveBasemapId } from '../lib/basemaps';
import HeatLayer from '../components/HeatLayer';
import SignalMarkers from '../components/SignalMarkers';
import SignalPanel from '../components/SignalPanel';
import Fab from '../components/Fab';
import BasemapTileLayer from '../components/BasemapTileLayer';
import BasemapSwitcher from '../components/BasemapSwitcher';
import LoginModal from '../auth/LoginModal';

/**
 * Registra a instância do mapa no contexto, faz a carga inicial dos pontos
 * e recarrega (com debounce) sempre que o usuário move/zooma o mapa.
 */
function MapController({ onMap }: { onMap: (map: LeafletMap) => void }) {
  const map = useMap();
  const { registerMap, refresh } = useMapData();
  useEffect(() => {
    registerMap(map);
    onMap(map);
    void refresh();

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMoveEnd = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void refresh(), 400);
    };
    map.on('moveend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
      clearTimeout(timer);
    };
  }, [map, registerMap, refresh, onMap]);
  return null;
}

export default function MapScreen() {
  const { center, loading } = useGeolocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { floods, signals, lastUpdatedAt, loading: refreshing, refresh } = useMapData();

  const [selected, setSelected] = useState<Signal | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [basemapId, setBasemapId] = useState(loadBasemapId);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [viewCenter, setViewCenter] = useState<LatLng | null>(null);
  const pendingRoute = useRef<string | null>(null);

  // Reverte o nome do lugar conforme o centro do mapa muda (pan/zoom).
  useEffect(() => {
    if (!map) return;
    const update = () => {
      const c = map.getCenter();
      setViewCenter({ lat: c.lat, lng: c.lng });
    };
    update();
    map.on('moveend', update);
    return () => {
      map.off('moveend', update);
    };
  }, [map]);

  const place = useReverseGeocode(viewCenter ?? center);
  const hasAlert = floods.length > 0;
  const locationName = place.neighborhood ?? place.city ?? 'Sua região';
  const locationCity = [place.city, place.state].filter(Boolean).join(', ');

  function changeBasemap(id: string) {
    setBasemapId(id);
    saveBasemapId(id);
  }

  function go(route: string) {
    if (!user) {
      pendingRoute.current = route;
      setLoginOpen(true);
      return;
    }
    navigate(route);
  }

  if (loading) {
    return <div className="empty">Localizando você…</div>;
  }

  return (
    <div className="map-full">
      <header className="topbar">
        <Link to="/" className="topbar-logo">
          <span className={`logo-dot ${hasAlert ? 'alert' : ''}`} />
          Alerta 24h
        </Link>
        <div className={`status-badge ${hasAlert ? 'alert' : ''}`}>
          {hasAlert ? 'Alagamento ativo' : 'Sem alertas ativos'}
        </div>
        <div className="topbar-actions">
          <Link to="/contatos" className="bar-btn danger">
            <i className="ti ti-phone-call" aria-hidden="true" />
            <span className="bar-btn-label">Emergência</span>
          </Link>
          {user ? (
            <Link to="/minhas-sinalizacoes" className="bar-btn">
              <i className="ti ti-bell" aria-hidden="true" />
              <span className="bar-btn-label">Sinalizações</span>
            </Link>
          ) : (
            <button className="bar-btn" onClick={() => setLoginOpen(true)}>
              <i className="ti ti-login" aria-hidden="true" />
              <span className="bar-btn-label">Entrar</span>
            </button>
          )}
        </div>
      </header>

      <div className="map-area">
        <div className={`region-badge ${hasAlert ? 'alert' : ''}`}>
          <span className="toast-dot" />
          {lastUpdatedAt
            ? `Última atualização desta região: ${relativeTime(lastUpdatedAt)}`
            : 'Sem alagamentos reportados nesta região'}
        </div>

        <MapContainer center={[center.lat, center.lng]} zoom={14} zoomControl={false}>
          <BasemapTileLayer basemap={getBasemap(basemapId)} />
          <MapController onMap={setMap} />
          <HeatLayer floods={floods} />
          <SignalMarkers signals={signals} onSelect={setSelected} />
        </MapContainer>

        <div className="map-overlay-right">
          <button
            className="refresh-btn"
            onClick={() => void refresh()}
            disabled={refreshing}
            aria-label="Atualizar pontos do mapa"
            title="Atualizar pontos desta região"
          >
            <i className={`ti ti-refresh ${refreshing ? 'spin' : ''}`} aria-hidden="true" />
            Atualizar mapa
          </button>
          <div className="last-update">
            {lastUpdatedAt ? `Atualizado ${relativeTime(lastUpdatedAt)}` : 'Atualizado agora'}
          </div>
          <div className="zoom-group">
            <button className="zoom-btn" aria-label="Aumentar zoom" onClick={() => map?.zoomIn()}>
              +
            </button>
            <button className="zoom-btn" aria-label="Diminuir zoom" onClick={() => map?.zoomOut()}>
              −
            </button>
          </div>
        </div>

        <BasemapSwitcher value={basemapId} onChange={changeBasemap} />

        <div className="map-overlay-bottom">
          <div className="bottom-row">
            <div className="location-info">
              <div className="location-name">{locationName}</div>
              <div className="location-sub">
                {locationCity && (
                  <>
                    {locationCity}
                    <span className="sep">·</span>
                  </>
                )}
                {hasAlert ? (
                  <span className="status-warn">
                    <i className="ti ti-alert-triangle" style={{ verticalAlign: '-1px' }} aria-hidden="true" /> Alagamento
                    reportado
                  </span>
                ) : (
                  <span className="status-ok">
                    <i className="ti ti-shield-check" style={{ verticalAlign: '-1px' }} aria-hidden="true" /> Área segura
                  </span>
                )}
              </div>
            </div>
            <Fab
              onFlood={() => go('/alagamento/novo')}
              onSignal={() => go('/sinalizacao/nova')}
            />
          </div>
        </div>

        <SignalPanel signal={selected} onClose={() => setSelected(null)} />
      </div>

      {loginOpen && (
        <LoginModal
          onClose={() => {
            setLoginOpen(false);
            pendingRoute.current = null;
          }}
          onSuccess={() => {
            setLoginOpen(false);
            if (pendingRoute.current) navigate(pendingRoute.current);
          }}
        />
      )}
    </div>
  );
}
