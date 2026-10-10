import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-amber-950/40 border-y border-amber-500/30 text-amber-200 text-xs px-4 py-2.5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-start md:items-center gap-2.5">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 md:mt-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] mr-2">
              Demonstration Prototype:
            </span>
            <span className="text-amber-200/90">
              All particulate readings are simulated. Thresholds are configurable demonstration values only and are not certified regulatory limits, legal standards, or health criteria.
            </span>
            {!collapsed && (
              <p className="text-amber-300/70 text-[11px] mt-1 hidden sm:block">
                Prepared as an educational prototype visualizing environmental monitoring concepts. No physical sensor hardware or external cloud connection is required.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-amber-300/80 hover:text-amber-200 text-[11px] flex items-center gap-1 shrink-0 self-end md:self-center font-mono hover:underline"
        >
          {collapsed ? 'More Info' : 'Less Info'}
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
