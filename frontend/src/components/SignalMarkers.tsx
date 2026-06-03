import { Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Signal } from '../api/types';

interface Props {
  signals: Signal[];
  onSelect: (signal: Signal) => void;
}

function emojiIcon(emoji: string): L.DivIcon {
  return L.divIcon({
    html: `<div class="emoji-marker">${emoji}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export default function SignalMarkers({ signals, onSelect }: Props) {
  return (
    <>
      {signals.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={emojiIcon(s.emoji)}
          eventHandlers={{ click: () => onSelect(s) }}
        />
      ))}
    </>
  );
}
