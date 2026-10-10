import React from 'react';
import { 
  Lightbulb, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Droplets, 
  Truck, 
  Factory, 
  Archive, 
  Pickaxe,
  CheckCircle2
} from 'lucide-react';
import { AlertSeverity, ZoneData } from '../types';

interface RecommendationsPanelProps {
  zones: ZoneData[];
  onTriggerSuppression: (zoneId: ZoneData['id']) => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  zones,
  onTriggerSuppression,
}) => {
  const worstStatus: AlertSeverity = zones.some((z) => z.status === 'critical')
    ? 'critical'
    : zones.some((z) => z.status === 'warning')
    ? 'warning'
    : 'normal';

  const zoneIcons: Record<string, any> = {
    mining: Pickaxe,
    crushing: Factory,
    transportation: Truck,
    storage: Archive,
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-['Chakra_Petch',sans-serif] text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>Standard Environmental Dust-Control Procedures</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstration guidance mapped to current particulate status across site zones.
          </p>
        </div>

        {/* Status tag */}
        <div className="shrink-0">
          {worstStatus === 'critical' ? (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              Site Action Required
            </span>
          ) : worstStatus === 'warning' ? (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Site Advisory
            </span>
          ) : (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Standard Routine
            </span>
          )}
        </div>
      </div>

      {/* Grid of Zone Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {zones.map((zone) => {
          const Icon = zoneIcons[zone.id] || Factory;
          const isCrit = zone.status === 'critical';
          const isWarn = zone.status === 'warning';

          return (
            <div
              key={zone.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isCrit
                  ? 'bg-rose-950/25 border-rose-500/40'
                  : isWarn
                  ? 'bg-amber-950/25 border-amber-500/40'
                  : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded ${
                      isCrit
                        ? 'bg-rose-500/20 text-rose-400'
                        : isWarn
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{zone.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{zone.code}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                    isCrit
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isWarn
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {zone.status}
                </span>
              </div>

              {/* Action items based on zone type and status */}
              <ul className="text-xs text-slate-300 space-y-1.5 my-2.5">
                {zone.id === 'mining' && (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">▸</span>
                      <span>
                        {isCrit
                          ? 'Immediate shovel slow-down. Reposition mobile high-pressure misting cannon upwind.'
                          : isWarn
                          ? 'Increase water tanker cycle frequency along active bench haul roads.'
                          : 'Maintain routine perimeter misting schedule and baseline dust suppression.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                      <span className="text-slate-500">▸</span>
                      <span>Assigned gear: {zone.equipment}</span>
                    </li>
                  </>
                )}

                {zone.id === 'crushing' && (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">▸</span>
                      <span>
                        {isCrit
                          ? 'Inspect crusher rubber skirt seals and start secondary dry-fog dust extraction hoppers.'
                          : isWarn
                          ? 'Inspect water spray nozzles on feed hopper #2 for sediment clogging.'
                          : 'Normal crusher circuit operation; periodic water spray nozzle checks.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                      <span className="text-slate-500">▸</span>
                      <span>Assigned gear: {zone.equipment}</span>
                    </li>
                  </>
                )}

                {zone.id === 'transportation' && (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">▸</span>
                      <span>
                        {isCrit
                          ? 'Enforce 20 km/h speed limit on unpaved roads and deploy chemical dust binder tanker.'
                          : isWarn
                          ? 'Inspect haul truck tailgates and mandate tarping on loaded coal transports.'
                          : 'Standard road wetting cycle (every 45 minutes) and speed radar active.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                      <span className="text-slate-500">▸</span>
                      <span>Assigned fleet: {zone.equipment}</span>
                    </li>
                  </>
                )}

                {zone.id === 'storage' && (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">▸</span>
                      <span>
                        {isCrit
                          ? 'Activate automated 360° stockpile deluge monitors; verify perimeter windbreak netting.'
                          : isWarn
                          ? 'Inspect moisture retention in ROM coal stockpile face before reclaim belt loading.'
                          : 'Routine stockpile crusting and scheduled perimeter boundary surveys.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                      <span className="text-slate-500">▸</span>
                      <span>Assigned plant: {zone.equipment}</span>
                    </li>
                  </>
                )}
              </ul>

              {/* Action trigger button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Suppression: {zone.dustSuppressionActive ? 'Engaged' : 'Idle'}
                </span>
                <button
                  onClick={() => onTriggerSuppression(zone.id)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                    zone.dustSuppressionActive
                      ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                  }`}
                >
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{zone.dustSuppressionActive ? 'Active (Tap to stop)' : 'Activate Water Sprayers'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
