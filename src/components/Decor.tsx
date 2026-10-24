/** 墙面装饰：精简后的幽灵便签 + 一处咖啡渍 + 两枚涂鸦（带鼠标视差） */
import type { CSSProperties } from 'react';

const GHOSTS: Array<{ t: string; x: string; y: string; r: string; c: string; d: number }> = [
  { t: '嘘 ——', x: '6%', y: '12%', r: '-5deg', c: 'var(--sky)', d: 18 },
  { t: 'NG！再来一条', x: '86%', y: '48%', r: '4deg', c: 'var(--mint)', d: 26 },
  { t: '加戏中 ···', x: '8%', y: '78%', r: '3deg', c: 'var(--peach)', d: 22 },
  { t: '本墙由戏精协会赞助', x: '74%', y: '84%', r: '-3deg', c: 'var(--lemon)', d: 14 },
];

export function Decor() {
  return (
    <div className="decor" aria-hidden="true">
      {GHOSTS.map((g) => (
        <div
          key={g.t}
          className="drift"
          style={{ left: g.x, top: g.y, '--depth': `${g.d}px` } as CSSProperties}
        >
          <div className="note ghost-note" style={{ '--rot': g.r, '--paper-color': g.c } as CSSProperties}>
            {g.t}
          </div>
        </div>
      ))}

      <div className="drift coffee-ring" style={{ left: '72%', top: '34%', '--depth': 10 } as CSSProperties} />

      <svg className="drift scribble" width="64" height="64" viewBox="0 0 24 24" style={{ left: '26%', top: '86%', '--depth': 24 } as CSSProperties}>
        <path
          d="M12 2 L14.6 8.6 L21.6 9.2 L16.2 13.8 L17.9 20.6 L12 17 L6.1 20.6 L7.8 13.8 L2.4 9.2 L9.4 8.6 Z"
          fill="none"
          stroke="#8A8580"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="drift scribble" width="46" height="46" viewBox="0 0 24 24" style={{ left: '90%', top: '14%', '--depth': 12 } as CSSProperties}>
        <path
          d="M4 14 C 4 4, 20 4, 20 12 C 20 18, 10 18, 10 12 C 10 8, 16 8, 16 12"
          fill="none"
          stroke="#8A8580"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
