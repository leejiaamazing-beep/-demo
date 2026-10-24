import type { CSSProperties } from 'react';

/** 手绘风指针仪表盘：SVG 半圆 + 弹性摆动指针 */
export function Gauge({ index }: { index: number }) {
  const CX = 160;
  const CY = 168;
  const R = 134;

  const pt = (pct: number, r: number) => {
    const deg = 180 - pct * 1.8; // 0% → 180°（左），100% → 0°（右）
    const rad = (deg * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
  };

  const arc = (from: number, to: number, r: number) => {
    const a = pt(from, r);
    const b = pt(to, r);
    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  };

  const target = -90 + index * 1.8;

  const zones: Array<[number, number, string]> = [
    [0, 40, '#A8E6CF'],
    [40, 70, '#FFE066'],
    [70, 90, '#FFB3A7'],
    [90, 100, '#E4572E'],
  ];

  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const pct = i * 10;
    const major = pct % 50 === 0;
    const a = pt(pct, major ? 118 : 123);
    const b = pt(pct, 131);
    ticks.push(
      <line
        key={pct}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="#2E2A26"
        strokeWidth={major ? 3 : 1.6}
        strokeLinecap="round"
        opacity={major ? 0.9 : 0.5}
      />,
    );
  }

  return (
    <div>
      <svg className="gauge" viewBox="0 0 320 212" role="img" aria-label={`戏精指数 ${index}`}>
        {/* 外圈主弧 */}
        <path d={arc(0, 100, R)} fill="none" stroke="#2E2A26" strokeWidth="3" strokeLinecap="round" />
        {/* 刻度 */}
        {ticks}
        {/* 彩区 */}
        {zones.map(([f, t, c]) => (
          <path key={c} d={arc(f, t, 108)} fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" opacity="0.9" />
        ))}
        {/* 读数 */}
        <text x={14} y={190} fontFamily="Caveat" fontSize="16" fill="#8A8580">0</text>
        <text x={160} y={28} textAnchor="middle" fontFamily="Caveat" fontSize="16" fill="#8A8580">50</text>
        <text x={306} y={190} textAnchor="end" fontFamily="Caveat" fontSize="16" fill="#8A8580">100</text>
        <text x={16} y={208} fontFamily="'Ma Shan Zheng'" fontSize="15" fill="#8A8580">收敛</text>
        <text x={304} y={208} textAnchor="end" fontFamily="'Ma Shan Zheng'" fontSize="15" fill="#E4572E">放飞</text>
        {/* 指针 */}
        <g className="needle-g" style={{ '--target': `${target.toFixed(1)}deg` } as CSSProperties}>
          <polygon points={`${CX - 6},${CY} ${CX + 6},${CY} ${CX},70`} fill="#E4572E" />
          <circle cx={CX} cy={CY} r="11" fill="#2E2A26" />
          <circle cx={CX} cy={CY} r="4" fill="#F6F1E5" />
        </g>
      </svg>
      <div className="gauge-read" style={{ textAlign: 'center', marginTop: 4 }}>
        {index}
        <small>%</small>
      </div>
    </div>
  );
}
