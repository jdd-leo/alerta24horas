import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { Signal } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useGeolocation, type LatLng } from '../hooks/useGeolocation';
import { useMapData } from '../map/MapDataContext';
import EmojiPicker from '../components/EmojiPicker';
import MapPicker from '../components/MapPicker';
import LoginModal from '../auth/LoginModal';

const MAX_PHOTOS = 2;

export default function NewSignal() {
  const { user, loading } = useAuth();
  const { center, loading: geoLoading } = useGeolocation();
  const { refresh } = useMapData();
  const navigate = useNavigate();

  const [emoji, setEmoji] = useState('💧');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!geoLoading && !coords) setCoords(center);
  }, [geoLoading, center, coords]);

  if (!loading && !user) {
    return <LoginModal onClose={() => navigate('/')} />;
  }

  function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS);
    setPhotos(files);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) return;
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('emoji', emoji);
      form.append('title', title);
      form.append('description', description);
      form.append('lat', String(coords.lat));
      form.append('lng', String(coords.lng));
      photos.forEach((p) => form.append('photos', p));
      await api.postForm<Signal>('/signals', form);
      await refresh();
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Você atingiu o limite de 3 sinalizações ativas.');
      } else {
        setError('Não foi possível salvar a sinalização.');
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
            <h1>Nova sinalização</h1>
          </header>

          <div className="field">
            <label>Tipo (emoji)</label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>

          <div className="field">
            <label>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 30))}
              maxLength={30}
              required
              placeholder="Ex.: Precisamos de água"
            />
            <span className="char-count">{title.length}/30</span>
          </div>

          <div className="field">
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={3}
              required
              placeholder="Detalhe o que é necessário ou o que você quer sinalizar"
            />
            <span className="char-count">{description.length}/200</span>
          </div>

          <div className="field">
            <label>Fotos (até 2)</label>
            <input type="file" accept="image/*" multiple onChange={onPhotos} />
            {photos.length > 0 && (
              <div className="photo-previews">
                {photos.map((p, i) => (
                  <img key={i} src={URL.createObjectURL(p)} alt={`foto ${i + 1}`} />
                ))}
              </div>
            )}
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
            {submitting ? 'Salvando…' : 'Salvar sinalização'}
          </button>
        </div>
      </div>
    </form>
  );
}
