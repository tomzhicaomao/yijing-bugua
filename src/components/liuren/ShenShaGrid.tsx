/**
 * 神煞网格组件
 */

import React from 'react';
import type { ShenShaItem } from '../../engine/liuren/types.js';

interface ShenShaGridProps {
  shenSha: ShenShaItem[];
}

const ShenShaGrid: React.FC<ShenShaGridProps> = ({ shenSha }) => {
  const ji = shenSha.filter(s => s.category === '吉');
  const xiong = shenSha.filter(s => s.category === '凶');
  const zhong = shenSha.filter(s => s.category === '中性');

  const renderItem = (item: ShenShaItem, idx: number) => (
    <div
      key={`${item.name}-${idx}`}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-nothing-border"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        item.category === '吉' ? 'bg-green-400' :
        item.category === '凶' ? 'bg-red-400' :
        'bg-yellow-400'
      }`} />
      <span className="font-mono text-[11px] text-nothing-text-primary">{item.name}</span>
      <span className="font-mono text-[10px] text-nothing-text-disabled">({item.branch})</span>
    </div>
  );

  return (
    <div className="border border-nothing-border rounded-md overflow-hidden">
      <div className="px-4 py-2 bg-nothing-bg-secondary border-b border-nothing-border">
        <span className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary">神煞</span>
        <span className="ml-2 font-mono text-[10px] text-nothing-text-disabled">
          ({ji.length}吉 · {xiong.length}凶 · {zhong.length}中)
        </span>
      </div>

      <div className="p-3 space-y-3">
        {ji.length > 0 && (
          <div>
            <div className="font-mono text-[10px] text-green-400 tracking-wider mb-1.5">吉神</div>
            <div className="flex flex-wrap gap-1.5">
              {ji.map((item, idx) => renderItem(item, idx))}
            </div>
          </div>
        )}

        {xiong.length > 0 && (
          <div>
            <div className="font-mono text-[10px] text-red-400 tracking-wider mb-1.5">凶神</div>
            <div className="flex flex-wrap gap-1.5">
              {xiong.map((item, idx) => renderItem(item, idx))}
            </div>
          </div>
        )}

        {zhong.length > 0 && (
          <div>
            <div className="font-mono text-[10px] text-yellow-400 tracking-wider mb-1.5">中性</div>
            <div className="flex flex-wrap gap-1.5">
              {zhong.map((item, idx) => renderItem(item, idx))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ShenShaGrid);
