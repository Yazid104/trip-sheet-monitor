import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Flame, 
  Fuel, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { TripRow, TripMode, EventType, Tubular, AlarmSeverity } from '../types/trip';

interface TripTableProps {
  rows: TripRow[];
  activeMode: TripMode;
  activeTubular: Tubular;
  tubulars: Tubular[];
  standLength: number;
  currentTTLevel: number;
  onModeChange: (mode: TripMode) => void;
  onTubularChange: (tubular: Tubular) => void;
  onAddStep: (standsCount: number, eventType?: EventType, customTTReading?: number, remarks?: string) => void;
  onUpdateRowTT: (rowId: string, newTTValue: number) => void;
  onUpdateRowRemark: (rowId: string, remark: string) => void;
  onDeleteRow: (rowId: string) => void;
  onQuickVidange: () => void;
  onQuickRemplissage: () => void;
}

export const TripTable: React.FC<TripTableProps> = ({
  rows,
  activeMode,
  activeTubular,
  tubulars,
  standLength,
  currentTTLevel,
  onModeChange,
  onTubularChange,
  onAddStep,
  onUpdateRowTT,
  onUpdateRowRemark,
  onDeleteRow,
  onQuickVidange,
  onQuickRemplissage
}) => {
  const [quickStands, setQuickStands] = useState<number>(5);
  const [customTTInput, setCustomTTInput] = useState<string>('');

  const handleQuickAdd = () => {
    const parsedTT = customTTInput.trim() !== '' ? parseFloat(customTTInput) : undefined;
    onAddStep(quickStands, 'NONE', parsedTT);
    setCustomTTInput('');
  };

  const getStatusIcon = (status: AlarmSeverity) => {
    switch (status) {
      case 'KICK_ALERT':
        return <span title="Kick / Influx détecté !"><Flame className="w-4 h-4 text-rose-500 animate-pulse" /></span>;
      case 'LOSS_ALERT':
        return <span title="Perte de boue détectée !"><AlertCircle className="w-4 h-4 text-amber-500" /></span>;
      case 'WARNING':
        return <span title="Écart anormal"><AlertCircle className="w-4 h-4 text-yellow-500" /></span>;
      default:
        return <span title="Normal"><CheckCircle className="w-4 h-4 text-emerald-500" /></span>;
    }
  };

  const getModeBadge = (mode: TripMode) => {
    switch (mode) {
      case 'POOH_DRY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800">POOH Sec (Dry)</span>;
      case 'POOH_WET':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">POOH Plein (Wet)</span>;
      case 'RIH_DRY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">RIH Libre (Dry)</span>;
      case 'RIH_WET':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">RIH Bouché (Wet)</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      
      {/* Top Action Bar: Mode Selector & Quick Entry */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 space-y-4">
        
        {/* Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mode de Manœuvre:</span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => onModeChange('POOH_DRY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeMode === 'POOH_DRY'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                POOH Dry (Tirage Sec)
              </button>
              <button
                onClick={() => onModeChange('POOH_WET')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeMode === 'POOH_WET'
                    ? 'bg-indigo-500 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                POOH Wet (Tirage Plein)
              </button>
              <button
                onClick={() => onModeChange('RIH_DRY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeMode === 'RIH_DRY'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RIH Dry (Descente Libre)
              </button>
              <button
                onClick={() => onModeChange('RIH_WET')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeMode === 'RIH_WET'
                    ? 'bg-purple-500 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RIH Wet (Descente Bouchée)
              </button>
            </div>
          </div>

          {/* Active Tubular Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Tube en cours:</span>
            <select
              value={activeTubular.id}
              onChange={(e) => {
                const found = tubulars.find(t => t.id === e.target.value);
                if (found) onTubularChange(found);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500 max-w-xs"
            >
              {tubulars.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} (V_acier: {t.vAcierLPerM} L/m)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Add Form Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Longueurs (Stands) :</span>
              <div className="flex items-center gap-1">
                {[1, 3, 5, 10].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setQuickStands(cnt)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition ${
                      quickStands === cnt
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    +{cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Niveau lu Trip Tank (m³) :</span>
              <input
                type="number"
                step="0.01"
                placeholder={`Auto (~${currentTTLevel.toFixed(2)})`}
                value={customTTInput}
                onChange={(e) => setCustomTTInput(e.target.value)}
                className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-white text-center focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer +{quickStands} Longueurs</span>
            </button>
          </div>
        </div>

      </div>

      {/* Sheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 divide-x divide-slate-800/60">
              <th className="py-3 px-2 text-center w-10">#</th>
              <th className="py-3 px-3 text-center">N° Std</th>
              <th className="py-3 px-3 text-right">Prof (m)</th>
              <th className="py-3 px-3">Tube / Équipement</th>
              <th className="py-3 px-3 text-center">Mode</th>
              <th className="py-3 px-3 text-right text-sky-400">V. Théo Step (m³)</th>
              <th className="py-3 px-3 text-right text-sky-400">V. Théo Cum (m³)</th>
              <th className="py-3 px-3 text-right text-amber-400 bg-amber-500/5 font-bold">TT Lu (m³)</th>
              <th className="py-3 px-3 text-right text-amber-400">V. Réel Dépl. (m³)</th>
              <th className="py-3 px-3 text-right">Écart Step (m³)</th>
              <th className="py-3 px-3 text-right font-bold">Écart Cumul (m³)</th>
              <th className="py-3 px-2 text-center">Statut</th>
              <th className="py-3 px-3">Remarques / Événements</th>
              <th className="py-3 px-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-8 text-center text-slate-500 font-mono text-xs">
                  Aucune longueur enregistrée. Cliquez sur "+5 Longueurs" ci-dessus pour démarrer le suivi du Trip Tank.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const isEvent = row.event === 'VIDANGE_TT' || row.event === 'REMPLISSAGE_TT' || row.event === 'FLOW_CHECK';
                const isKick = row.status === 'KICK_ALERT';
                const isLoss = row.status === 'LOSS_ALERT';
                const isWarn = row.status === 'WARNING';

                let rowBg = 'hover:bg-slate-800/40';
                if (isKick) rowBg = 'bg-rose-950/40 hover:bg-rose-950/60 text-rose-100';
                else if (isLoss) rowBg = 'bg-amber-950/30 hover:bg-amber-950/50';
                else if (isWarn) rowBg = 'bg-yellow-950/20 hover:bg-yellow-950/40';
                else if (isEvent) rowBg = 'bg-slate-950/90 font-medium';

                return (
                  <tr key={row.id} className={`transition divide-x divide-slate-800/40 ${rowBg}`}>
                    
                    {/* Index */}
                    <td className="py-2.5 px-2 text-center text-slate-500 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Stand count */}
                    <td className="py-2.5 px-3 text-center font-bold text-white">
                      {row.standNumber}
                      {row.standsInStep > 1 && (
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          (+{row.standsInStep})
                        </span>
                      )}
                    </td>

                    {/* Depth */}
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {row.depth.toFixed(1)}
                    </td>

                    {/* Tubular */}
                    <td className="py-2.5 px-3 truncate max-w-[160px]" title={row.tubularName}>
                      {row.tubularName}
                    </td>

                    {/* Mode */}
                    <td className="py-2.5 px-3 text-center">
                      {getModeBadge(row.mode)}
                    </td>

                    {/* V. Theo Step */}
                    <td className="py-2.5 px-3 text-right text-sky-300">
                      {row.vTheoriqueStepM3.toFixed(3)}
                    </td>

                    {/* V. Theo Cumul */}
                    <td className="py-2.5 px-3 text-right text-sky-400 font-semibold">
                      {row.vTheoriqueCumulM3.toFixed(3)}
                    </td>

                    {/* Trip Tank Reading (Editable input) */}
                    <td className="py-2.5 px-3 text-right bg-amber-500/5">
                      <input
                        type="number"
                        step="0.01"
                        value={row.tripTankReadingM3}
                        onChange={(e) => onUpdateRowTT(row.id, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-950 border border-amber-500/40 rounded px-2 py-1 text-xs font-mono font-bold text-amber-400 text-right focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    {/* V. Reel Deplace */}
                    <td className="py-2.5 px-3 text-right text-amber-300">
                      {row.tripTankDeltaM3.toFixed(3)}
                    </td>

                    {/* Ecart Step */}
                    <td className="py-2.5 px-3 text-right font-medium">
                      <span className={row.ecartStepM3 > 0.05 ? 'text-rose-400 font-bold' : row.ecartStepM3 < -0.05 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {row.ecartStepM3 >= 0 ? `+${row.ecartStepM3.toFixed(3)}` : row.ecartStepM3.toFixed(3)}
                      </span>
                    </td>

                    {/* Ecart Cumul */}
                    <td className="py-2.5 px-3 text-right font-bold text-sm">
                      <span className={
                        row.ecartCumulM3 >= 0.20 
                          ? 'text-rose-400' 
                          : row.ecartCumulM3 <= -0.20 
                            ? 'text-amber-400' 
                            : 'text-emerald-400'
                      }>
                        {row.ecartCumulM3 >= 0 ? `+${row.ecartCumulM3.toFixed(3)}` : row.ecartCumulM3.toFixed(3)}
                      </span>
                    </td>

                    {/* Status Icon */}
                    <td className="py-2.5 px-2 text-center">
                      {getStatusIcon(row.status)}
                    </td>

                    {/* Remarks / Event (Inline editable) */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {row.event !== 'NONE' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            {row.event}
                          </span>
                        )}
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) => onUpdateRowRemark(row.id, e.target.value)}
                          placeholder="Note..."
                          className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-slate-500 px-1 py-0.5 text-xs text-slate-300 w-full focus:outline-none"
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => onDeleteRow(row.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Bar */}
      {rows.length > 0 && (
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400">Total Longueurs: </span>
              <strong className="text-white">{rows[rows.length - 1].standNumber} stands</strong>
            </div>
            <div>
              <span className="text-slate-400">Vol. Théo Total: </span>
              <strong className="text-sky-400">{rows[rows.length - 1].vTheoriqueCumulM3.toFixed(3)} m³</strong>
            </div>
            <div>
              <span className="text-slate-400">Vol. Réel Trip Tank: </span>
              <strong className="text-amber-400">{rows[rows.length - 1].vReelCumulM3.toFixed(3)} m³</strong>
            </div>
          </div>

          <div>
            <span className="text-slate-400">Écart Net Cumulé: </span>
            <strong className={`text-base ${
              rows[rows.length - 1].ecartCumulM3 >= 0.20
                ? 'text-rose-400 font-bold'
                : rows[rows.length - 1].ecartCumulM3 <= -0.20
                  ? 'text-amber-400 font-bold'
                  : 'text-emerald-400 font-bold'
            }`}>
              {rows[rows.length - 1].ecartCumulM3 >= 0 ? `+${rows[rows.length - 1].ecartCumulM3.toFixed(3)}` : rows[rows.length - 1].ecartCumulM3.toFixed(3)} m³
              {' '}({(rows[rows.length - 1].ecartCumulM3 * 1000).toFixed(0)} L)
            </strong>
          </div>
        </div>
      )}

    </div>
  );
};
