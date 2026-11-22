import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, Check, ArrowDown, ArrowUp } from 'lucide-react';
import { StringSection, Tubular } from '../types/trip';

interface StringComposerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: StringSection[];
  tubulars: Tubular[];
  standLength: number;
  onSave: (sections: StringSection[]) => void;
}

export const StringComposer: React.FC<StringComposerProps> = ({
  isOpen,
  onClose,
  sections,
  tubulars,
  standLength,
  onSave
}) => {
  const [localSections, setLocalSections] = useState<StringSection[]>([...sections]);

  if (!isOpen) return null;

  const handleAddSection = () => {
    const defaultTub = tubulars.find(t => t.id === 'dp-3.5-s135') || tubulars[0];
    const newSection: StringSection = {
      id: `sec-${Date.now()}`,
      tubularId: defaultTub.id,
      tubularName: defaultTub.name,
      numStands: 10,
      lengthMeters: 10 * standLength,
      vAcierLPerM: defaultTub.vAcierLPerM,
      vExtLPerM: defaultTub.vExtLPerM,
      vIntLPerM: defaultTub.vIntLPerM
    };
    setLocalSections([...localSections, newSection]);
  };

  const handleRemove = (id: string) => {
    setLocalSections(localSections.filter(s => s.id !== id));
  };

  const handleTubularChange = (sectionId: string, tubId: string) => {
    const tub = tubulars.find(t => t.id === tubId);
    if (!tub) return;
    setLocalSections(localSections.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        tubularId: tub.id,
        tubularName: tub.name,
        vAcierLPerM: tub.vAcierLPerM,
        vExtLPerM: tub.vExtLPerM,
        vIntLPerM: tub.vIntLPerM
      };
    }));
  };

  const handleStandsChange = (sectionId: string, stands: number) => {
    const sCount = Math.max(stands, 1);
    setLocalSections(localSections.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        numStands: sCount,
        lengthMeters: Number((sCount * standLength).toFixed(2))
      };
    }));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...localSections];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setLocalSections(next);
  };

  const moveDown = (index: number) => {
    if (index === localSections.length - 1) return;
    const next = [...localSections];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setLocalSections(next);
  };

  const totalLengthM = localSections.reduce((acc, s) => acc + s.lengthMeters, 0);
  const totalStands = localSections.reduce((acc, s) => acc + s.numStands, 0);
  const totalSteelM3 = localSections.reduce((acc, s) => acc + (s.lengthMeters * s.vAcierLPerM) / 1000, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-white">Composition de la Garniture (Drill String / BHA)</h3>
              <p className="text-xs text-slate-400">Ordre de la surface vers le fond du puits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary */}
        <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
          <div>
            <div className="text-xs text-slate-400">Total Longueurs (Stands)</div>
            <div className="text-lg font-bold text-white">{totalStands}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Longueur Totale (m)</div>
            <div className="text-lg font-bold text-sky-400">{totalLengthM.toFixed(1)} m</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Volume Acier Total (m³)</div>
            <div className="text-lg font-bold text-amber-400">{totalSteelM3.toFixed(3)} m³</div>
          </div>
        </div>

        {/* Section List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {localSections.map((sec, idx) => (
            <div
              key={sec.id}
              className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition"
            >
              <div className="flex items-center gap-1 font-mono text-xs text-slate-400 w-12 shrink-0">
                <span>#{idx + 1}</span>
                <div className="flex flex-col">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="hover:text-white disabled:opacity-30">
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveDown(idx)} disabled={idx === localSections.length - 1} className="hover:text-white disabled:opacity-30">
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Tubular selector */}
              <div className="flex-1 w-full sm:w-auto">
                <select
                  value={sec.tubularId}
                  onChange={(e) => handleTubularChange(sec.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {tubulars.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.name} (V_acier: {t.vAcierLPerM} L/m)
                    </option>
                  ))}
                </select>
              </div>

              {/* Stands input */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={sec.numStands}
                    onChange={(e) => handleStandsChange(sec.id, parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-xs text-slate-400">std</span>
                </div>

                <div className="text-xs font-mono text-slate-300 w-20 text-right">
                  {sec.lengthMeters.toFixed(1)} m
                </div>

                <button
                  onClick={() => handleRemove(sec.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Supprimer la section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Add section button */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleAddSection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-medium transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une section</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onSave(localSections);
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>Appliquer la garniture</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
