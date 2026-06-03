import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { EmergencyContact } from '../api/types';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<EmergencyContact[]>('/emergency-contacts')
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <Link to="/" className="back-link">←</Link>
        <h1>Contatos de emergência</h1>
      </header>

      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        contacts.map((c) => (
          <a
            key={c.phone}
            className="contact-card"
            href={`tel:${c.phone.replace(/\s/g, '')}`}
          >
            <div>
              <strong>{c.name}</strong>
              <p className="muted">{c.description}</p>
            </div>
            <span className="phone">{c.phone}</span>
          </a>
        ))
      )}
    </div>
  );
}
