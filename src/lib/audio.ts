/** WebAudio 引擎：程序化合成音效 + lo-fi 背景循环，零音频素材 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bgmBus: GainNode | null = null;
let bgmTimer: ReturnType<typeof setTimeout> | null = null;
let nextBarTime = 0;
let barIdx = 0;
let masterOn = true;
let noiseBuf: AudioBuffer | null = null;

export function ensureAudio(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = masterOn ? 1 : 0;
    master.connect(ctx.destination);
    bgmBus = ctx.createGain();
    bgmBus.gain.value = 0;
    bgmBus.connect(master);
    // 预生成白噪声 buffer
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, t0: number, dur: number, type: OscillatorType, vol: number, dest?: AudioNode) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(dest ?? master!);
  o.start(t0);
  o.stop(t0 + dur + 0.06);
}

function noise(t0: number, dur: number, filterFreq: number, vol: number, sweepTo?: number) {
  if (!ctx || !noiseBuf) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(filterFreq, t0);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master!);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

export const sfx = {
  /** 便签拍上墙面 */
  slam() {
    const c = ensureAudio();
    if (!c) return;
    const t = c.currentTime;
    noise(t, 0.12, 900, 0.5, 200);
    tone(110, t, 0.14, 'sine', 0.35);
  },
  /** 勾选素材 */
  pick() {
    const c = ensureAudio();
    if (!c) return;
    const t = c.currentTime;
    tone(520 + Math.random() * 90, t, 0.09, 'triangle', 0.16);
    tone(1040, t + 0.03, 0.07, 'triangle', 0.08);
  },
  /** 取消勾选 */
  unpick() {
    const c = ensureAudio();
    if (!c) return;
    tone(300, c.currentTime, 0.08, 'triangle', 0.1);
  },
  /** 主机扫描第 i 条 */
  scan(i: number) {
    const c = ensureAudio();
    if (!c) return;
    const t = c.currentTime;
    tone(360 + i * 34, t, 0.07, 'square', 0.05);
    noise(t, 0.05, 2400, 0.06);
  },
  /** 运算完成 */
  ding() {
    const c = ensureAudio();
    if (!c) return;
    const t = c.currentTime;
    tone(880, t, 0.3, 'sine', 0.16);
    tone(1318, t + 0.09, 0.4, 'sine', 0.12);
  },
  /** 红章砸下 */
  stamp() {
    const c = ensureAudio();
    if (!c) return;
    const t = c.currentTime;
    noise(t, 0.16, 500, 0.65, 120);
    tone(75, t, 0.22, 'sine', 0.5);
    tone(48, t + 0.02, 0.3, 'sine', 0.3);
  },
  /** 快速划过 */
  whoosh() {
    const c = ensureAudio();
    if (!c) return;
    noise(c.currentTime, 0.25, 600, 0.2, 3200);
  },
};

/* ---------------- lo-fi BGM：Cmaj7 / Am7 / Fmaj7 / G7 琶音 ---------------- */

const CHORDS = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 293.66, 349.23],
];
const BAR = 2.857; // 84bpm, 4/4

function scheduleBar(t0: number) {
  if (!ctx || !bgmBus) return;
  const ch = CHORDS[barIdx % CHORDS.length];
  tone(ch[0] / 2, t0, 1.1, 'sine', 0.11, bgmBus);
  tone(ch[0] / 2, t0 + BAR / 2, 0.9, 'sine', 0.08, bgmBus);
  for (let i = 0; i < 8; i++) {
    const f = ch[i % ch.length] * (i % 4 === 3 ? 2 : 1);
    const jitter = Math.random() * 0.004;
    tone(f, t0 + (i * BAR) / 8 + jitter, 0.34, 'triangle', 0.052, bgmBus);
  }
  barIdx++;
}

function bgmLoop() {
  if (!ctx || !bgmTimer) return;
  const ahead = 0.6;
  while (nextBarTime < ctx.currentTime + ahead) {
    scheduleBar(nextBarTime);
    nextBarTime += BAR;
  }
  bgmTimer = setTimeout(bgmLoop, 250);
}

export function setBgm(on: boolean) {
  const c = ensureAudio();
  if (!c || !bgmBus) return;
  if (on) {
    bgmBus.gain.cancelScheduledValues(c.currentTime);
    bgmBus.gain.linearRampToValueAtTime(0.85, c.currentTime + 1.2);
    if (!bgmTimer) {
      nextBarTime = c.currentTime + 0.15;
      bgmTimer = setTimeout(bgmLoop, 50);
    }
  } else {
    bgmBus.gain.cancelScheduledValues(c.currentTime);
    bgmBus.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
    if (bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    }
  }
}

export function setMaster(on: boolean) {
  masterOn = on;
  const c = ensureAudio();
  if (!c || !master) return;
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.linearRampToValueAtTime(on ? 1 : 0, c.currentTime + 0.25);
}
