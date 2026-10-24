/** Canvas2D 纸屑粒子引擎：贴纸爆开 / 盖章迸溅 / 结果纸屑雨 */

interface Scrap {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
  maxLife: number;
  g: number;
  flutter: number;
  phase: number;
}

const PALETTE = ['#FFE066', '#FFB3A7', '#A3D5FF', '#A8E6CF', '#D5C6E0', '#FFFFFF', '#E4572E'];

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let scraps: Scrap[] = [];
let raf = 0;
let last = 0;
let dpr = 1;
let rainUntil = 0;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}

function loop(t: number) {
  const c = ctx;
  if (!c) return;
  const dt = Math.min((t - last) / 1000, 0.05);
  last = t;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // 纸屑雨补给
  if (t < rainUntil) {
    for (let i = 0; i < 2; i++) {
      scraps.push(makeScrap(rand(0, window.innerWidth), -20, {
        vx: rand(-40, 40),
        vy: rand(120, 260),
        g: 160,
        maxLife: rand(2.2, 3.4),
      }));
    }
  }

  scraps = scraps.filter((s) => {
    s.life += dt;
    if (s.life >= s.maxLife) return false;
    s.vy += s.g * dt;
    s.x += s.vx * dt + Math.sin(s.life * s.flutter + s.phase) * 34 * dt;
    s.y += s.vy * dt;
    s.rot += s.vr * dt;
    const remain = s.maxLife - s.life;
    c.save();
    c.translate(s.x, s.y);
    c.rotate(s.rot);
    c.globalAlpha = remain < 0.5 ? remain / 0.5 : 1;
    c.fillStyle = s.color;
    c.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
    c.restore();
    return true;
  });

  if (scraps.length || t < rainUntil) {
    raf = requestAnimationFrame(loop);
  } else {
    raf = 0;
  }
}

function ensureLoop() {
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
}

function makeScrap(x: number, y: number, o: Partial<Scrap>): Scrap {
  const w = rand(5, 11);
  return {
    x,
    y,
    vx: o.vx ?? 0,
    vy: o.vy ?? 0,
    rot: rand(0, Math.PI * 2),
    vr: rand(-9, 9),
    w,
    h: w * rand(0.55, 0.8),
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    life: 0,
    maxLife: o.maxLife ?? rand(0.9, 1.9),
    g: o.g ?? 460,
    flutter: rand(2, 5),
    phase: rand(0, Math.PI * 2),
  };
}

export function initFx(c: HTMLCanvasElement) {
  canvas = c;
  ctx = c.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

/** 原点爆开：speed [min,max] px/s，angleSpread 弧度 */
export function burst(
  x: number,
  y: number,
  { count = 26, speed = [90, 340], spread = Math.PI * 1.35, upBias = 70 }: { count?: number; speed?: [number, number]; spread?: number; upBias?: number } = {},
) {
  if (!ctx) return;
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const v = rand(speed[0], speed[1]);
    scraps.push(makeScrap(x, y, {
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - upBias,
    }));
  }
  ensureLoop();
}

/** 全屏纸屑雨，持续 ms 毫秒 */
export function rain(ms: number) {
  rainUntil = performance.now() + ms;
  ensureLoop();
}
