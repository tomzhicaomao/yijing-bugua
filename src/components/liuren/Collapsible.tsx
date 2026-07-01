import React, { useState } from 'react';

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  defaultOpen = false,
  badge,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-nothing-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-nothing-bg-secondary hover:bg-nothing-raised transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="font-mono text-[9px] text-nothing-text-disabled bg-nothing-raised px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-nothing-text-disabled">
          {open ? '收起' : '展开'}
        </span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
};

export default React.memo(Collapsible);
