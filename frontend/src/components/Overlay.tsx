import type { ReactNode } from 'react';

/** Container que sobrepõe o mapa persistente (telas que não são de criação). */
export default function Overlay({ children }: { children: ReactNode }) {
  return <div className="overlay">{children}</div>;
}
