import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Signal } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { relativeTime } from '../lib/relativeTime';
import LoginModal from '../auth/LoginModal';

export default function MySignals() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<Signal[]>('/signals/mine', true)
      .then(setSignals)
      .finally(() => setFetching(false));
  }, [user]);

  if (!loading && !user) {
    return <LoginModal onClose={() => navigate('/')} />;
  }

  async function remove(id: string) {
    if (!confirm('Excluir esta sinalização?')) return;
    await api.del(`/signals/${id}`);
    setSignals((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="page">
      <header className="page-header">
        <Link to="/" className="back-link">←</Link>
        <h1>Minhas sinalizações</h1>
      </header>

      {fetching ? (
        <p className="muted">Carregando…</p>
      ) : signals.length === 0 ? (
        <p className="empty">Você não tem sinalizações ativas.</p>
      ) : (
        <div className="signal-list">
          {signals.map((s) => (
            <div key={s.id} className="signal-card">
              <span className="emoji">{s.emoji}</span>
              <div className="info">
                <h3>{s.title}</h3>
                <p className="muted">criada {relativeTime(s.createdAt)}</p>
                <p>{s.description}</p>
              </div>
              <button className="btn-danger" onClick={() => remove(s.id)}>
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
