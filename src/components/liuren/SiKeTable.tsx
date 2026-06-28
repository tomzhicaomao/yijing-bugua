/**
 * 四课表格组件
 */

import React from 'react';
import type { SiKeItem } from '../../engine/liuren/types.js';

interface SiKeTableProps {
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem];
  dayGanZhi: string;
}

const RELATION_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  '上克下': { symbol: '↓', color: 'text-orange-400' },
  '下贼上': { symbol: '↑', color: 'text-red-400' },
  '比和': { symbol: '=', color: 'text-green-400' },
};

const SiKeTable: React.FC<SiKeTableProps> = ({ siKe, dayGanZhi }) => {
  const names = ['一课', '二课', '三课', '四课'];

  return (
    <div className="border border-nothing-border rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-nothing-bg-secondary border-b border-nothing-border">
        <span className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary">四课</span>
        <span className="font-mono text-xs text-nothing-text-disabled">{dayGanZhi}</span>
      </div>

      {/* 四课行 */}
      <div className="divide-y divide-nothing-border">
        {siKe.map((item, idx) => {
          const rel = RELATION_SYMBOLS[item.relation];
          return (
            <div key={idx} className="flex items-center px-4 py-3">
              <span className="w-12 font-mono text-[11px] text-nothing-text-disabled tracking-wider">
                {names[idx]}
              </span>
              <div className="flex-1 flex items-center justify-center gap-3">
                <span className="font-mono text-lg text-nothing-text-display">
                  {item.upperGod}
                </span>
                <span className={`font-mono text-sm ${rel.color}`}>
                  {rel.symbol}
                </span>
                <span className="font-mono text-lg text-nothing-text-primary">
                  {item.lowerGod}
                </span>
              </div>
              <span className={`font-mono text-[10px] ${rel.color}`}>
                {item.relation}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(SiKeTable);
