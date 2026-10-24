import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { PRESET_NOTES, colorFor, tiltFor } from '../data/notes';
import type { SelectedNote } from '../lib/predict';
import { sfx } from '../lib/audio';
import { burst } from '../lib/particles';
import { Pin, Tape, CheckDoodle } from './Bits';

interface Item {
  id: string;
  text: string;
  weight: number;
  custom?: boolean;
}

interface Props {
  selectedIds: Set<string>;
  customs: Item[];
  onToggle: (item: Item) => void;
  onAddCustom: (text: string) => void;
  onAddMany: (items: Item[]) => void;
  onGo: () => void;
}

/** 分区映射（素材文案仍在 notes.ts，不动） */
const GROUPS: Array<{ title: string; color: string; ids: string[] }> = [
  { title: '通勤路上', color: '#7cc9a8', ids: ['p01', 'p02', 'p06', 'p13', 'p15'] },
  { title: '工位生存', color: '#7db8dd', ids: ['p03', 'p04', 'p12', 'p17', 'p22'] },
  { title: '社交名场面', color: '#e0877a', ids: ['p05', 'p07', 'p10', 'p14', 'p18', 'p21'] },
  { title: '深夜 emo', color: '#c9a227', ids: ['p08', 'p09', 'p11', 'p16', 'p19', 'p20'] },
];

function NoteCard({
  item,
  color,
  index,
  checked,
  onToggle,
}: {
  item: Item;
  color: string;
  index: number;
  checked: boolean;
  onToggle: (item: Item) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      className={`note ${checked ? 'checked' : ''}`}
      style={
        {
          '--rot': tiltFor(item.id),
          '--paper-color': color,
          '--delay': `${index * 42}ms`,
        } as CSSProperties
      }
      aria-pressed={checked}
      onClick={(e) => {
        if (!checked) {
          const r = ref.current!.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + 10, { count: 10, speed: [60, 200], upBias: 90 });
        }
        onToggle(item);
      }}
    >
      {index % 3 === 1 ? <Tape rot={index % 2 ? -4 : 3} /> : <Pin />}
      {item.text}
      <CheckDoodle />
    </button>
  );
}

function CustomBlank({ count, onSubmit }: { count: number; onSubmit: (t: string) => void }) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  if (count >= 3) return null;

  if (!editing) {
    return (
      <button
        type="button"
        className="note custom-note"
        style={{ '--rot': '-1.8deg' } as CSSProperties}
        onClick={() => {
          setEditing(true);
          requestAnimationFrame(() => taRef.current?.focus());
        }}
      >
        <span className="plus">+</span>
        <span className="plus-label">手写一张加戏便签</span>
      </button>
    );
  }

  return (
    <div
      className="note custom-note checked"
      style={{ '--rot': '-1.8deg' } as CSSProperties}
      onClick={() => taRef.current?.focus()}
    >
      <Tape rot={2} />
      <textarea
        ref={taRef}
        rows={2}
        maxLength={26}
        placeholder="今天最戏精的一件事…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const t = draft.trim();
            if (t) {
              onSubmit(t);
              setDraft('');
              setEditing(false);
              sfx.pick();
            }
          }
          if (e.key === 'Escape') {
            setDraft('');
            setEditing(false);
          }
        }}
        onBlur={() => {
          if (!draft.trim()) setEditing(false);
        }}
      />
      <span className="plus-label">Enter 贴上墙 · Esc 收回</span>
    </div>
  );
}

export function Picker({ selectedIds, customs, onToggle, onAddCustom, onAddMany, onGo }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [deny, setDeny] = useState(false);
  const count = selectedIds.size;

  const allPresets = PRESET_NOTES.map((n) => ({ ...n }));
  const unselected = allPresets.filter((n) => !selectedIds.has(n.id));

  const drawFive = () => {
    const pool = [...unselected];
    if (pool.length === 0) return;
    const picks: Item[] = [];
    for (let i = 0; i < 5 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    picks.forEach((p, i) => setTimeout(() => {
      onAddMany([p]);
      sfx.pick();
    }, i * 110));
  };

  const go = () => {
    if (count === 0) {
      setDeny(true);
      sfx.unpick();
      setTimeout(() => setDeny(false), 450);
      return;
    }
    sfx.whoosh();
    onGo();
  };

  const gi = PRESET_NOTES.length;
  let running = 0;

  return (
    <div className="picker layer">
      <header className="picker-head">
        <div className="note static logo-note" style={{ '--rot': '-2deg', '--paper-color': 'var(--lemon)' } as CSSProperties}>
          <Tape corner rot={-42} />
          戏精预测器
          <span className="en">DRAMA PREDICTOR</span>
        </div>
        <div className="note static rule-note" style={{ '--rot': '1.2deg', '--paper-color': 'var(--paper)' } as CSSProperties}>
          <Pin />
          勾选今天中招的素材 · 也可以手写加戏，或让导演帮抽
        </div>
      </header>

      {GROUPS.map((g, gi2) => {
        const items = g.ids
          .map((id) => PRESET_NOTES.find((n) => n.id === id))
          .filter((n): n is (typeof PRESET_NOTES)[number] => !!n);
        const picked = items.filter((n) => selectedIds.has(n.id)).length;
        const start = running;
        running += items.length;
        return (
          <section key={g.title}>
            <div className="group-label">
              <span className="note static group-tag" style={{ '--rot': '-1.5deg', '--paper-color': g.color } as CSSProperties}>
                <Pin />
                {g.title}
              </span>
              <span className="group-line" />
              <span className="group-count">
                已选 <b className="num">{picked}</b>/{items.length}
              </span>
            </div>
            <div className="note-grid">
              {items.map((n, i) => (
                <NoteCard
                  key={n.id}
                  item={n}
                  color={colorFor(start + i)}
                  index={gi2 * 7 + i}
                  checked={selectedIds.has(n.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </section>
        );
      })}

      <section>
        <div className="group-label">
          <span className="note static group-tag" style={{ '--rot': '1deg', '--paper-color': 'var(--lilac)' } as CSSProperties}>
            <Pin />
            导演加戏区
          </span>
          <span className="group-line" />
          <span className="group-count">
            手写 ≤ 3 张
          </span>
        </div>
        <div className="note-grid">
          {customs.map((c, i) => (
            <NoteCard
              key={c.id}
              item={c}
              color={colorFor(gi + i)}
              index={gi + i}
              checked={selectedIds.has(c.id)}
              onToggle={onToggle}
            />
          ))}
          <CustomBlank count={customs.length} onSubmit={onAddCustom} />
        </div>
      </section>

      <div ref={barRef} className={`cta-bar ${deny ? 'deny' : ''}`}>
        <span className="count">
          已选 <b>{count}</b><span className="suffix"> 条素材</span>
        </span>
        <button type="button" className="dice" onClick={drawFive} disabled={unselected.length === 0}>
          帮抽 5 张
        </button>
        <button type="button" className="go" disabled={count === 0} onClick={go}>
          送进预测机
        </button>
      </div>
    </div>
  );
}
