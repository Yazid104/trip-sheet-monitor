import React from 'react';
import { Fuel, ArrowDownRight, ArrowUpRight, AlertOctagon, RotateCw } from 'lucide-react';

interface TripTankGaugeProps {
  currentVolumeM3: number;
  initialVolumeM3: number;
  capacityM3: number;
  isPOOH: boolean;
  onQuickVidange: () => void;
  onQuickRemplissage: () => void;
}

export const TripTankGauge: React.FC<TripTankGaugeProps> = ({
  currentVolumeM3,
  initialVolumeM3,
  capacityM3,
  isPOOH,
  onQuickVidange,
  onQuickRemplissage
}) => {
  const percentage = Math.min(Math.max((currentVolumeM3 / capacityM3) * 100, 0), 100);
  const initialPercentage = Math.min(Math.max((initialVolumeM3 / capacityM3) * 100, 0), 100);

  const isLow = currentVolumeM3 < capacityM3 * 0.20;
  const isHigh = currentVolumeM3 > capacityM3 * 0.85;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Niveau Trip Tank</h3>
            <p className="text-xs text-slate-400 font-mono">Capacité: {capacityM3.toFixed(2)} m³</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-amber-400">
            {currentVolumeM3.toFixed(3)} <span className="text-xs font-normal text-slate-400">m³</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {(currentVolumeM3 * 1000).toFixed(0)} Litres ({percentage.toFixed(0)}%)
          </div>
        </div>
      </div>

      {/* Tank Graphic */}
      <div className="my-4 flex items-center gap-4">
        {/* Visual Tank column */}
        <div className="relative w-16 h-36 bg-slate-950 border-2 border-slate-700 rounded-xl overflow-hidden flex flex-col justify-end shadow-inner shrink-0">
          {/* Level Fill */}
          <div
            className={`w-full transition-all duration-500 ease-out ${
              isLow 
                ? 'bg-rose-500/80 border-t-2 border-rose-400' 
                : isHigh 
                  ? 'bg-amber-500/80 border-t-2 border-amber-300' 
                  : 'bg-sky-500/80 border-t-2 border-sky-300'
            }`}
            style={{ height: `${percentage}%` }}
          />

          {/* Reference initial line */}
          <div
            className="absolute w-full border-t border-dashed border-white/60 pointer-events-none"
            style={{ bottom: `${initialPercentage}%` }}
            title={`Niveau initial: ${initialVolumeM3.toFixed(2)} m³`}
          />

          {/* Tick marks */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 pointer-events-none opacity-30">
            <div className="border-b border-white w-full"></div>
            <div className="border-b border-white w-full"></div>
            <div className="border-b border-white w-full"></div>
            <div className="border-b border-white w-full"></div>
          </div>
        </div>

        {/* Dynamic Context & Advice */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Niveau initial:</span>
              <span className="text-slate-200">{initialVolumeM3.toFixed(3)} m³</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sens d'écoulement:</span>
              <span className="text-amber-400 font-medium flex items-center gap-1">
                {isPOOH ? (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    <span>TT ➔ Puits (Baisse)</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Puits ➔ TT (Montée)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Status warning pill */}
          {isLow && (
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Niveau bas (&lt;20%) ! Remplir le Trip Tank.</span>
            </div>
          )}
          {isHigh && (
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Niveau haut (&gt;85%) ! Vidanger le Trip Tank.</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Event Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onQuickRemplissage}
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium transition"
          title="Ajouter un événement de remplissage du Trip Tank"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Remplissage TT</span>
        </button>

        <button
          onClick={onQuickVidange}
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition"
          title="Ajouter un événement de vidange du Trip Tank"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Vidange TT</span>
        </button>
      </div>
    </div>
  );
};
