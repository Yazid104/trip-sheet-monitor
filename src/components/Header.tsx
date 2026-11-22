import React from 'react';
import { 
  Compass, 
  Printer, 
  Download, 
  RotateCcw, 
  Layers, 
  Database, 
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { TripHeader, AlarmSeverity } from '../types/trip';

interface HeaderProps {
  header: TripHeader;
  overallStatus: AlarmSeverity;
  totalEcartCumulM3: number;
  currentTTReading: number;
  onOpenSetup: () => void;
  onOpenStringComposer: () => void;
  onOpenTubularCatalog: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  header,
  overallStatus,
  totalEcartCumulM3,
  currentTTReading,
  onOpenSetup,
  onOpenStringComposer,
  onOpenTubularCatalog,
  onPrint,
  onExportCSV,
  onReset
}) => {
  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'KICK_ALERT':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse font-semibold text-xs sm:text-sm">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>ALERTE KICK / INFLUX ({totalEcartCumulM3 > 0 ? `+${totalEcartCumulM3.toFixed(3)}` : totalEcartCumulM3.toFixed(3)} m³)</span>
          </div>
        );
      case 'LOSS_ALERT':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>PERTE DE BOUE ({totalEcartCumulM3.toFixed(3)} m³)</span>
          </div>
        );
      case 'WARNING':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 font-semibold text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span>ÉCART SIGNIFICATIF ({totalEcartCumulM3 > 0 ? `+${totalEcartCumulM3.toFixed(3)}` : totalEcartCumulM3.toFixed(3)} m³)</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PUITS STABLE (Écart: {totalEcartCumulM3 >= 0 ? `+${totalEcartCumulM3.toFixed(3)}` : totalEcartCumulM3.toFixed(3)} m³)</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Rig Info */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>TRIP SHEET MONITOR</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30 font-mono">
                    {header.rigName || 'RIG TP-228'}
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                <span>Puits: <strong className="text-slate-200">{header.wellName || 'TRNW12Z'}</strong></span>
                <span>•</span>
                <span>Densité: <strong className="text-slate-200">{header.mudDensity} SG</strong></span>
                <span>•</span>
                <span>Poste: <strong className="text-slate-200">{header.shift}</strong></span>
              </p>
            </div>
          </div>

          {/* Center Status Banner */}
          <div className="flex items-center justify-between sm:justify-center gap-3">
            {getStatusBadge()}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono">
              <span className="text-slate-400">TT Lu:</span>
              <span className="text-amber-400 font-bold text-sm">{currentTTReading.toFixed(3)} m³</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenSetup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition"
              title="Paramètres du puits et de la manœuvre"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Paramètres</span>
            </button>

            <button
              onClick={onOpenStringComposer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition"
              title="Composer la garniture de forage (BHA / Drill string)"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Garniture</span>
            </button>

            <button
              onClick={onOpenTubularCatalog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition"
              title="Base de données des tubes (DP, HWDP, DC, Tubing)"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Catalogue</span>
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow transition"
              title="Imprimer la feuille de manœuvre officielle (PDF)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
              title="Exporter les données en CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">CSV</span>
            </button>

            <button
              onClick={onReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs transition"
              title="Nouvelle manœuvre / Réinitialiser"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
