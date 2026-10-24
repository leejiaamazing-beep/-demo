/** 今日戏精素材库 —— 每条都有权重（越戏精权重越高） */
export interface BehaviorNote {
  id: string;
  text: string;
  weight: number;
}

export const PRESET_NOTES: BehaviorNote[] = [
  { id: 'p01', text: '闹钟响了 8 遍才起，起床气自带 BGM', weight: 3 },
  { id: 'p02', text: '出门前对着镜子加戏 3 分钟', weight: 6 },
  { id: 'p03', text: '开会时内心 os 比领导发言还长', weight: 9 },
  { id: 'p04', text: '把一句「在吗」读出了三种语气', weight: 7 },
  { id: 'p05', text: '朋友圈文案改了 8 遍才敢发', weight: 8 },
  { id: 'p06', text: '走路戴上耳机，自动切入 MV 运镜', weight: 9 },
  { id: 'p07', text: '被点名时顺口接了一句台词', weight: 10 },
  { id: 'p08', text: '深夜 emo，但只 emo 了十分钟', weight: 6 },
  { id: 'p09', text: '给自己导了一场「如果当时」的戏', weight: 7 },
  { id: 'p10', text: '收到「哈哈」，解析出 14 种情绪', weight: 8 },
  { id: 'p11', text: '洗澡时和假想对手辩论，全胜', weight: 10 },
  { id: 'p12', text: '对人说「辛苦啦」，尾音带了一声叹息', weight: 4 },
  { id: 'p13', text: '电梯里默背明天的开场白', weight: 5 },
  { id: 'p14', text: '把日常小事脑补成悬疑片', weight: 7 },
  { id: 'p15', text: '微信步数 300，戏份拉满', weight: 5 },
  { id: 'p16', text: '假装淡定，心里已经放了烟花', weight: 8 },
  { id: 'p17', text: '跟客服对线前，先深呼吸入戏', weight: 6 },
  { id: 'p18', text: '一句「多喝热水」，脑补出八十集连续剧', weight: 9 },
  { id: 'p19', text: '深夜给三年前的自己写小作文', weight: 8 },
  { id: 'p20', text: '今天全程无戏，但在酝酿明天的大戏', weight: 9 },
  { id: 'p21', text: '照镜子时给自己颁了个奖', weight: 7 },
  { id: 'p22', text: '打「嗯」之前，删了又写写了又删', weight: 6 },
];

/** 便签纸色板（按序循环取色） */
export const NOTE_COLORS = ['#FFE066', '#FFB3A7', '#A3D5FF', '#A8E6CF', '#D5C6E0'];

export const colorFor = (i: number) => NOTE_COLORS[i % NOTE_COLORS.length];

/** 随机但稳定的微旋转（同一条目每次渲染角度一致） */
export const tiltFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return ((h % 60) / 10 - 3).toFixed(1) + 'deg';
};
