/**
 * 防误判警告条组件
 */

import React from 'react';

interface WarningStripProps {
  warnings: string[];
}

const WarningStrip: React.FC<WarningStripProps> = ({ warnings }) => {
  if (warnings.length === 0) return null;

  return (
    <div className="border border-orange-500/30 rounded-md overflow-hidden">
      <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/30 flex items-center gap-2">
        <span className="text-orange-400 text-sm">⚠️</span>
        <span className="font-mono text-xs tracking-[0.1em] text-orange-400">系统警告</span>
      </div>
      <div className="p-3 space-y-1.5">
        {warnings.map((warning, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-orange-400 text-xs mt-0.5">•</span>
            <span className="font-mono text-[11px] text-orange-300 leading-relaxed">
              {warning}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(WarningStrip);
