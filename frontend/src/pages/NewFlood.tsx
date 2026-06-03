import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { Flood, FloodLevel } from '../api/types';
import { FLOOD_LEVEL_LABEL } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useGeolocation, type LatLng } from '../hooks/useGeolocation';
import { useMapData } from '../map/MapDataContext';
import MapPicker from '../components/MapPicker';
import LoginModal from '../auth/LoginModal';

const LEVELS: { level: FloodLevel; color: string }[] = [
  { level: 'LOW', color: '#38bdf8' },
  { level: 'MEDIUM', color: '#f59e0b' },
  { level: 'HIGH', color: '#dc2626' },
];

export default function NewFlood() {
  const { user, loading } = useAuth();
  const { center, loading: geoLoading } = useGeolocation();
  const { refresh } = useMapData();
  const navigate = useNavigate();

  const [level, setLevel] = useState<FloodLevel | null>(null);
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!geoLoading && !coords) setCoords(center);
  }, [geoLoading, center, coords]);

  if (!loading && !user) {
    return <LoginModal onClose={() => navigate('/')} />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) return;
    if (!level) {
      setError('Selecione o nível do alagamento.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.post<Flood>('/floods', { level, lat: coords.lat, lng: coords.lng }, true);
      await refresh();
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Você atingiu o limite de 10 alagamentos ativos.');
      } else {
        setError('Não foi possível salvar o alagamento.');
      }
      setSubmitting(false);
    }
  }

  return (
    <form className="create-overlay" onSubmit={submit}>
      <div className="create-inner">
        <div className="create-fields">
          <header className="page-header">
            <Link to="/" className="back-link">←</Link>
            <h1>Reportar alagamento</h1>
          </header>

          <div className="level-options">
            {LEVELS.map(({ level: lv, color }) => (
              <button
                key={lv}
                type="button"
                className={`level-option ${level === lv ? 'selected' : ''}`}
                onClick={() => setLevel(lv)}
              >
                <span className="level-dot" style={{ background: color }} />
                {FLOOD_LEVEL_LABEL[lv]}
              </button>
            ))}
          </div>
        </div>

        <div className="create-map">
          <label>Localização (arraste o mapa)</label>
          {coords ? (
            <MapPicker center={coords} onChange={setCoords} />
          ) : (
            <p className="muted">Localizando você…</p>
          )}
        </div>

        <div className="create-actions">
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary form-submit" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Reportar alagamento'}
          </button>
        </div>
      </div>
    </form>
  );
}
