/**
 * 年命选择器 — 天干 + 地支双列选择
 *
 * Props:
 *   value: NianMing | null
 *   onChange: (nm: NianMing) => void
 *   compact?: boolean  // 起课页内紧凑模式
 */

import { GAN_OPTIONS, ZHI_OPTIONS } from '../../types/nian-ming';
import type { NianMing } from '../../types/nian-ming';

interface Props {
  value: NianMing | null;
  onChange: (nm: NianMing) => void;
  compact?: boolean;
}

export default function NianMingPicker({ value, onChange, compact }: Props) {
  const handleGanClick = (gan: NianMing['gan']) => {
    onChange({ gan, zhi: value?.zhi ?? '子' });
  };

  const handleZhiClick = (zhi: NianMing['zhi']) => {
    onChange({ gan: value?.gan ?? '甲', zhi });
  };

  const gap = compact ? 'gap-1' : 'gap-1.5';
  const btnSize = compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const labelSize = compact ? 'text-[10px]' : 'text-[11px]';

  return (
    <div className="space-y-3">
      {/* 天干 */}
      <div>
        <div className={`font-mono ${labelSize} text-nothing-text-disabled tracking-wider mb-1.5`}>
          天干
        </div>
        <div className={`flex flex-wrap ${gap}`}>
          {GAN_OPTIONS.map(gan => (
            <button
              key={gan}
              type="button"
              onClick={() => handleGanClick(gan)}
              className={`${btnSize} flex items-center justify-center rounded border font-mono transition-colors ${
                value?.gan === gan
                  ? 'border-nothing-text-display text-nothing-text-display bg-nothing-bg-secondary'
                  : 'border-nothing-border text-nothing-text-disabled hover:text-nothing-text-secondary'
              }`}
            >
              {gan}
            </button>
          ))}
        </div>
      </div>

      {/* 地支 */}
      <div>
        <div className={`font-mono ${labelSize} text-nothing-text-disabled tracking-wider mb-1.5`}>
          地支
        </div>
        <div className={`flex flex-wrap ${gap}`}>
          {ZHI_OPTIONS.map(zhi => (
            <button
              key={zhi}
              type="button"
              onClick={() => handleZhiClick(zhi)}
              className={`${btnSize} flex items-center justify-center rounded border font-mono transition-colors ${
                value?.zhi === zhi
                  ? 'border-nothing-text-display text-nothing-text-display bg-nothing-bg-secondary'
                  : 'border-nothing-border text-nothing-text-disabled hover:text-nothing-text-secondary'
              }`}
            >
              {zhi}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
