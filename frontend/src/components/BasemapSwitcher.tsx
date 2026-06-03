import { BASEMAPS } from '../lib/basemaps';

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function BasemapSwitcher({ value, onChange }: Props) {
  return (
    <div className="basemap-switcher map-panel">
      <div className="map-panel-title">Estilo do mapa</div>
      <div className="style-group">
        {BASEMAPS.map((b) => (
          <button
            key={b.id}
            type="button"
            className={value === b.id ? 'active' : ''}
            onClick={() => onChange(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
