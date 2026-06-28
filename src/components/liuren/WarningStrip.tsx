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
      <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/30">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-sm">⚠️</span>
          <span className="font-mono text-xs tracking-[0.1em] text-orange-400">注意事项</span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-orange-300/70 leading-relaxed">
          以下提示不影响起课结果，但解读时需要留意
        </p>
      </div>
      <div className="p-3 space-y-2">
        {warnings.map((warning, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-orange-400 text-[10px] mt-1 shrink-0">▸</span>
            <span className="font-mono text-[11px] text-orange-200 leading-relaxed">
              {warning}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(WarningStrip);
