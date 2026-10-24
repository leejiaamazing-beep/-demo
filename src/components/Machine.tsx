import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { sfx } from '../lib/audio';
import { burst } from '../lib/particles';
import { Tape } from './Bits';
import { CatDirector } from './CatDirector';

export interface MachineItem {
  text: string;
  weight: number;
}

const TICKER = [
  '正在检测内心戏密度…',
  '发现大量浮夸成分…',
  '台词储备超出片长…',
  '警告：戏份严重超标…',
];

/** 运算页：总时长封顶 ~2.8s（步进间隔随条数自适应），高权重素材点亮有金色闪帧 */
export function Machine({ items, onDone }: { items: MachineItem[]; onDone: () => void }) {
  const [lit, setLit] = useState(0);
  const total = items.length;
  const screenRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const interval = Math.min(300, Math.max(70, 1200 / Math.max(total, 1)));
    let step = 0;
    const iv = setInterval(() => {
      step += 1;
      setLit(step);
      sfx.scan(step);
      if (step >= total) {
        clearInterval(iv);
        setTimeout(() => {
          sfx.ding();
          const r = screenRef.current?.getBoundingClientRect();
          if (r) burst(r.left + r.width / 2, r.top + r.height / 2, { count: 26, speed: [90, 300] });
        }, 380);
        setTimeout(() => doneRef.current(), 1000);
      }
    }, interval);
    return () => clearInterval(iv);
  }, [total]);

  const pct = total ? Math.round((lit / total) * 100) : 0;
  const done = lit >= total;
  const ticker = done ? '解析完成，导演出戏了 ——' : TICKER[Math.min(TICKER.length - 1, Math.floor((lit / Math.max(total, 1)) * TICKER.length))];

  return (
    <div className="machine-scene layer">
      <div className="note static machine" style={{ '--rot': '-1deg' } as CSSProperties}>
        <CatDirector pose="perch" />
        <Tape rot={-3} />
        <div className="machine-head">
          <h2>预测主机 · MARK I</h2>
          <span className="en">{done ? 'ANALYSIS DONE' : 'ANALYZING...'}</span>
        </div>
        <div className="machine-screen" ref={screenRef}>
          {!done && <div className="scanline" />}
          <div className="chip-row">
            {items.map((it, i) => (
              <span
                key={`${i}-${it.text}`}
                className={`chip ${i < lit ? 'lit' : ''} ${i === lit - 1 && it.weight >= 9 ? 'hot' : ''}`}
              >
                {it.text}
              </span>
            ))}
          </div>
        </div>
        <div className="progress-row">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="tally">
            已录入 <span className="num">{lit}</span> / <span className="num">{total}</span> 条
          </p>
          <p className="machine-ticker">{ticker}</p>
        </div>
      </div>
    </div>
  );
}
