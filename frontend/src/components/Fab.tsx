import { useState } from 'react';

interface Props {
  onFlood: () => void;
  onSignal: () => void;
}

export default function Fab({ onFlood, onSignal }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fab-wrap">
      {open && (
        <>
          <button
            className="fab-action"
            onClick={() => {
              setOpen(false);
              onFlood();
            }}
          >
            🌊 Alagamento
          </button>
          <button
            className="fab-action"
            onClick={() => {
              setOpen(false);
              onSignal();
            }}
          >
            📍 Sinalização
          </button>
        </>
      )}
      <button
        className={`fab-main ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Adicionar"
      >
        +
      </button>
    </div>
  );
}
