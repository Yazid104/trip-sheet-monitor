import React from 'react';
import { TripHeader, TripRow, Tubular } from '../types/trip';

interface PrintSheetProps {
  header: TripHeader;
  rows: TripRow[];
  activeTubulars: Tubular[];
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  header,
  rows,
  activeTubulars
}) => {
  return (
    <div className="hidden print:block text-black bg-white p-6 font-sans text-xs">
      
      {/* Official Form Header */}
      <div className="border-2 border-black p-3 mb-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
          <div className="text-left">
            <h1 className="text-base font-bold uppercase tracking-wider">ENTREPRISE NATIONALE DES TRAVAUX AUX PUITS</h1>
            <p className="text-[11px] font-semibold text-slate-700">DIRECTION DU FORAGE — RIG {header.rigName || 'TP-228'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-extrabold border-2 border-black px-3 py-1">
              CONTRÔLE DES VOLUMES EN MANŒUVRES
            </h2>
            <p className="text-[10px] text-slate-600 mt-0.5">FEUILLE OFFICIELLE DE TRIP TANK</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-2 text-[11px]">
          <div><strong>PUITS :</strong> {header.wellName || 'TRNW12Z'}</div>
          <div><strong>APPAREIL :</strong> {header.rigName || 'TP-228'}</div>
          <div><strong>DATE :</strong> {header.date || new Date().toLocaleDateString('fr-FR')}</div>
          <div><strong>POSTE :</strong> {header.shift}</div>

          <div><strong>DENSITÉ BOUE :</strong> {header.mudDensity} SG</div>
          <div><strong>LONGUEUR STAND :</strong> {header.standLength} m</div>
          <div><strong>CAPACITÉ TRIP TANK :</strong> {header.tripTankCapacity} m³</div>
          <div><strong>VOL. INITIAL TT :</strong> {header.initialTripTankVolume} m³</div>
        </div>

        {header.operationNotes && (
          <div className="mt-2 pt-2 border-t border-black text-[11px]">
            <strong>OPÉRATION / DESCRIPTION :</strong> {header.operationNotes}
          </div>
        )}
      </div>

      {/* Tubulars Reference Summary Table */}
      <div className="mb-4">
        <h3 className="text-[11px] font-bold uppercase mb-1">Caractéristiques des éléments de garniture</h3>
        <table className="w-full border-collapse border border-black text-[10px] text-center">
          <thead>
            <tr className="bg-slate-100 border-b border-black">
              <th className="border border-black p-1">Composant</th>
              <th className="border border-black p-1">OD / ID (in)</th>
              <th className="border border-black p-1">V. Acier (L/m)</th>
              <th className="border border-black p-1">Capacité Int (L/m)</th>
              <th className="border border-black p-1">V. Ext (L/m)</th>
              <th className="border border-black p-1">Dry / Stand 28.5m</th>
              <th className="border border-black p-1">Wet / Stand 28.5m</th>
            </tr>
          </thead>
          <tbody>
            {activeTubulars.slice(0, 4).map((tub) => (
              <tr key={tub.id} className="border-b border-black">
                <td className="border border-black p-1 text-left font-semibold">{tub.name}</td>
                <td className="border border-black p-1">{tub.odInch}" / {tub.idInch}"</td>
                <td className="border border-black p-1">{tub.vAcierLPerM.toFixed(2)}</td>
                <td className="border border-black p-1">{tub.vIntLPerM.toFixed(2)}</td>
                <td className="border border-black p-1">{tub.vExtLPerM.toFixed(2)}</td>
                <td className="border border-black p-1 font-bold">{(tub.vAcierLPerM * header.standLength).toFixed(1)} L</td>
                <td className="border border-black p-1 font-bold">{(tub.vExtLPerM * header.standLength).toFixed(1)} L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Main Manœuvre Table */}
      <div className="mb-6">
        <h3 className="text-[11px] font-bold uppercase mb-1">Tableau de suivi des volumes de manœuvre</h3>
        <table className="w-full border-collapse border-2 border-black text-[10px] text-center">
          <thead>
            <tr className="bg-slate-200 border-b-2 border-black">
              <th className="border border-black p-1 w-8">N°</th>
              <th className="border border-black p-1">Stand</th>
              <th className="border border-black p-1">Prof (m)</th>
              <th className="border border-black p-1">Tube</th>
              <th className="border border-black p-1">Mode</th>
              <th className="border border-black p-1">V. Théo (m³)</th>
              <th className="border border-black p-1">V. Théo Cum (m³)</th>
              <th className="border border-black p-1 font-bold bg-slate-300">Niv. TT Lu (m³)</th>
              <th className="border border-black p-1">V. Réel (m³)</th>
              <th className="border border-black p-1">Écart (m³)</th>
              <th className="border border-black p-1 font-bold">Écart Cum (m³)</th>
              <th className="border border-black p-1">Remarques / Événements</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className="border-b border-black">
                <td className="border border-black p-1">{i + 1}</td>
                <td className="border border-black p-1 font-bold">{row.standNumber}</td>
                <td className="border border-black p-1">{row.depth.toFixed(1)}</td>
                <td className="border border-black p-1 text-left">{row.tubularName}</td>
                <td className="border border-black p-1">{row.mode.replace('_', ' ')}</td>
                <td className="border border-black p-1">{row.vTheoriqueStepM3.toFixed(3)}</td>
                <td className="border border-black p-1 font-semibold">{row.vTheoriqueCumulM3.toFixed(3)}</td>
                <td className="border border-black p-1 font-bold bg-slate-50">{row.tripTankReadingM3.toFixed(3)}</td>
                <td className="border border-black p-1">{row.tripTankDeltaM3.toFixed(3)}</td>
                <td className="border border-black p-1">{row.ecartStepM3 >= 0 ? `+${row.ecartStepM3.toFixed(3)}` : row.ecartStepM3.toFixed(3)}</td>
                <td className="border border-black p-1 font-bold">{row.ecartCumulM3 >= 0 ? `+${row.ecartCumulM3.toFixed(3)}` : row.ecartCumulM3.toFixed(3)}</td>
                <td className="border border-black p-1 text-left">
                  {row.event !== 'NONE' && <strong>[{row.event}] </strong>}
                  {row.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature & Well Control Signoff */}
      <div className="border-2 border-black p-4 mt-8 grid grid-cols-3 gap-6 text-center text-[11px]">
        <div>
          <p className="font-bold uppercase mb-12">Le Chef de Poste (Driller)</p>
          <p className="border-t border-black pt-1">{header.drillerName || 'Visa / Signature'}</p>
        </div>
        <div>
          <p className="font-bold uppercase mb-12">Le Superviseur Forage</p>
          <p className="border-t border-black pt-1">{header.drillingSupervisor || 'Visa / Signature'}</p>
        </div>
        <div>
          <p className="font-bold uppercase mb-12">Le Superviseur Client (Company Man)</p>
          <p className="border-t border-black pt-1">{header.companyMan || 'Visa / Signature'}</p>
        </div>
      </div>

    </div>
  );
};
