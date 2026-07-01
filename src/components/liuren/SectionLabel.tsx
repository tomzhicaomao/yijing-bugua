import React from 'react';

interface SectionLabelProps {
  label: string;
  sub?: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ label, sub }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">{label}</span>
    {sub && <span className="font-mono text-[10px] text-nothing-text-disabled">· {sub}</span>}
  </div>
);

export default React.memo(SectionLabel);
