import type { Signal } from '../api/types';
import { relativeTime } from '../lib/relativeTime';

interface Props {
  signal: Signal | null;
  onClose: () => void;
}

export default function SignalPanel({ signal, onClose }: Props) {
  return (
    <>
      {signal && <div className="panel-backdrop" onClick={onClose} />}
      <aside className={`signal-panel ${signal ? 'open' : ''}`}>
        {signal && (
          <>
            <button className="panel-close" onClick={onClose} aria-label="Fechar">
              ×
            </button>
            <div className="emoji-big">{signal.emoji}</div>
            <h2>{signal.title}</h2>
            <p className="muted">criada {relativeTime(signal.createdAt)}</p>
            <p>{signal.description}</p>
            {signal.photos.length > 0 && (
              <div className="photos">
                {signal.photos.map((url) => (
                  <img key={url} src={url} alt={signal.title} />
                ))}
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}
