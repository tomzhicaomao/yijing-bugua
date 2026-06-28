/**
 * 节气边界检测
 *
 * 检查占卜时间是否在节气交接±1天的范围内
 * 此时月将可能不准，需要特别提醒
 */

/**
 * 节气边界检测结果
 */
export interface JieqiBoundaryResult {
  isNearBoundary: boolean;    // 是否在节气边界附近
  solarTerm: string;          // 当前节气
  daysFromBoundary: number;   // 距离节气天数
  warning: string;            // 警告信息
}

/**
 * 检查是否在节气边界附近
 *
 * @param date 占卜时间
 * @param solarTerm 当前节气名称
 * @param termDate 节气精确日期
 * @returns 检测结果
 */
export function checkJieqiBoundary(
  date: Date,
  solarTerm: string,
  termDate: Date,
): JieqiBoundaryResult {
  const diffMs = Math.abs(date.getTime() - termDate.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const isNear = diffDays <= 1;

  let warning = '';
  if (isNear) {
    if (diffDays < 0.5) {
      warning = `占时正处于「${solarTerm}」节气交接点附近 — 月将可能正在更替，此时起课不一定准，建议换个时辰再占一次`;
    } else {
      warning = `占时接近「${solarTerm}」节气边界（约${Math.round(diffDays * 24)}小时内）— 月将更替中，结果仅供参考`;
    }
  }

  return {
    isNearBoundary: isNear,
    solarTerm,
    daysFromBoundary: diffDays,
    warning,
  };
}
