import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  CartesianGrid 
} from 'recharts';
import { TripRow } from '../types/trip';

interface TripChartProps {
  rows: TripRow[];
  warningThresholdM3: number;
  criticalThresholdM3: number;
}

export const TripChart: React.FC<TripChartProps> = ({
  rows,
  warningThresholdM3,
  criticalThresholdM3
}) => {
  if (rows.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 font-mono text-xs">
        Aucune donnée enregistrée. Ajoutez des longueurs pour générer le graphique de manœuvre.
      </div>
    );
  }

  const chartData = rows.map((r) => ({
    stand: `Std ${r.standNumber}`,
    depth: r.depth,
    vTheoCumul: r.vTheoriqueCumulM3,
    vReelCumul: r.vReelCumulM3,
    ecartCumul: r.ecartCumulM3,
    ecartStep: r.ecartStepM3,
    event: r.event !== 'NONE' ? r.event : undefined
  }));

  return (
    <div className="space-y-4">
      {/* Chart 1: Volumes Cumulés (Théorique vs Réel) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Graphique des Volumes Déplacés</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Théorique vs Réel (m³)
              </span>
            </h3>
            <p className="text-xs text-slate-400">Comparaison du volume théorique d'acier/capacité et du volume réel au Trip Tank</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="stand" stroke="#94a3b8" fontSize={11} fontStyle="JetBrains Mono" />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" m³" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line 
                type="monotone" 
                dataKey="vTheoCumul" 
                name="Vol. Théorique Cumulé (m³)" 
                stroke="#38bdf8" 
                strokeWidth={2.5} 
                dot={{ r: 3 }} 
              />
              <Line 
                type="monotone" 
                dataKey="vReelCumul" 
                name="Vol. Réel Trip Tank (m³)" 
                stroke="#fbbf24" 
                strokeWidth={2.5} 
                dot={{ r: 3 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Écart Cumulé & Seuils d'alerte Kick / Perte */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Écart Cumulé & Surveillance Well Control</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-400">
                Gain (Kick) / Perte (Loss)
              </span>
            </h3>
            <p className="text-xs text-slate-400">Seuils d'alerte : ±{warningThresholdM3} m³ (Avertissement) et ±{criticalThresholdM3} m³ (Critique)</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="stand" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" m³" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {/* Threshold Lines */}
              <ReferenceLine y={criticalThresholdM3} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'KICK CRITIQUE', fill: '#f43f5e', fontSize: 10 }} />
              <ReferenceLine y={warningThresholdM3} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'AVERTISSEMENT', fill: '#eab308', fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#64748b" />
              <ReferenceLine y={-warningThresholdM3} stroke="#eab308" strokeDasharray="3 3" />
              <ReferenceLine y={-criticalThresholdM3} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'PERTE CRITIQUE', fill: '#f97316', fontSize: 10 }} />

              <Bar 
                dataKey="ecartStep" 
                name="Écart par étape (m³)" 
                fill="#64748b" 
                opacity={0.6} 
              />
              <Line 
                type="monotone" 
                dataKey="ecartCumul" 
                name="Écart Cumulé (m³)" 
                stroke="#a855f7" 
                strokeWidth={3} 
                dot={{ r: 4 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
