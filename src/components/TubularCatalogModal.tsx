import React, { useState } from 'react';
import { X, Database, Plus, Check } from 'lucide-react';
import { Tubular } from '../types/trip';

interface TubularCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  tubulars: Tubular[];
  onAddTubular: (tubular: Tubular) => void;
}

export const TubularCatalogModal: React.FC<TubularCatalogModalProps> = ({
  isOpen,
  onClose,
  tubulars,
  onAddTubular
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // New tubular form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'DP' | 'HWDP' | 'DC' | 'TUBING' | 'CASING'>('DP');
  const [newOd, setNewOd] = useState(3.5);
  const [newId, setNewId] = useState(2.764);
  const [newWeight, setNewWeight] = useState(13.3);
  const [newVAcier, setNewVAcier] = useState(2.80);
  const [newVInt, setNewVInt] = useState(3.87);
  const [newConnection, setNewConnection] = useState('NC38');

  if (!isOpen) return null;

  const filtered = filterCategory === 'ALL'
    ? tubulars
    : tubulars.filter(t => t.category === filterCategory);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const vExt = Number((newVAcier + newVInt).toFixed(2));
    const created: Tubular = {
      id: `tub-${Date.now()}`,
      name: newName,
      category: newCategory,
      odInch: newOd,
      idInch: newId,
      weightLbsFt: newWeight,
      connection: newConnection,
      vAcierLPerM: newVAcier,
      vIntLPerM: newVInt,
      vExtLPerM: vExt,
      vAcierPerStand: Number((newVAcier * 28.5).toFixed(1)),
      vExtPerStand: Number((vExt * 28.5).toFixed(1)),
      notes: 'Ajout personnalisé'
    };
    onAddTubular(created);
    setShowAddForm(false);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Catalogue & Spécifications des Garnitures</h3>
              <p className="text-xs text-slate-400 font-mono">Données extraites des feuilles TP-228 (Volumes puits & Drilling Data)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap items-center justify-between gap-2 my-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['ALL', 'DP', 'HWDP', 'DC', 'TUBING', 'CASING'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
                  filterCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'Tous les tubes' : cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Fermer le formulaire' : 'Ajouter un composant'}</span>
          </button>
        </div>

        {/* Add custom tubular form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-4 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Nouveau composant tubulaire</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Désignation</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  placeholder="Ex: DP 3½' X-95"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Catégorie</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="DP">DP (Drill Pipe)</option>
                  <option value="HWDP">HWDP (Heavy Weight)</option>
                  <option value="DC">DC (Drill Collar)</option>
                  <option value="TUBING">Tubing</option>
                  <option value="CASING">Casing / Liner</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">V. Acier (L/m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVAcier}
                  onChange={(e) => setNewVAcier(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">V. Interne (L/m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVInt}
                  onChange={(e) => setNewVInt(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Enregistrer dans le catalogue</span>
              </button>
            </div>
          </form>
        )}

        {/* Table of tubulars */}
        <div className="max-h-96 overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3">OD / ID</th>
                <th className="py-2.5 px-3 text-right">V. Acier (L/m)</th>
                <th className="py-2.5 px-3 text-right">V. Int (L/m)</th>
                <th className="py-2.5 px-3 text-right">V. Ext (L/m)</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Dry / Stand (28.5m)</th>
                <th className="py-2.5 px-3 text-right text-sky-400">Wet / Stand (28.5m)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((tub) => {
                const dryStandL = (tub.vAcierLPerM * 28.5).toFixed(1);
                const wetStandL = (tub.vExtLPerM * 28.5).toFixed(1);
                const dryStandM3 = ((tub.vAcierLPerM * 28.5) / 1000).toFixed(3);
                const wetStandM3 = ((tub.vExtLPerM * 28.5) / 1000).toFixed(3);

                return (
                  <tr key={tub.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-400 border border-slate-700">
                        {tub.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {tub.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {tub.odInch}" / {tub.idInch}"
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-300">
                      {tub.vAcierLPerM.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {tub.vIntLPerM.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-sky-300">
                      {tub.vExtLPerM.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      {dryStandL} L <span className="text-[10px] font-normal text-slate-400">({dryStandM3} m³)</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-sky-400 font-bold">
                      {wetStandL} L <span className="text-[10px] font-normal text-slate-400">({wetStandM3} m³)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
