import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { burst } from '../lib/particles';
import { sfx } from '../lib/audio';
import { Pin, Tape, Squiggle } from './Bits';
import { CatDirector } from './CatDirector';

export function Intro({ onStart }: { onStart: () => void }) {
  const titleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const landBurst = (el: HTMLElement | null, count = 30) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.82, { count, speed: [120, 380] });
  };

  return (
    <div className="intro layer">
      <div className="intro-stack">
        <div className="title-wrap">
          <CatDirector pose="peek" />
          <span className="cat-said">开镜！</span>
          <div
            ref={titleRef}
            className="note static title-note"
            style={{ '--rot': '-1.2deg' } as CSSProperties}
            onAnimationEnd={() => {
              sfx.slam();
              landBurst(titleRef.current, 34);
            }}
          >
            <Tape rot={-4} />
            <h1>戏精预测器</h1>
            <span className="en">DRAMA PREDICTOR v1.0</span>
            <Squiggle width={200} />
            <p className="slogan">一面便签墙，预测你今天的全部内心戏</p>
          </div>
        </div>

        <div className="note static sub-note" style={{ '--rot': '1.6deg', '--paper-color': 'var(--sky)' } as CSSProperties}>
          <Pin />
          贴上今天的素材，猫导演替你算出 —— 到底演到哪一档了
        </div>

        <button
          ref={ctaRef}
          type="button"
          className="note cta-note"
          style={{ '--rot': '-2deg', '--paper-color': 'var(--lemon)', '--w': 'auto' } as CSSProperties}
          onClick={() => {
            sfx.slam();
            landBurst(ctaRef.current, 20);
            onStart();
          }}
        >
          开始今日预测 →
        </button>

        <p className="hint-line">— 点一张便签试试，它们都有戏 —</p>
      </div>
    </div>
  );
}
