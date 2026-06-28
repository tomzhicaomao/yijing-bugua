/**
 * 天地盘表格组件
 */

import React from 'react';
import type { TianDiPan } from '../../engine/liuren/types.js';

interface LiurenPanTableProps {
  tianDiPan: TianDiPan;
}

const LiurenPanTable: React.FC<LiurenPanTableProps> = ({ tianDiPan }) => {
  return (
    <div className="border border-nothing-border rounded-md overflow-hidden">
      <div className="px-4 py-2 bg-nothing-bg-secondary border-b border-nothing-border">
        <span className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary">天地盘</span>
      </div>

      <div className="p-3">
        {/* 天盘行 */}
        <div className="mb-2">
          <div className="font-mono text-[10px] text-nothing-text-disabled mb-1 tracking-wider">天盘</div>
          <div className="grid grid-cols-6 gap-1">
            {tianDiPan.tianPan.map((branch, idx) => (
              <div
                key={`tian-${idx}`}
                className="text-center py-1.5 border border-nothing-border rounded font-mono text-sm text-nothing-text-display"
              >
                {branch}
              </div>
            ))}
          </div>
        </div>

        {/* 地盘行 */}
        <div>
          <div className="font-mono text-[10px] text-nothing-text-disabled mb-1 tracking-wider">地盘</div>
          <div className="grid grid-cols-6 gap-1">
            {tianDiPan.diPan.map((branch, idx) => (
              <div
                key={`di-${idx}`}
                className="text-center py-1.5 border border-nothing-border rounded font-mono text-sm text-nothing-text-secondary"
              >
                {branch}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LiurenPanTable);
