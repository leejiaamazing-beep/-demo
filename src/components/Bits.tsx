/** 小部件：图钉 / 胶带 / 勾选涂鸦 / 手绘分割线 */
import type { CSSProperties } from 'react';

export function Pin() {
  return <span className="pin" aria-hidden="true" />;
}

export function Tape({ corner = false, rot = -3 }: { corner?: boolean; rot?: number }) {
  const style = { '--tape-rot': `${rot}deg` } as CSSProperties;
  return <span className={corner ? 'tape corner' : 'tape'} style={style} aria-hidden="true" />;
}

export function CheckDoodle() {
  return (
    <svg className="check-doodle" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M4 15 L11 22 L24 6" />
    </svg>
  );
}

export function Squiggle({ width = 180 }: { width?: number }) {
  return (
    <svg className="divider" width={width} height="14" viewBox="0 0 180 14" aria-hidden="true">
      <path
        d="M4 8 C 18 2, 30 12, 44 7 S 70 2, 84 8 S 112 13, 126 7 S 156 2, 176 8"
        fill="none"
        stroke="#8A8580"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}
