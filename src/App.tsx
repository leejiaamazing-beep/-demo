import { useEffect, useRef, useState } from 'react';
import { PRESET_NOTES } from './data/notes';
import type { SelectedNote, Prediction } from './lib/predict';
import { predict } from './lib/predict';
import { initFx } from './lib/particles';
import { setBgm, sfx } from './lib/audio';
import { Decor } from './components/Decor';
import { Intro } from './components/Intro';
import { Picker } from './components/Picker';
import { Machine } from './components/Machine';
import type { MachineItem } from './components/Machine';
import { Result } from './components/Result';
import { SoundToggle } from './components/SoundToggle';

type Phase = 'intro' | 'pick' | 'compute' | 'result';

interface Item extends SelectedNote {}

export default function App() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customs, setCustoms] = useState<Item[]>([]);
  const [snapshot, setSnapshot] = useState<SelectedNote[]>([]);
  const [pending, setPending] = useState<MachineItem[]>([]);
  const [pred, setPred] = useState<Prediction | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) initFx(canvasRef.current);
  }, []);

  /* 鼠标视差（rAF 节流） */
  useEffect(() => {
    let raf = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      raf = 0;
      const w = wallRef.current;
      if (w) {
        w.style.setProperty('--mx', mx.toFixed(3));
        w.style.setProperty('--my', my.toFixed(3));
      }
    };
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const allItems: Item[] = [...PRESET_NOTES.map((n) => ({ ...n })), ...customs];
  const selectedNotes: SelectedNote[] = allItems.filter((i) => selectedIds.has(i.id));

  const toggle = (item: Item) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        sfx.unpick();
      } else {
        next.add(item.id);
        sfx.pick();
      }
      return next;
    });
  };

  const addCustom = (text: string) => {
    const item: Item = { id: `c${Date.now()}`, text, weight: 0, custom: true };
    setCustoms((c) => [...c, item]);
    setSelectedIds((prev) => new Set(prev).add(item.id));
  };

  const addMany = (items: Item[]) => {
    setCustoms((c) => c);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      items.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const goCompute = () => {
    setSnapshot(selectedNotes);
    setPending(selectedNotes.map((s) => ({ text: s.text, weight: s.weight })));
    setPhase('compute');
  };

  const finishCompute = () => {
    setPred(predict(snapshot));
    setPhase('result');
  };

  const retake = () => {
    sfx.whoosh();
    setSelectedIds(new Set());
    setCustoms([]);
    setPred(null);
    setPhase('pick');
  };

  const shake = () => {
    const w = wallRef.current;
    if (!w) return;
    w.classList.remove('shake');
    void w.offsetWidth; // 重置动画
    w.classList.add('shake');
    setTimeout(() => w.classList.remove('shake'), 480);
  };

  return (
    <div className="wall" ref={wallRef}>
      <Decor />

      {phase === 'intro' && <Intro onStart={() => {
        setBgm(true);
        setPhase('pick');
      }} />}

      {phase === 'pick' && (
        <Picker
          selectedIds={selectedIds}
          customs={customs}
          onToggle={toggle}
          onAddCustom={addCustom}
          onAddMany={addMany}
          onGo={goCompute}
        />
      )}

      {phase === 'compute' && <Machine items={pending} onDone={finishCompute} />}

      {phase === 'result' && pred && <Result pred={pred} onRetake={retake} onShake={shake} />}

      <SoundToggle on={soundOn} onToggle={() => setSoundOn((s) => !s)} />

      <canvas ref={canvasRef} className="fx-canvas" />
    </div>
  );
}
