import { sfx, setMaster } from '../lib/audio';

interface Props {
  on: boolean;
  onToggle: () => void;
}

export function SoundToggle({ on, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`note sound-toggle ${on ? '' : 'off'}`}
      style={{ '--rot': '2deg', '--w': 'auto' } as React.CSSProperties}
      onClick={() => {
        setMaster(!on);
        if (!on) sfx.pick();
        onToggle();
      }}
      aria-label={on ? '关闭音效' : '开启音效'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 9 L8 9 L13 5 L13 19 L8 15 L4 15 Z"
          fill="currentColor"
          stroke="none"
        />
        <path className="wave" d="M16 9 C 18 11, 18 13, 16 15" />
        <path className="wave" d="M18.5 6.5 C 22 9.5, 22 14.5, 18.5 17.5" />
      </svg>
      {on ? '音效开' : '音效关'}
    </button>
  );
}
