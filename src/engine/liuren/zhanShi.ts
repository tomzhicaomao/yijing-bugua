/**
 * 占事推断模块
 *
 * 根据问题关键词推断占事类型
 */

import type { ZhanShi } from './bifa.js';

const KEYWORD_MAP: Record<ZhanShi, string[]> = {
  '官职': ['考试', '升职', '工作', '事业', '官', '领导', '面试', '求职'],
  '婚姻': ['婚姻', '结婚', '恋爱', '桃花', '对象', '感情'],
  '疾病': ['病', '健康', '医院', '手术', '身体'],
  '求财': ['钱', '财', '投资', '买卖', '生意', '收入'],
  '出行': ['出行', '旅行', '出差', '搬迁', '远行'],
  '诉讼': ['官司', '诉讼', '纠纷', '法律'],
  '学业': ['学习', '考试', '读书', '论文', '学业'],
  '天时': ['天气', '下雨', '晴'],
  '其他': [],
};

/**
 * 根据问题文本推断占事类型
 *
 * @param question 用户问题
 * @returns 占事类型
 */
export function inferZhanShi(question: string): ZhanShi {
  for (const [scene, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => question.includes(kw))) return scene as ZhanShi;
  }
  return '其他';
}
