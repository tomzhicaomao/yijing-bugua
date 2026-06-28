/**
 * 格局卡片组件
 */

import React from 'react';
import type { GeJu } from '../../engine/liuren/types.js';

interface GeJuCardProps {
  geJu: GeJu;
  dayGanZhi: string;
  solarTerm: string;
  yueJiang: string;
  shiZhi: string;
  isDaytime: boolean;
}

const GEJU_LABELS: Record<GeJu, { desc: string; tone: 'ji' | 'xiong' | 'zhong' }> = {
  '元首': { desc: '上克下，一阳统众阴', tone: 'ji' },
  '重审': { desc: '下贼上，以下犯上', tone: 'zhong' },
  '知一': { desc: '比用取一，事归一途', tone: 'zhong' },
  '涉害': { desc: '涉害深者为用', tone: 'zhong' },
  '遥克': { desc: '遥相克制', tone: 'zhong' },
  '昴星': { desc: '酉金昴星，虎视眈眈', tone: 'xiong' },
  '别责': { desc: '别取其责', tone: 'zhong' },
  '八专': { desc: '干支同位，事涉专一', tone: 'zhong' },
  '伏吟': { desc: '天地盘同，事主不动', tone: 'xiong' },
  '返吟': { desc: '天地盘冲，事主反复', tone: 'xiong' },
};

const TONE_STYLES: Record<string, string> = {
  'ji': 'border-green-500/30 text-green-400',
  'xiong': 'border-red-500/30 text-red-400',
  'zhong': 'border-yellow-500/30 text-yellow-400',
};

const GeJuCard: React.FC<GeJuCardProps> = ({ geJu, dayGanZhi, solarTerm, yueJiang, shiZhi, isDaytime }) => {
  const info = GEJU_LABELS[geJu];
  const toneClass = TONE_STYLES[info?.tone || 'zhong'];

  return (
    <div className={`border rounded-md p-4 ${toneClass}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-mono text-xl text-nothing-text-display tracking-wider">{geJu}</span>
          <span className="ml-2 font-mono text-[10px] text-nothing-text-disabled">课体格局</span>
        </div>
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
          info?.tone === 'ji' ? 'bg-green-500/10 text-green-400' :
          info?.tone === 'xiong' ? 'bg-red-500/10 text-red-400' :
          'bg-yellow-500/10 text-yellow-400'
        }`}>
          {info?.tone === 'ji' ? '吉' : info?.tone === 'xiong' ? '凶' : '中'}
        </span>
      </div>

      <p className="text-sm text-nothing-text-secondary mb-3">{info?.desc}</p>

      <div className="flex items-center gap-4 font-mono text-[10px] text-nothing-text-disabled">
        <span>{dayGanZhi}</span>
        <span>·</span>
        <span>{solarTerm}</span>
        <span>·</span>
        <span>月将 {yueJiang}</span>
        <span>·</span>
        <span>{isDaytime ? '昼' : '夜'}占 {shiZhi}时</span>
      </div>
    </div>
  );
};

export default React.memo(GeJuCard);
