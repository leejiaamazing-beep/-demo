/** 预测核心：本地词典计分，不依赖任何外部 API */

export interface SelectedNote {
  id: string;
  text: string;
  weight: number;
  custom?: boolean;
}

export interface Rank {
  min: number;
  stamp: string; // 印章上的字
  title: string; // 段位名
  verdict: string; // 一句话点评
}

export const RANKS: Rank[] = [
  { min: 0, stamp: '路人甲', title: '路人甲', verdict: '静如止水，但你的沉默本身就是一种表演。' },
  { min: 20, stamp: '特约群演', title: '特约群演', verdict: '有戏，但收着。导演看了直点头。' },
  { min: 40, stamp: '黄金配角', title: '黄金配角', verdict: '张弛有度，眼神里已经开始念台词了。' },
  { min: 60, stamp: '当红主演', title: '当红主演', verdict: '收放自如，连叹气都自带运镜。' },
  { min: 80, stamp: '在逃影帝', title: '在逃影帝', verdict: '影帝级发作预警！建议直接颁奖。' },
  { min: 95, stamp: '戏祖转世', title: '戏祖转世', verdict: '本预测器已无法评估，建议申报非遗。' },
];

/** 手写便签关键词词典 */
const STRONG = ['戏', '演', '影帝', '影后', '主角', '女主', '男主', 'os', '内心', '脑补', '脑内', 'emo', '哭', '大戏', '连续剧', '颁奖', '台词', '装作', '假装', '表演', '加戏', '运镜', 'mv', 'MV'];
const MEDIUM = ['朋友圈', '深夜', '镜子', '辩论', '小作文', '烟花', '淡定', '叹息', '解析', '配音', '独白', '情绪', '导演', '剧本', '开场', '收工'];
const WEAK = ['今天', '突然', '又', '好想', '感觉', '有点', '一点', '真的', '疯狂', '疯狂输出'];

function customScore(text: string): number {
  const t = text.toLowerCase();
  let s = 4; // 敢手写，本身就有点戏
  for (const k of STRONG) if (t.includes(k.toLowerCase())) s += 8;
  for (const k of MEDIUM) if (t.includes(k)) s += 5;
  for (const k of WEAK) if (t.includes(k)) s += 2;
  s += Math.min(Math.floor(text.length / 4), 4); // 写越长戏越足
  return s;
}

export interface Prediction {
  index: number; // 0-100
  rank: Rank;
  prophecy: string;
  selectedCount: number;
}

const PLACES = ['朋友圈', '工位', '微信群', '深夜被窝', '电梯里', '会议第 37 分钟', '奶茶店', '出租车上'];

const PROPHECIES: string[][] = [
  [
    '{time} · 你将在{place}目睹别人加戏，并在内心默默点评了 11 句。',
    '今日戏份不足 · 剧组通知：明天请自带眼泪进组。',
    '放心 · 你只是把戏攒着，周末一次性上映。',
  ],
  [
    '{time} · 你将在{place}欲言又止三次，最终只发出一个「哦」。',
    '明天 · 你的一个白眼，将被同事解读出 8 种含义。',
    '{time} · 你将在{place}排练一句吐槽，删改五稿后放弃发送。',
  ],
  [
    '{time} · 你将在{place}上演「假装不经意」，实际排练了两遍。',
    '明天 · 一句「随便」将从你口中说出，语气里藏着一部电视剧。',
    '{time} · 你将在{place}与空调遥控器展开一段对手戏。',
  ],
  [
    '{time} · 你将在{place}上演深夜文学，九宫格配图将裁剪 40 分钟。',
    '明天早会 · 领导一句「顺便说下」，你将即兴发挥 12 分钟。',
    '{time} · 你将在{place}收到一个「哈哈」，并解析出 14 层情绪。',
  ],
  [
    '{time} · 你将在{place}开启 MV 式运镜，路灯都是你的追光。',
    '今晚 · 你将与假想敌完成第二轮浴室辩论，并再次全胜。',
    '{time} · 你将在{place}深情朗读自己刚写的文案，第三遍时落泪。',
  ],
  [
    '天选之子 · 你已不需要预测，你的人生每一帧都是预告片。',
    '警告 · 你的戏太多，预测器算力不足，只显示到这里。',
    '{time} · 全世界将在{place}为你加戏——虽然你只是路过。',
  ],
];

function makeProphecy(rankIdx: number): string {
  const bank = PROPHECIES[rankIdx];
  const tpl = bank[Math.floor(Math.random() * bank.length)];
  const h = 20 + Math.floor(Math.random() * 4);
  const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const time = `今晚 ${h}:${m}`;
  const place = PLACES[Math.floor(Math.random() * PLACES.length)];
  return tpl.split('{time}').join(time).split('{place}').join(place);
}

export function predict(selected: SelectedNote[]): Prediction {
  const presetSum = selected.filter((s) => !s.custom).reduce((a, s) => a + s.weight, 0);
  const customSum = selected.filter((s) => s.custom).reduce((a, s) => a + customScore(s.text), 0);
  const jitter = Math.random() * 8 - 4;
  const raw = 8 + presetSum * 1.35 + customSum * 1.1 + jitter;
  const index = Math.max(6, Math.min(99, Math.round(raw)));
  let rank = RANKS[0];
  let ri = 0;
  RANKS.forEach((r, i) => {
    if (index >= r.min) {
      rank = r;
      ri = i;
    }
  });
  return { index, rank, prophecy: makeProphecy(ri), selectedCount: selected.length };
}
