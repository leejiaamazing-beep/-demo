/** 战报卡：Canvas 绘制 1080×1440 PNG 并下载 */

import type { Prediction } from './predict';

const C = {
  wall: '#F6F1E5',
  ink: '#2E2A26',
  soft: '#6B655B',
  pencil: '#8A8580',
  stamp: '#E4572E',
  lemon: '#FFE066',
  peach: '#FFB3A7',
  sky: '#A3D5FF',
  mint: '#A8E6CF',
  lilac: '#D5C6E0',
  paper: '#FFFDF6',
};

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function note(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  rot: number,
) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.shadowColor = 'rgba(46,42,38,0.22)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = color;
  rr(ctx, -w / 2, -h / 2, w, h, 4);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const ch of text) {
    if (ctx.measureText(cur + ch).width > maxWidth) {
      lines.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function downloadReport(p: Prediction) {
  const W = 1080;
  const H = 1440;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  try {
    await document.fonts.load('400 80px "Ma Shan Zheng"');
    await document.fonts.load('700 220px Caveat');
    await document.fonts.ready;
  } catch {
    /* 字体加载失败则用回退字体 */
  }

  // 墙面底
  ctx.fillStyle = C.wall;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(139,104,54,0.06)';
  for (let i = 0; i < 900; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4);
  }

  // 背景散落小纸条
  const ghosts: Array<[number, number, number, string, number]> = [
    [80, 120, 150, C.sky, -0.1],
    [860, 180, 130, C.mint, 0.12],
    [110, 1180, 140, C.peach, 0.08],
    [880, 1140, 120, C.lemon, -0.14],
  ];
  for (const [x, y, s, c, r] of ghosts) note(ctx, x, y, s, s * 0.72, c, r);

  // 标题便签
  note(ctx, 240, 90, 600, 210, C.paper, -0.02);
  ctx.save();
  ctx.translate(540, 196);
  ctx.rotate(-0.02);
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.font = '400 84px "Ma Shan Zheng", serif';
  ctx.fillText('戏精预测器', 0, 0);
  ctx.fillStyle = C.pencil;
  ctx.font = '500 30px Caveat, cursive';
  ctx.fillText('D R A M A   P R E D I C T O R', 0, 56);
  ctx.restore();

  // 指数大便签
  note(ctx, 190, 380, 700, 430, C.peach, 0.015);
  ctx.save();
  ctx.translate(540, 560);
  ctx.rotate(0.015);
  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink;
  ctx.font = '700 250px Caveat, cursive';
  ctx.fillText(String(p.index), -20, 60);
  ctx.font = '400 56px "ZCOOL KuaiLe", serif';
  ctx.fillStyle = '#7C4A42';
  ctx.fillText('%  今日戏精指数', 175, 40);
  ctx.textAlign = 'left';
  ctx.font = '400 40px "ZCOOL KuaiLe", serif';
  ctx.fillStyle = C.ink;
  ctx.fillText(`「${p.rank.title}」`, 120, 160);
  ctx.font = '400 30px "ZCOOL KuaiLe", serif';
  ctx.fillStyle = '#7C4A42';
  const vLines = wrapText(ctx, p.rank.verdict, 580);
  vLines.forEach((l, i) => ctx.fillText(l, 120, 220 + i * 44));
  ctx.restore();

  // 红章
  ctx.save();
  ctx.translate(780, 430);
  ctx.rotate(0.19);
  ctx.globalAlpha = 0.92;
  ctx.strokeStyle = C.stamp;
  ctx.lineWidth = 8;
  rr(ctx, -170, -60, 340, 120, 14);
  ctx.stroke();
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 3;
  rr(ctx, -180, -70, 360, 140, 16);
  ctx.stroke();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = C.stamp;
  ctx.textAlign = 'center';
  ctx.font = '400 62px "Ma Shan Zheng", serif';
  ctx.fillText(p.rank.stamp, 0, 22);
  ctx.restore();

  // 预言便签
  note(ctx, 200, 900, 680, 320, C.lilac, -0.015);
  ctx.save();
  ctx.translate(540, 960);
  ctx.rotate(-0.015);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7A6A8C';
  ctx.font = '400 30px "ZCOOL KuaiLe", serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('今 日 剧 透', 0, 0);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = C.ink;
  ctx.font = '400 38px "ZCOOL KuaiLe", serif';
  const lines = wrapText(ctx, p.prophecy, 560);
  lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, 0, 74 + i * 58));
  ctx.restore();

  // 胶带点缀
  ctx.save();
  ctx.translate(540, 88);
  ctx.rotate(-0.05);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(-90, -14, 180, 28);
  ctx.restore();
  ctx.save();
  ctx.translate(540, 898);
  ctx.rotate(0.04);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(-80, -13, 160, 26);
  ctx.restore();

  // 页脚
  ctx.fillStyle = C.pencil;
  ctx.textAlign = 'center';
  ctx.font = '500 28px Caveat, cursive';
  ctx.fillText(`selected ${p.selectedCount} notes · Drama Predictor v1.0`, 540, 1330);
  ctx.font = '400 26px "ZCOOL KuaiLe", serif';
  ctx.fillText('戏精的人生，需要预测。', 540, 1378);

  const a = document.createElement('a');
  a.download = `戏精预测器_${p.index}分.png`;
  a.href = cv.toDataURL('image/png');
  a.click();
}
