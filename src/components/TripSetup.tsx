import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { TripHeader } from '../types/trip';

interface TripSetupProps {
  isOpen: boolean;
  onClose: () => void;
  header: TripHeader;
  onSave: (updated: TripHeader) => void;
}

export const TripSetup: React.FC<TripSetupProps> = ({
  isOpen,
  onClose,
  header,
  onSave
}) => {
  const [formData, setFormData] = useState<TripHeader>({ ...header });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Paramètres de la Manœuvre & du Puits</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          
          {/* Well & Rig info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nom du Puits</label>
              <input
                type="text"
                value={formData.wellName}
                onChange={(e) => setFormData({ ...formData, wellName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="Ex: TRNW12Z"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Appareil de forage (Rig)</label>
              <input
                type="text"
                value={formData.rigName}
                onChange={(e) => setFormData({ ...formData, rigName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="Ex: RIG TP-228"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Poste (Shift)</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as 'JOUR' | 'NUIT' })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="JOUR">Jour (06h - 18h)</option>
                <option value="NUIT">Nuit (18h - 06h)</option>
              </select>
            </div>
          </div>

          {/* Mud & Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Densité de boue (SG)</label>
              <input
                type="number"
                step="0.01"
                min="0.8"
                max="2.6"
                value={formData.mudDensity}
                onChange={(e) => setFormData({ ...formData, mudDensity: parseFloat(e.target.value) || 1.15 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="1.15"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Longueur stand standard (m)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="35"
                value={formData.standLength}
                onChange={(e) => setFormData({ ...formData, standLength: parseFloat(e.target.value) || 28.5 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="28.5"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Capacité Trip Tank (m³)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="20"
                value={formData.tripTankCapacity}
                onChange={(e) => setFormData({ ...formData, tripTankCapacity: parseFloat(e.target.value) || 5.0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="5.0"
                required
              />
            </div>
          </div>

          {/* Trip Tank initial & Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Volume initial Trip Tank (m³)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="20"
                value={formData.initialTripTankVolume}
                onChange={(e) => setFormData({ ...formData, initialTripTankVolume: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="3.50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seuil Avertissement (m³)</label>
              <input
                type="number"
                step="0.05"
                min="0.05"
                max="2"
                value={formData.warningThresholdM3}
                onChange={(e) => setFormData({ ...formData, warningThresholdM3: parseFloat(e.target.value) || 0.20 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-yellow-400 focus:outline-none focus:border-amber-500"
                placeholder="0.20"
                required
              />
              <span className="text-[10px] text-slate-500 font-mono">Soit {(formData.warningThresholdM3 * 1000).toFixed(0)} L</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seuil Critique Kick (m³)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="5"
                value={formData.criticalThresholdM3}
                onChange={(e) => setFormData({ ...formData, criticalThresholdM3: parseFloat(e.target.value) || 0.40 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-rose-400 focus:outline-none focus:border-amber-500"
                placeholder="0.40"
                required
              />
              <span className="text-[10px] text-slate-500 font-mono">Soit {(formData.criticalThresholdM3 * 1000).toFixed(0)} L</span>
            </div>
          </div>

          {/* Personnel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Chef de Poste (Driller)</label>
              <input
                type="text"
                value={formData.drillerName}
                onChange={(e) => setFormData({ ...formData, drillerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Nom du Chef de poste"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Superviseur Forage</label>
              <input
                type="text"
                value={formData.drillingSupervisor}
                onChange={(e) => setFormData({ ...formData, drillingSupervisor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Nom du Superviseur Forage"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Superviseur Client (Company Man)</label>
              <input
                type="text"
                value={formData.companyMan}
                onChange={(e) => setFormData({ ...formData, companyMan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Nom du Company Man"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Description de l'Opération</label>
            <textarea
              rows={2}
              value={formData.operationNotes}
              onChange={(e) => setFormData({ ...formData, operationNotes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="Ex: POOH pour changer l'outil de forage à 2450m..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les paramètres</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
