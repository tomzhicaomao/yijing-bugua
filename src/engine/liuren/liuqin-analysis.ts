/**
 * 六亲分析模块
 *
 * 按占事类型定义六亲的权重和语义，
 * 提供结构化的六亲分析结果。
 */

import type { LiurenPan, LiuQin } from './types.js';
import type { ZhanShi } from './bifa.js';
import type { JudgmentSignal } from './framework-types.js';

/** 六亲场景定义 */
export interface LiuQinScene {
  zhanShi: ZhanShi;
  roles: Record<LiuQin, {
    meaning: string;
    weight: number;
    positive: string;
    negative: string;
  }>;
  yongShen: LiuQin;
}

/** 六亲分析结果 */
export interface LiuQinAnalysis {
  yongShen: LiuQin;
  summary: string;
  signals: JudgmentSignal[];
}

/** 六亲场景数据库 */
export const LIU_QIN_SCENES: LiuQinScene[] = [
  {
    zhanShi: '官职',
    yongShen: '官鬼',
    roles: {
      '官鬼': { meaning: '事业/上司', weight: 1.0, positive: '有升迁机会', negative: '事业受阻' },
      '父母': { meaning: '文书/工作', weight: 0.8, positive: '文书顺利', negative: '文书有误' },
      '兄弟': { meaning: '同事/竞争', weight: 0.6, positive: '同事互助', negative: '同事竞争' },
      '子孙': { meaning: '剥官/降职', weight: 0.7, positive: '', negative: '有降职风险' },
      '妻财': { meaning: '薪资/待遇', weight: 0.5, positive: '薪资提升', negative: '待遇下降' },
    },
  },
  {
    zhanShi: '婚姻',
    yongShen: '妻财',
    roles: {
      '官鬼': { meaning: '丈夫/男友', weight: 0.8, positive: '对方有责任心', negative: '对方有压力' },
      '父母': { meaning: '长辈/家庭', weight: 0.6, positive: '家庭支持', negative: '家庭反对' },
      '兄弟': { meaning: '劫财/第三者', weight: 0.7, positive: '', negative: '有第三者介入' },
      '子孙': { meaning: '子女/缘分', weight: 0.5, positive: '有子女缘', negative: '缘分未到' },
      '妻财': { meaning: '妻子/女友', weight: 1.0, positive: '感情顺利', negative: '感情有阻' },
    },
  },
  {
    zhanShi: '疾病',
    yongShen: '官鬼',
    roles: {
      '官鬼': { meaning: '病因/病情', weight: 1.0, positive: '病情可控', negative: '病情严重' },
      '父母': { meaning: '医院/医生', weight: 0.7, positive: '医疗条件好', negative: '就医困难' },
      '兄弟': { meaning: '抵抗力/费用', weight: 0.6, positive: '抵抗力强', negative: '花费大' },
      '子孙': { meaning: '药/治疗', weight: 0.8, positive: '药到病除', negative: '治疗无效' },
      '妻财': { meaning: '身体/精力', weight: 0.5, positive: '精力充沛', negative: '身体虚弱' },
    },
  },
  {
    zhanShi: '求财',
    yongShen: '妻财',
    roles: {
      '官鬼': { meaning: '风险/官灾', weight: 0.6, positive: '', negative: '有风险' },
      '父母': { meaning: '合同/手续', weight: 0.5, positive: '手续顺利', negative: '合同有误' },
      '兄弟': { meaning: '劫财/竞争', weight: 0.9, positive: '', negative: '被人劫财' },
      '子孙': { meaning: '财源/投资', weight: 0.8, positive: '财源广进', negative: '投资失败' },
      '妻财': { meaning: '财运/收入', weight: 1.0, positive: '财运亨通', negative: '破财' },
    },
  },
  {
    zhanShi: '出行',
    yongShen: '子孙',
    roles: {
      '官鬼': { meaning: '阻碍/危险', weight: 0.8, positive: '', negative: '旅途有险' },
      '父母': { meaning: '行李/手续', weight: 0.5, positive: '手续齐全', negative: '行李有误' },
      '兄弟': { meaning: '同伴/花费', weight: 0.6, positive: '有人同行', negative: '花费大' },
      '子孙': { meaning: '平安/顺利', weight: 1.0, positive: '旅途平安', negative: '旅途不顺' },
      '妻财': { meaning: '收获/目的', weight: 0.7, positive: '有所收获', negative: '目的难达' },
    },
  },
  {
    zhanShi: '诉讼',
    yongShen: '官鬼',
    roles: {
      '官鬼': { meaning: '判决/结果', weight: 1.0, positive: '胜诉', negative: '败诉' },
      '父母': { meaning: '文书/证据', weight: 0.8, positive: '证据充分', negative: '证据不足' },
      '兄弟': { meaning: '对手/竞争', weight: 0.7, positive: '', negative: '对方强势' },
      '子孙': { meaning: '调解/和解', weight: 0.6, positive: '可以和解', negative: '难以和解' },
      '妻财': { meaning: '赔偿/损失', weight: 0.5, positive: '获得赔偿', negative: '损失钱财' },
    },
  },
  {
    zhanShi: '学业',
    yongShen: '父母',
    roles: {
      '官鬼': { meaning: '考试/成绩', weight: 0.8, positive: '考试顺利', negative: '考试不利' },
      '父母': { meaning: '学业/文书', weight: 1.0, positive: '学业有成', negative: '学业受阻' },
      '兄弟': { meaning: '同学/竞争', weight: 0.6, positive: '同学互助', negative: '竞争激烈' },
      '子孙': { meaning: '才华/智慧', weight: 0.7, positive: '才华出众', negative: '发挥失常' },
      '妻财': { meaning: '学费/投入', weight: 0.4, positive: '', negative: '经济压力' },
    },
  },
  {
    zhanShi: '天时',
    yongShen: '父母',
    roles: {
      '官鬼': { meaning: '雷电/风暴', weight: 0.7, positive: '', negative: '有风暴' },
      '父母': { meaning: '雨/云', weight: 1.0, positive: '有雨', negative: '无雨' },
      '兄弟': { meaning: '风/云动', weight: 0.6, positive: '有风', negative: '无风' },
      '子孙': { meaning: '晴/散', weight: 0.8, positive: '天晴', negative: '阴天' },
      '妻财': { meaning: '晴/干燥', weight: 0.5, positive: '天晴', negative: '潮湿' },
    },
  },
];

