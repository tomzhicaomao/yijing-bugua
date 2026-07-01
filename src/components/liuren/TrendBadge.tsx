import React from 'react';

interface TrendBadgeProps {
  trend: string;
}

const TREND_COLORS: Record<string, string> = {
  '吉': 'bg-green-500/10 text-green-600 border-green-500/20',
  '利': 'bg-green-500/10 text-green-600 border-green-500/20',
  '凶': 'bg-red-500/10 text-red-600 border-red-500/20',
  '不利': 'bg-red-500/10 text-red-600 border-red-500/20',
  '中性': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  '视情况': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

const DEFAULT_COLOR = 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';

const TrendBadge: React.FC<TrendBadgeProps> = ({ trend }) => (
  <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full border ${TREND_COLORS[trend] || DEFAULT_COLOR}`}>
    {trend}
  </span>
);

export default React.memo(TrendBadge);
