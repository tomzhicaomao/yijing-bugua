/**
 * 三传时间线组件
 */

import React from 'react';
import type { SanChuanItem } from '../../engine/liuren/types.js';

interface SanChuanTimelineProps {
  sanChuan: [SanChuanItem, SanChuanItem, SanChuanItem];
}

const NAMES = ['初传', '中传', '末传'];
const SUBTITLES = ['事始', '事中', '事终'];

const SanChuanTimeline: React.FC<SanChuanTimelineProps> = ({ sanChuan }) => {
  return (
    <div className="border border-nothing-border rounded-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-nothing-bg-secondary border-b border-nothing-border">
        <span className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary">三传</span>
      </div>

      {/* Timeline */}
      <div className="flex items-stretch divide-x divide-nothing-border">
        {sanChuan.map((item, idx) => (
          <div key={idx} className="flex-1 px-3 py-4 text-center">
            <div className="font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-1">
              {NAMES[idx]} · {SUBTITLES[idx]}
            </div>
            <div className="font-mono text-2xl text-nothing-text-display mb-2">
              {item.branch}
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[11px] text-nothing-text-secondary">
                {item.tianJiang}
              </div>
              <div className="font-mono text-[10px] text-nothing-text-disabled">
                {item.liuQin} · 遁{item.dunGan}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SanChuanTimeline);
