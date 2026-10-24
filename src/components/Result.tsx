import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Prediction } from '../lib/predict';
import { RANKS } from '../lib/predict';
import { downloadReport } from '../lib/report';
import { burst } from '../lib/particles';
import { sfx } from '../lib/audio';
import { Gauge } from './Gauge';
import { Pin, Tape } from './Bits';
import { CatDirector } from './CatDirector';

interface Props {
  pred: Prediction;
  onRetake: () => void;
  onShake: () => void;
}

/** 猫导演按段位吐槽（新增文案，不涉及预测算法与素材库） */
const CAT_LINES = [
  '镜头都没扫到你。别慌，群演也有春天。',
  '导演评价：有戏，但藏得深。再来一条！',
  '眼神有戏了，下一条试试用鼻子演。',
  '这条保你过。收工前别再加了啊。',
  '影帝！签约签约，片酬好商量！',
  '祖师爷赏饭吃！全剧组起立——！',
];

export function Result({ pred, onRetake, onShake }: Props) {
  const [staged, setStaged] = useState(1);
  const [saving, setSaving] = useState(false);
  const [shown, setShown] = useState(0);
  const stampRef = useRef<HTMLDivElement>(null);

  const tierIdx = Math.max(0, RANKS.findIndex((r) => r.stamp === pred.rank.stamp));

  /* 指数 count-up：便签落定后 1.1s 缓出，正好在红章落下前结束 */
  useEffect(() => {
    let raf = 0;
    const t0Timer = setTimeout(() => {
      const t0 = performance.now();
      const dur = 1100;
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        setShown(Math.round(pred.index * e));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, 300);
    return () => {
      clearTimeout(t0Timer);
      cancelAnimationFrame(raf);
    };
  }, [pred.index]);

  useEffect(() => {
    const t2 = setTimeout(() => setStaged((s) => Math.max(s, 2)), 1600);
    const t3 = setTimeout(() => {
      setStaged((s) => Math.max(s, 3));
      sfx.ding();
    }, 2250);
    const t4 = setTimeout(() => setStaged((s) => Math.max(s, 4)), 2650);
    return () => [t2, t3, t4].forEach(clearTimeout);
  }, []);

  const save = async () => {
    setSaving(true);
    sfx.pick();
    try {
      await downloadReport(pred);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="result layer">
      <div className="rank-ribbon">本日段位 · {pred.rank.title}</div>

      <div className="result-grid">
        <div className="note static gauge-note" style={{ '--rot': '-1.4deg' } as CSSProperties}>
          <Tape rot={-4} />
          <Gauge index={pred.index} />
          <span className="cap">戏 精 指 数 仪</span>
        </div>

        <div className="note static verdict-note" style={{ '--rot': '1.2deg' } as CSSProperties}>
          <Pin />
          {staged >= 2 && (
            <div
              ref={stampRef}
              className="stamp"
              onAnimationStart={(e) => {
                if (e.animationName !== 'stamp-in') return;
                sfx.stamp();
                onShake();
                const r = stampRef.current?.getBoundingClientRect();
                if (r) burst(r.left + r.width / 2, r.top + r.height / 2, { count: 34, speed: [140, 420] });
              }}
            >
              {pred.rank.stamp}
            </div>
          )}
          <div className="big">
            {shown}
            <small>%</small>
          </div>
          <div className="unit-line">今日戏精指数</div>
          <p className="verdict">{pred.rank.verdict}</p>
          <div className="unit-line" style={{ fontSize: 13 }}>
            依据 {pred.selectedCount} 条素材推算 · 误差 ± 一场大戏
          </div>
        </div>
      </div>

      {staged >= 3 && (
        <div className="cat-line-row">
          <CatDirector pose="cheer" />
          <div className="note static cat-bubble" style={{ '--rot': '-1deg' } as CSSProperties}>
            <Tape rot={3} />
            {CAT_LINES[tierIdx]}
          </div>
        </div>
      )}

      {staged >= 3 && (
        <div className="note static prophecy-note" style={{ '--rot': '-0.8deg' } as CSSProperties}>
          <Tape rot={-2} />
          <span className="label">今 日 剧 透</span>
          <p className="text">{pred.prophecy}</p>
        </div>
      )}

      {staged >= 4 && (
        <div className="action-row">
          <button type="button" className="note action-note" style={{ '--rot': '-1.5deg', '--paper-color': 'var(--lemon)', '--w': 'auto' } as CSSProperties} onClick={onRetake}>
            再测一次 ↺
          </button>
          <button type="button" className="note action-note secondary" style={{ '--rot': '1.5deg', '--w': 'auto' } as CSSProperties} onClick={save} disabled={saving}>
            {saving ? '战报生成中…' : '保存战报卡 ↓'}
          </button>
        </div>
      )}
    </div>
  );
}