/**
 * 分析六亲
 */
export function analyzeLiuQin(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): LiuQinAnalysis {
  const scene = LIU_QIN_SCENES.find(s => s.zhanShi === zhanShi);
  if (!scene) {
    return {
      yongShen: '官鬼',
      summary: '未指定占事类型，六亲分析暂缺',
      signals: [],
    };
  }

  const signals: JudgmentSignal[] = [];
  const summaryParts: string[] = [];

  pan.sanChuan.forEach((item, idx) => {
    const role = scene.roles[item.liuQin];
    if (role) {
      const pos = ['初传', '中传', '末传'][idx];
      summaryParts.push(`${pos}「${item.liuQin}」：${role.meaning}（权重${role.weight}）`);

      if (role.positive && role.weight >= 0.7) {
        signals.push({
          type: '吉',
          source: `${pos}六亲「${item.liuQin}」`,
          description: role.positive,
          weight: role.weight,
        });
      }
      if (role.negative && role.weight >= 0.7) {
        signals.push({
          type: '凶',
          source: `${pos}六亲「${item.liuQin}」`,
          description: role.negative,
          weight: role.weight,
        });
      }
    }
  });

  return {
    yongShen: scene.yongShen,
    summary: summaryParts.join('\n') || '六亲分析暂无',
    signals,
  };
}
