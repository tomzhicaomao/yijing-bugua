/**
 * 毕法赋规则数据库
 *
 * 实现第一批20条毕法赋法则，
 * 每条法则包含条件函数和场景判断。
 */

import type { Branch, Gan } from './types.js';
import { BRANCH_INDEX, BRANCH_WUXING, GAN_JI_GONG, getShengKe, BRANCH_YINYANG } from './types.js';
import { calcKongWang } from './kongwang-detect.js';
import { LU_MAP, MU_KU_MAP } from './constants.js';
import type { BiFaRule } from './bifa.js';

/**
 * 检查地支是否空亡
 */
function isBranchKongWang(branch: Branch, dayGanZhi: string): boolean {
  const dayGan = dayGanZhi[0] as Gan;
  const dayZhi = dayGanZhi[1] as Branch;
  const [null1, null2] = calcKongWang(dayGan, dayZhi);
  return branch === null1 || branch === null2;
}

/**
 * 第一批毕法赋规则（20条）
 */
export const BI_FA_RULES: BiFaRule[] = [
  // === 第1法：前后引从升迁吉 ===
  {
    id: 1,
    title: '前后引从升迁吉',
    description: '引干宜进职，引支宜迁宅。三传前后引从日干。',
    category: '官禄功名',
    condition: (pan) => {
      const dayGan = pan.dayGanZhi[0] as Gan;
      const dayIdx = BRANCH_INDEX[GAN_JI_GONG[dayGan]];
      const scIndices = pan.sanChuan.map(item => BRANCH_INDEX[item.branch]);
      return (
        (scIndices[0] < dayIdx && scIndices[2] > dayIdx) ||
        (scIndices[0] > dayIdx && scIndices[2] < dayIdx)
      );
    },
    judgment: {
      trend: '吉',
      scene: {
        '官职': '升迁有望，职位提升',
        '出行': '旅途顺利',
      },
    },
  },

  // === 第2法：首尾相见始终宜 ===
  {
    id: 2,
    title: '首尾相见始终宜',
    description: '初传与末传同支，事情始终如一。',
    category: '三传变化',
    condition: (pan) => {
      return pan.sanChuan[0].branch === pan.sanChuan[2].branch;
    },
    judgment: {
      trend: '吉',
      scene: {
        '官职': '始终顺利',
        '求财': '有始有终，财可得',
      },
    },
  },

  // === 第3法：帘幕贵人高甲第 ===
  {
    id: 3,
    title: '帘幕贵人高甲第',
    description: '贵人入传，主科举高中。',
    category: '官禄功名',
    condition: (pan) => {
      const guiRenBranch = pan.tianJiang.guiRenBranch;
      return pan.sanChuan.some(item => item.branch === guiRenBranch);
    },
    judgment: {
      trend: '吉',
      scene: {
        '官职': '考试通过，功名有望',
        '学业': '学业有成',
      },
    },
  },

  // === 第6法：六阴相继尽昏迷 ===
  {
    id: 6,
    title: '六阴相继尽昏迷',
    description: '四课三传皆阴支，主阴私隐晦，昏迷不醒。',
    category: '墓神凶象',
    condition: (pan) => {
      const allBranches = [
        ...pan.siKe.flatMap(ke => [ke.upperGod, ke.lowerGod]),
        ...pan.sanChuan.map(item => item.branch),
      ];
      return allBranches.every(b => BRANCH_YINYANG[b] === '阴');
    },
    judgment: {
      trend: '凶',
      scene: {
        '婚姻': '有暧昧之事，对方不诚',
        '官职': '暗中有人作祟',
        '疾病': '病情昏沉，难清醒',
      },
    },
  },

  // === 第7法：旺禄临身徒妄作 ===
  {
    id: 7,
    title: '旺禄临身徒妄作',
    description: '旺禄临日干，有福不用忙。',
    category: '官禄功名',
    condition: (pan) => {
      const dayGan = pan.dayGanZhi[0] as Gan;
      const lu = LU_MAP[dayGan];
      return pan.sanChuan[0].branch === lu;
    },
    judgment: {
      trend: '吉',
      scene: {
        '官职': '有福不用忙，自然顺利',
        '求财': '财来自有，不必强求',
      },
    },
  },

  // === 第9法：支坟财墓哭声起 ===
  {
    id: 9,
    title: '支坟财墓哭声起',
    description: '日支之墓临日干，主有丧事。',
    category: '墓神凶象',
    condition: (pan) => {
      const dayZhi = pan.dayGanZhi[1] as Branch;
      const mu = MU_KU_MAP[dayZhi];
      return pan.sanChuan.some(item => item.branch === mu);
    },
    judgment: {
      trend: '凶',
      scene: {
        '疾病': '病情严重，需速就医',
        '婚姻': '婚姻有阻碍',
      },
    },
  },

  // === 第10法：两蛇夹墓凶难免 ===
  {
    id: 10,
    title: '两蛇夹墓凶难免',
    description: '螣蛇夹日支之墓，主凶灾难免。',
    category: '墓神凶象',
    condition: (pan) => {
      const tengSheCount = pan.sanChuan.filter(item => item.tianJiang === '螣蛇').length;
      return tengSheCount >= 2;
    },
    judgment: {
      trend: '凶',
      scene: {
        '疾病': '怪病缠身，难以治愈',
        '诉讼': '官司凶险',
      },
    },
  },

  // === 第16法：空上乘空事莫追 ===
  {
    id: 16,
    title: '空上乘空事莫追',
    description: '初传空亡且乘天空，事皆落空。',
    category: '空亡进退',
    condition: (pan) => {
      const chuChuan = pan.sanChuan[0];
      const isKongWang = isBranchKongWang(chuChuan.branch, pan.dayGanZhi);
      return isKongWang && chuChuan.tianJiang === '天空';
    },
    judgment: {
      trend: '凶',
      scene: {
        '求财': '空欢喜，财不聚',
        '官职': '虚名虚利',
        '婚姻': '对方不实',
      },
    },
  },

  // === 第17法：传墓入墓分泥絮 ===
  {
    id: 17,
    title: '传墓入墓分泥絮',
    description: '三传皆落墓库，事情如泥絮般混乱。',
    category: '墓神凶象',
    condition: (pan) => {
      // 四墓库：辰(水库)、戌(火库)、丑(金库)、未(木库)
      const muKu = new Set<Branch>(['辰', '戌', '丑', '未']);
      return pan.sanChuan.every(item => muKu.has(item.branch));
    },
    judgment: {
      trend: '凶',
      scene: {
        '疾病': '病情混乱，难以诊治',
        '求财': '财如泥絮，难以聚敛',
      },
    },
  },

  // === 第22法：水日逢丁财动之 ===
  {
    id: 22,
    title: '水日逢丁财动之',
    description: '壬癸日见丁火入传，主财运变动。',
    category: '求财交易',
    condition: (pan) => {
      const dayGan = pan.dayGanZhi[0] as Gan;
      const isShuiRi = dayGan === '壬' || dayGan === '癸';
      const hasDing = pan.sanChuan.some(item => item.dunGan === '丁');
      return isShuiRi && hasDing;
    },
    judgment: {
      trend: '吉',
      scene: {
        '求财': '财运变动，有进财之象',
      },
    },
  },

  // === 第23法：火日逢丁婚烟事 ===
  {
    id: 23,
    title: '火日逢丁婚烟事',
    description: '丙丁日见丁火入传，主婚姻之事。',
    category: '婚姻胎产',
    condition: (pan) => {
      const dayGan = pan.dayGanZhi[0] as Gan;
      const isHuoRi = dayGan === '丙' || dayGan === '丁';
      const hasDing = pan.sanChuan.some(item => item.dunGan === '丁');
      return isHuoRi && hasDing;
    },
    judgment: {
      trend: '中性',
      scene: {
        '婚姻': '有婚姻之事发生',
      },
    },
  },

  // === 第24法：全财抬鬼免灾殃 ===
  {
    id: 24,
    title: '全财抬鬼免灾殃',
    description: '三传皆财，可以化解鬼的凶象。',
    category: '求财交易',
    condition: (pan) => {
      return pan.sanChuan.every(item => item.liuQin === '妻财');
    },
    judgment: {
      trend: '吉',
      scene: {
        '求财': '财运极佳',
        '疾病': '可以化解病情',
      },
    },
  },

  // === 第25法：鬼临三四讼灾频 ===
  {
    id: 25,
    title: '鬼临三四讼灾频',
    description: '官鬼临三四课，主诉讼频繁。',
    category: '诉讼冤狱',
    condition: (pan) => {
      const dayGan = pan.dayGanZhi[0] as Gan;
      const dayGanBranch = GAN_JI_GONG[dayGan];
      return pan.siKe.slice(2).some(ke => {
        const wx = BRANCH_WUXING[ke.upperGod];
        const dayWx = BRANCH_WUXING[dayGanBranch];
        return getShengKe(wx, dayWx) === 'ke';
      });
    },
    judgment: {
      trend: '凶',
      scene: {
        '诉讼': '官司频繁，难以脱身',
        '疾病': '病情反复',
      },
    },
  },

  // === 第31法：三传递生人举荐 ===
  {
    id: 31,
    title: '三传递生人举荐',
    description: '三传递相生，有贵人举荐。',
    category: '三传变化',
    condition: (pan) => {
      const sc = pan.sanChuan.map(item => BRANCH_WUXING[item.branch]);
      return (
        getShengKe(sc[0], sc[1]) === 'sheng' &&
        getShengKe(sc[1], sc[2]) === 'sheng'
      );
    },
    judgment: {
      trend: '吉',
      scene: {
        '官职': '有贵人举荐，升迁可期',
        '求财': '财源广进',
        '婚姻': '有人撮合',
      },
    },
  },

  // === 第32法：三传互克众人欺 ===
  {
    id: 32,
    title: '三传互克众人欺',
    description: '三传递相克，主众人欺凌。',
    category: '三传变化',
    condition: (pan) => {
      const sc = pan.sanChuan.map(item => BRANCH_WUXING[item.branch]);
      return (
        getShengKe(sc[0], sc[1]) === 'ke' &&
        getShengKe(sc[1], sc[2]) === 'ke'
      );
    },
    judgment: {
      trend: '凶',
      scene: {
        '诉讼': '对方人多势众',
        '官职': '受人排挤',
        '疾病': '病情加重',
      },
    },
  },

  // === 第33法：三传递互天网罗 ===
  {
    id: 33,
    title: '三传递互天网罗',
    description: '三传地支相连如网，主被困。',
    category: '三传变化',
    condition: (pan) => {
      const indices = pan.sanChuan.map(item => BRANCH_INDEX[item.branch]);
      const diff1 = Math.abs(indices[1] - indices[0]);
      const diff2 = Math.abs(indices[2] - indices[1]);
      return diff1 === 1 && diff2 === 1;
    },
    judgment: {
      trend: '凶',
      scene: {
        '出行': '旅途受阻',
        '诉讼': '难以脱身',
      },
    },
  },

  // === 第34法：三传间发生百阻 ===
  {
    id: 34,
    title: '三传间发生百阻',
    description: '三传间隔大，事情多阻碍。',
    category: '三传变化',
    condition: (pan) => {
      const indices = pan.sanChuan.map(item => BRANCH_INDEX[item.branch]);
      const diff1 = Math.abs(indices[1] - indices[0]);
      const diff2 = Math.abs(indices[2] - indices[1]);
      return diff1 >= 5 && diff2 >= 5;
    },
    judgment: {
      trend: '凶',
      scene: {
        '出行': '旅途多阻',
        '求财': '求财不顺',
      },
    },
  },

  // === 第40法：后合占婚岂用媒 ===
  {
    id: 40,
    title: '后合占婚岂用媒',
    description: '天后六合入传，婚姻自然成。',
    category: '婚姻胎产',
    condition: (pan) => {
      const scJiang = pan.sanChuan.map(item => item.tianJiang);
      return scJiang.includes('天后') && scJiang.includes('六合');
    },
    judgment: {
      trend: '吉',
      scene: {
        '婚姻': '姻缘天成，无需媒人',
      },
    },
  },

  // === 第50法：龙加生气吉迟迟 ===
  {
    id: 50,
    title: '龙加生气吉迟迟',
    description: '青龙入传，吉利但来得慢。',
    category: '官禄功名',
    condition: (pan) => {
      return pan.sanChuan.some(item => item.tianJiang === '青龙');
    },
    judgment: {
      trend: '吉',
      scene: {
        '官职': '有贵人相助，但需等待',
        '求财': '财运渐好',
      },
    },
  },

  // === 第51法：虎临干鬼凶速速 ===
  {
    id: 51,
    title: '虎临干鬼凶速速',
    description: '白虎乘鬼临干，凶事速至。',
    category: '墓神凶象',
    condition: (pan) => {
      const dayGan = pan.dayGanZhi[0] as Gan;
      const dayGanBranch = GAN_JI_GONG[dayGan];
      return pan.sanChuan.some(item =>
        item.branch === dayGanBranch && item.tianJiang === '白虎',
      );
    },
    judgment: {
      trend: '凶',
      scene: {
        '疾病': '病情危急，需速就医',
        '诉讼': '官司速至，宜速和解',
        '出行': '有血光之灾，不宜出行',
      },
    },
  },

  // === 第52法：勾陈刑狱讼牵缠 ===
  {
    id: 52,
    title: '勾陈刑狱讼牵缠',
    description: '勾陈入传，主诉讼牵缠。',
    category: '诉讼冤狱',
    condition: (pan) => {
      return pan.sanChuan.some(item => item.tianJiang === '勾陈');
    },
    judgment: {
      trend: '凶',
      scene: {
        '诉讼': '官司牵缠，难以了结',
      },
    },
  },

  // === 第60法：玄武盗贼事难防 ===
  {
    id: 60,
    title: '玄武盗贼事难防',
    description: '玄武入传，主盗贼之事。',
    category: '求财交易',
    condition: (pan) => {
      return pan.sanChuan.some(item => item.tianJiang === '玄武');
    },
    judgment: {
      trend: '凶',
      scene: {
        '求财': '有破财之忧',
        '出行': '防盗窃',
      },
    },
  },

  // === 第91法：天将乘丁财动速 ===
  {
    id: 91,
    title: '天将乘丁财动速',
    description: '天将乘丁火入传，财运变动迅速。',
    category: '求财交易',
    condition: (pan) => {
      return pan.sanChuan.some(item => item.dunGan === '丁');
    },
    judgment: {
      trend: '中性',
      scene: {
        '求财': '财运变动，需注意',
      },
    },
  },
];
