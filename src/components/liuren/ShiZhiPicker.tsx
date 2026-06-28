/**
 * 时辰选择器组件
 */

import React, { useState } from 'react';
import type { Branch } from '../../engine/liuren/types.js';

interface ShiZhiPickerProps {
  value: Branch | null;
  onChange: (value: Branch | null) => void;
}

const SHI_ZHI_LIST: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHI_ZHI_LABELS: Record<Branch, string> = {
  '子': '23-01', '丑': '01-03', '寅': '03-05', '卯': '05-07',
  '辰': '07-09', '巳': '09-11', '午': '11-13', '未': '13-15',
  '申': '15-17', '酉': '17-19', '戌': '19-21', '亥': '21-23',
};

const ShiZhiPicker: React.FC<ShiZhiPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-nothing-border rounded-md bg-nothing-bg hover:border-nothing-text-disabled transition-colors"
      >
        <span className="font-mono text-sm text-nothing-text-primary">
          {value ? `${value}时 (${SHI_ZHI_LABELS[value]})` : '自动（当前时辰）'}
        </span>
        <span className="font-mono text-xs text-nothing-text-disabled">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-nothing-border rounded-md bg-nothing-bg shadow-lg max-h-60 overflow-y-auto">
          {/* 自动选项 */}
          <button
            type="button"
            className="w-full px-4 py-2 text-left font-mono text-sm text-nothing-text-secondary hover:bg-nothing-bg-secondary transition-colors border-b border-nothing-border"
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
          >
            自动（当前时辰）
          </button>

          {/* 十二时辰 */}
          {SHI_ZHI_LIST.map(branch => (
            <button
              key={branch}
              type="button"
              className={`w-full px-4 py-2 text-left font-mono text-sm transition-colors ${
                value === branch
                  ? 'bg-nothing-bg-secondary text-nothing-text-display'
                  : 'text-nothing-text-primary hover:bg-nothing-bg-secondary'
              }`}
              onClick={() => {
                onChange(branch);
                setIsOpen(false);
              }}
            >
              {branch}时 · {SHI_ZHI_LABELS[branch]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShiZhiPicker;
