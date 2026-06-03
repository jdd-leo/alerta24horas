const EMOJIS = [
  '💧', '🚰', '🍞', '🍲', '🧥', '👕',
  '🏠', '🛏️', '💊', '🩹', '🚑', '🛟',
  '🆘', '⚠️', '🔋', '🕯️', '🐕', '👶',
];

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: Props) {
  return (
    <div className="emoji-grid">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          className={value === e ? 'selected' : ''}
          onClick={() => onChange(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
