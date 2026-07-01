/**
 * 天将象义模块
 *
 * 将12天将的象义按占事类型进行语义映射，
 * 提供结构化的天将分析结果。
 */

import type { Branch, LiurenPan, TianJiangName } from './types.js';
import type { ZhanShi } from './bifa.js';
import type { JudgmentSignal } from './framework-types.js';

/** 天将象义定义 */
export interface TianJiangMeaning {
  name: TianJiangName;
  wuXing: '土' | '火' | '木' | '金' | '水';
  baseJiXiong: '吉' | '凶' | '中性';
  meanings: Partial<Record<ZhanShi, {
    primary: string;
    secondary: string[];
    advice: string;
  }>>;
}

/** 天将分析结果 */
export interface TianJiangAnalysis {
  sanChuanJiang: Array<{
    branch: Branch;
    jiang: TianJiangName;
    meaning?: TianJiangMeaning['meanings'][ZhanShi];
  }>;
  summary: string;
  signals: JudgmentSignal[];
}

/** 天将象义数据库 */
export const TIAN_JIANG_MEANINGS: TianJiangMeaning[] = [
  {
    name: '贵人',
    wuXing: '土',
    baseJiXiong: '吉',
    meanings: {
      '官职': { primary: '贵人扶持，有上级赏识', secondary: ['有人推荐', '面试通过'], advice: '宜主动争取，贵人会在关键时刻出现' },
      '婚姻': { primary: '有媒人牵线，姻缘正配', secondary: ['门当户对', '长辈支持'], advice: '可请长辈出面撮合' },
      '疾病': { primary: '有贵人相助，可遇良医', secondary: ['医疗条件好', '有人照顾'], advice: '积极就医，会有好医生' },
      '求财': { primary: '有贵人引财，财运亨通', secondary: ['有人介绍生意', '合作生财'], advice: '可寻求合作，贵人会带来机会' },
      '出行': { primary: '旅途顺利，有人相助', secondary: ['遇到好心人', '住宿便利'], advice: '放心出行，会有意外帮助' },
      '诉讼': { primary: '有贵人调解，可化干戈为玉帛', secondary: ['法官公正', '有人说情'], advice: '宜和解，贵人会出面调停' },
      '学业': { primary: '有名师指点，学业有成', secondary: ['考试顺利', '有人帮助'], advice: '虚心求教，贵人会出现在学业上' },
    },
  },
  {
    name: '螣蛇',
    wuXing: '火',
    baseJiXiong: '凶',
    meanings: {
      '官职': { primary: '虚惊一场，有名无实', secondary: ['职位不稳', '被人暗算'], advice: '保持警惕，不要轻信他人' },
      '婚姻': { primary: '对方虚情假意，不真诚', secondary: ['有第三者', '感情不专'], advice: '仔细观察对方真实意图' },
      '疾病': { primary: '怪病/心理疾病，难以诊断', secondary: ['精神压力大', '失眠多梦'], advice: '需看心理医生或中医调理' },
      '求财': { primary: '虚耗，财来财去', secondary: ['投资有风险', '被人骗财'], advice: '不宜大额投资，小心被骗' },
      '出行': { primary: '虚惊，有惊无险', secondary: ['延误', '小事故'], advice: '出行需小心，但不会有大碍' },
      '诉讼': { primary: '口舌是非，被人诬告', secondary: ['有人从中作梗', '证据不足'], advice: '收集证据，不要轻举妄动' },
      '学业': { primary: '学习分心，注意力不集中', secondary: ['考试紧张', '发挥失常'], advice: '调整心态，不要给自己太大压力' },
    },
  },
  {
    name: '朱雀',
    wuXing: '火',
    baseJiXiong: '凶',
    meanings: {
      '官职': { primary: '口舌是非，有人诽谤', secondary: ['被人议论', '文件有误'], advice: '注意言辞，避免口舌之争' },
      '婚姻': { primary: '有口舌争吵，沟通不畅', secondary: ['吵架', '误会'], advice: '多沟通，避免误会' },
      '疾病': { primary: '热症、炎症', secondary: ['发烧', '上火'], advice: '注意降火，清淡饮食' },
      '求财': { primary: '有消息带来财运', secondary: ['听到好消息', '有商机'], advice: '留意身边的信息' },
      '出行': { primary: '有消息延误，但最终顺利', secondary: ['车票问题', '通知延迟'], advice: '提前确认行程信息' },
      '诉讼': { primary: '有文书往来，口舌争辩', secondary: ['需要写诉状', '法庭辩论'], advice: '准备充分的书面材料' },
      '学业': { primary: '考试有口试或面试', secondary: ['需要表达能力', '面试重要'], advice: '准备充分，自信表达' },
    },
  },
  {
    name: '六合',
    wuXing: '木',
    baseJiXiong: '吉',
    meanings: {
      '官职': { primary: '有人合作，共同完成任务', secondary: ['团队合作', '有人帮助'], advice: '积极参与团队工作' },
      '婚姻': { primary: '姻缘天成，感情和谐', secondary: ['双方满意', '家庭支持'], advice: '珍惜缘分，用心经营' },
      '疾病': { primary: '可以治愈，有人照顾', secondary: ['治疗顺利', '有人陪伴'], advice: '积极配合治疗' },
      '求财': { primary: '合伙生财，财运亨通', secondary: ['合作赚钱', '投资顺利'], advice: '寻找可靠的合作伙伴' },
      '出行': { primary: '旅途愉快，有人同行', secondary: ['结伴旅行', '遇到朋友'], advice: '适合结伴出行' },
      '诉讼': { primary: '可以和解，双方满意', secondary: ['调解成功', '庭外和解'], advice: '考虑和解方案' },
      '学业': { primary: '有同学帮助，学习顺利', secondary: ['小组学习', '有人辅导'], advice: '多与同学交流' },
    },
  },
  {
    name: '勾陈',
    wuXing: '土',
    baseJiXiong: '凶',
    meanings: {
      '官职': { primary: '工作繁琐，事务繁忙', secondary: ['加班多', '任务重'], advice: '合理安排工作时间' },
      '婚姻': { primary: '感情纠缠，难以解脱', secondary: ['旧情复燃', '纠缠不清'], advice: '果断处理感情问题' },
      '疾病': { primary: '病情反复，难以根治', secondary: ['慢性病', '需要长期治疗'], advice: '坚持治疗，不要放弃' },
      '求财': { primary: '求财困难，需要耐心', secondary: ['进展缓慢', '需要等待'], advice: '不要急于求成' },
      '出行': { primary: '旅途劳累，有阻碍', secondary: ['交通拥堵', '行程变更'], advice: '提前做好准备' },
      '诉讼': { primary: '官司缠身，难以脱身', secondary: ['诉讼漫长', '需要耐心'], advice: '积极应诉，争取和解' },
      '学业': { primary: '学习压力大，需要努力', secondary: ['作业多', '考试难'], advice: '制定学习计划，循序渐进' },
    },
  },
  {
    name: '青龙',
    wuXing: '木',
    baseJiXiong: '吉',
    meanings: {
      '官职': { primary: '升迁有望，事业顺利', secondary: ['有喜事', '有人提拔'], advice: '积极表现，把握机会' },
      '婚姻': { primary: '喜事将近，婚姻美满', secondary: ['订婚', '结婚'], advice: '准备喜事，迎接幸福' },
      '疾病': { primary: '病情好转，可以治愈', secondary: ['康复中', '有喜讯'], advice: '保持乐观，积极配合治疗' },
      '求财': { primary: '财运亨通，有意外之财', secondary: ['投资获利', '中奖'], advice: '把握机会，但不要贪心' },
      '出行': { primary: '旅途顺利，有喜事', secondary: ['遇到好事', '心情愉快'], advice: '放心出行，会有好心情' },
      '诉讼': { primary: '官司顺利，可以胜诉', secondary: ['证据充分', '法官公正'], advice: '积极准备证据' },
      '学业': { primary: '学业有成，考试顺利', secondary: ['成绩优秀', '获得奖励'], advice: '继续努力，保持优秀' },
    },
  },
  {
    name: '天空',
    wuXing: '土',
    baseJiXiong: '凶',
    meanings: {
      '官职': { primary: '有名无实，虚职虚名', secondary: ['职位不高', '权力不大'], advice: '不要追求虚名，注重实际' },
      '婚姻': { primary: '对方不实在，有欺骗', secondary: ['隐瞒真相', '不真诚'], advice: '仔细了解对方背景' },
      '疾病': { primary: '病情不明确，难以诊断', secondary: ['检查不出原因', '需要进一步检查'], advice: '多做检查，不要忽视' },
      '求财': { primary: '空欢喜，财不聚', secondary: ['投资失败', '被人骗'], advice: '不要轻信高收益投资' },
      '出行': { primary: '计划落空，行程有变', secondary: ['取消行程', '延期'], advice: '做好备选方案' },
      '诉讼': { primary: '证据不足，难以胜诉', secondary: ['缺乏证据', '对方有理'], advice: '收集更多证据' },
      '学业': { primary: '学习效率低，收获少', secondary: ['注意力不集中', '成绩不理想'], advice: '调整学习方法' },
    },
  },
  {
    name: '白虎',
    wuXing: '金',
    baseJiXiong: '凶',
    meanings: {
      '官职': { primary: '有危险，需谨慎', secondary: ['职位不稳', '有人攻击'], advice: '保持低调，避免冲突' },
      '婚姻': { primary: '有争吵，感情有伤', secondary: ['吵架', '分手'], advice: '控制情绪，避免冲突' },
      '疾病': { primary: '病情严重，需速就医', secondary: ['急症', '需要手术'], advice: '立即就医，不要拖延' },
      '求财': { primary: '有破财之忧', secondary: ['损失', '被盗'], advice: '保管好财物，避免投资' },
      '出行': { primary: '有血光之灾，不宜出行', secondary: ['事故', '受伤'], advice: '尽量避免出行，注意安全' },
      '诉讼': { primary: '官司凶险，需要小心', secondary: ['败诉', '有刑罚'], advice: '积极和解，避免判决' },
      '学业': { primary: '学习有压力，需要努力', secondary: ['考试难', '竞争激烈'], advice: '加倍努力，不要放弃' },
    },
  },
  {
    name: '太常',
    wuXing: '土',
    baseJiXiong: '吉',
    meanings: {
      '官职': { primary: '有升迁机会，事业稳定', secondary: ['工作顺利', '收入增加'], advice: '保持稳定，逐步提升' },
      '婚姻': { primary: '婚姻稳定，生活美满', secondary: ['家庭和睦', '子女孝顺'], advice: '珍惜家庭，用心经营' },
      '疾病': { primary: '病情稳定，可以治愈', secondary: ['恢复中', '有人照顾'], advice: '保持良好心态，积极配合治疗' },
      '求财': { primary: '财运稳定，收入可观', secondary: ['工资增加', '投资获利'], advice: '稳健投资，不要冒险' },
      '出行': { primary: '旅途顺利，心情愉快', secondary: ['遇到好事', '收获满满'], advice: '放心出行，享受旅途' },
      '诉讼': { primary: '官司顺利，可以胜诉', secondary: ['证据充分', '法官公正'], advice: '积极准备证据' },
      '学业': { primary: '学业顺利，成绩优秀', secondary: ['考试通过', '获得奖励'], advice: '继续保持，争取更好' },
    },
  },
  {
    name: '玄武',
    wuXing: '水',
    baseJiXiong: '凶',
    meanings: {
      '官职': { primary: '有人暗中作祟，需小心', secondary: ['被人陷害', '暗箭难防'], advice: '保持警惕，不要轻信他人' },
      '婚姻': { primary: '有第三者，感情不专', secondary: ['出轨', '欺骗'], advice: '仔细观察对方，不要被骗' },
      '疾病': { primary: '病情隐藏，难以发现', secondary: ['暗病', '需要检查'], advice: '做全面检查，不要忽视' },
      '求财': { primary: '有破财之忧，需小心', secondary: ['被盗', '被骗'], advice: '保管好财物，不要轻信他人' },
      '出行': { primary: '有盗窃之忧，需小心', secondary: ['丢失物品', '被偷'], advice: '保管好财物，注意安全' },
      '诉讼': { primary: '有暗中操作，需小心', secondary: ['被人暗算', '证据被毁'], advice: '收集证据，不要轻信他人' },
      '学业': { primary: '学习有干扰，需专心', secondary: ['分心', '被人影响'], advice: '排除干扰，专心学习' },
    },
  },
  {
    name: '太阴',
    wuXing: '金',
    baseJiXiong: '中性',
    meanings: {
      '官职': { primary: '有暗中帮助，但不明显', secondary: ['有人暗中支持', '不为人知'], advice: '不要张扬，默默努力' },
      '婚姻': { primary: '有暗恋或暗中撮合', secondary: ['暗恋', '暗中帮忙'], advice: '注意身边的人' },
      '疾病': { primary: '病情隐蔽，需要细心', secondary: ['暗病', '需要检查'], advice: '做全面检查，不要忽视' },
      '求财': { primary: '有暗财，但不明显', secondary: ['意外之财', '暗中获利'], advice: '留意身边的机会' },
      '出行': { primary: '旅途顺利，但不张扬', secondary: ['顺利到达', '心情平静'], advice: '低调出行，享受旅途' },
      '诉讼': { primary: '有暗中帮助，可以胜诉', secondary: ['有人暗中支持', '证据充分'], advice: '积极准备证据' },
      '学业': { primary: '学习有暗中帮助', secondary: ['有人辅导', '资料丰富'], advice: '珍惜帮助，努力学习' },
    },
  },
  {
    name: '天后',
    wuXing: '水',
    baseJiXiong: '吉',
    meanings: {
      '官职': { primary: '有女性贵人相助', secondary: ['女上司帮助', '女性同事支持'], advice: '与女性同事搞好关系' },
      '婚姻': { primary: '姻缘天成，感情和谐', secondary: ['双方满意', '家庭支持'], advice: '珍惜缘分，用心经营' },
      '疾病': { primary: '可以治愈，有人照顾', secondary: ['治疗顺利', '有人陪伴'], advice: '积极配合治疗' },
      '求财': { primary: '有女性贵人引财', secondary: ['女性介绍生意', '合作生财'], advice: '与女性合作，共同赚钱' },
      '出行': { primary: '旅途顺利，有人照顾', secondary: ['遇到好心人', '住宿便利'], advice: '放心出行，会有意外帮助' },
      '诉讼': { primary: '有女性贵人调解', secondary: ['女性法官', '女性调解员'], advice: '寻求女性帮助' },
      '学业': { primary: '有女性贵人帮助', secondary: ['女老师指导', '女性同学帮助'], advice: '虚心求教，珍惜帮助' },
    },
  },
];

/**
 * 分析天将象义
 */
export function analyzeTianJiang(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): TianJiangAnalysis {
  const sanChuanJiang = pan.sanChuan.map(item => {
    const meaning = TIAN_JIANG_MEANINGS.find(m => m.name === item.tianJiang);
    return {
      branch: item.branch,
      jiang: item.tianJiang,
      meaning: zhanShi && meaning ? meaning.meanings[zhanShi] : undefined,
    };
  });

  const signals: JudgmentSignal[] = [];
  const summaryParts: string[] = [];

  sanChuanJiang.forEach(item => {
    const meaning = TIAN_JIANG_MEANINGS.find(m => m.name === item.jiang);
    if (meaning && zhanShi) {
      const sceneMeaning = meaning.meanings[zhanShi];
      if (sceneMeaning) {
        summaryParts.push(`${item.jiang}临${item.branch}：${sceneMeaning.primary}`);
        signals.push({
          type: meaning.baseJiXiong === '凶' ? '凶' : '吉',
          source: `天将「${item.jiang}」`,
          description: sceneMeaning.primary,
          weight: 0.7,
        });
      }
    }
  });

  return {
    sanChuanJiang,
    summary: summaryParts.join('\n') || '天将分析暂无',
    signals,
  };
}
