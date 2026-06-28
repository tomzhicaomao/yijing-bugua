/**
 * 天将徽章组件
 */

import React from 'react';
import type { TianJiangName } from '../../engine/liuren/types.js';

interface TianJiangBadgeProps {
  name: TianJiangName;
  size?: 'sm' | 'md';
}

const TIAN_JIANG_COLORS: Record<TianJiangName, string> = {
  '贵人': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '螣蛇': 'bg-red-500/20 text-red-400 border-red-500/30',
  '朱雀': 'bg-red-500/20 text-red-400 border-red-500/30',
  '六合': 'bg-green-500/20 text-green-400 border-green-500/30',
  '勾陈': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '青龙': 'bg-green-500/20 text-green-400 border-green-500/30',
  '天空': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  '白虎': 'bg-red-500/20 text-red-400 border-red-500/30',
  '太常': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '玄武': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '太阴': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  '天后': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const TianJiangBadge: React.FC<TianJiangBadgeProps> = ({ name, size = 'sm' }) => {
  const colorClass = TIAN_JIANG_COLORS[name] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-mono rounded border ${colorClass} ${sizeClass}`}>
      {name}
    </span>
  );
};

export default React.memo(TianJiangBadge);
