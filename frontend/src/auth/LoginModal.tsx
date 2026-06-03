import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthContext';

const hasGoogle = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ onClose, onSuccess }: Props) {
  const { loginWithGoogle, loginDev } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleDev(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await loginDev(email);
      onSuccess?.();
    } catch {
      setError('Falha no login de desenvolvimento');
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Entrar</h2>
        <p className="muted">
          O login é necessário apenas para criar sinalizações e alagamentos.
        </p>

        {hasGoogle && (
          <div className="login-google">
            <GoogleLogin
              onSuccess={async (resp) => {
                if (resp.credential) {
                  try {
                    await loginWithGoogle(resp.credential);
                    onSuccess?.();
                  } catch {
                    setError('Falha no login com Google');
                  }
                }
              }}
              onError={() => setError('Falha no login com Google')}
            />
          </div>
        )}

        <form onSubmit={handleDev} className="login-dev">
          <label className="muted">Login de desenvolvimento (e-mail)</label>
          <input
            type="email"
            required
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        <button className="btn-text" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
