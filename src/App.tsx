import React, { useState, useEffect } from 'react';
import { 
  TripHeader, 
  TripRow, 
  Tubular, 
  StringSection, 
  TripMode, 
  EventType, 
  AlarmSeverity 
} from './types/trip';
import { INITIAL_TUBULARS } from './data/tubularDatabase';
import { 
  getDisplacementLPerM, 
  calculateStepTheoreticalVolume, 
  recalculateAllRows, 
  evaluateAlarm 
} from './utils/calculations';
import { Header } from './components/Header';
import { WellControlBanner } from './components/WellControlBanner';
import { TripTankGauge } from './components/TripTankGauge';
import { TripTable } from './components/TripTable';
import { TripChart } from './components/TripChart';
import { TripSetup } from './components/TripSetup';
import { StringComposer } from './components/StringComposer';
import { TubularCatalogModal } from './components/TubularCatalogModal';
import { PrintSheet } from './components/PrintSheet';

export default function App() {
  // --- Tubulars Catalog ---
  const [tubulars, setTubulars] = useState<Tubular[]>(INITIAL_TUBULARS);

  // --- Trip Header Configuration ---
  const [header, setHeader] = useState<TripHeader>({
    wellName: 'TRNW12Z',
    rigName: 'RIG TP-228',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    shift: 'JOUR',
    drillerName: 'M. Benali',
    companyMan: 'K. Amrani',
    drillingSupervisor: 'S. Belkacem',
    mudDensity: 1.15,
    standLength: 28.5,
    tripTankCapacity: 5.0,
    initialTripTankVolume: 3.50,
    warningThresholdM3: 0.20,
    criticalThresholdM3: 0.40,
    currentDepth: 2450.0,
    finalDepth: 0.0,
    operationNotes: 'POOH pour changement outil de forage 6" (TRNW12Z)'
  });

  // --- String Composition ---
  const [stringSections, setStringSections] = useState<StringSection[]>([
    {
      id: 'sec-1',
      tubularId: 'dp-3.5-s135',
      tubularName: 'DP 3½" S-135 13.30# NC38',
      numStands: 75,
      lengthMeters: 75 * 28.5,
      vAcierLPerM: 2.80,
      vExtLPerM: 6.67,
      vIntLPerM: 3.87
    },
    {
      id: 'sec-2',
      tubularId: 'hwdp-3.5',
      tubularName: 'HWDP 3½" 25.3# NC38',
      numStands: 6,
      lengthMeters: 6 * 28.5,
      vAcierLPerM: 7.60,
      vExtLPerM: 10.16,
      vIntLPerM: 2.56
    },
    {
      id: 'sec-3',
      tubularId: 'dc-4.75',
      tubularName: 'DC 4¾" (ID 2¼")',
      numStands: 6,
      lengthMeters: 6 * 28.5,
      vAcierLPerM: 8.80,
      vExtLPerM: 11.36,
      vIntLPerM: 2.56
    }
  ]);

  // Active operation mode and tubular
  const [activeMode, setActiveMode] = useState<TripMode>('POOH_DRY');
  const [activeTubular, setActiveTubular] = useState<Tubular>(
    INITIAL_TUBULARS.find(t => t.id === 'dp-3.5-s135') || INITIAL_TUBULARS[0]
  );

  // --- Trip Rows State ---
  // Seed with realistic field data matching the user's paper sheet for POOH DP 3½" (0.40 m³ per 5 stands)
  const [rows, setRows] = useState<TripRow[]>(() => {
    const r1: TripRow = {
      id: 'row-1',
      timestamp: '14:35',
      standNumber: 5,
      standsInStep: 5,
      depth: 2450 - (5 * 28.5),
      tubularName: 'DP 3½" S-135 13.30# NC38',
      mode: 'POOH_DRY',
      vTheoriqueStepM3: 0.399, // 5 * 28.5 * 2.80 / 1000 = 0.399 m³
      vTheoriqueCumulM3: 0.399,
      tripTankReadingM3: 3.10, // Drop from 3.50 to 3.10 => Delta = 0.40 m³
      tripTankDeltaM3: 0.40,
      vReelCumulM3: 0.40,
      ecartStepM3: -0.001,
      ecartCumulM3: -0.001,
      status: 'NORMAL',
      event: 'NONE',
      remarks: 'Début POOH à sec - Puits stable'
    };
    const r2: TripRow = {
      id: 'row-2',
      timestamp: '14:50',
      standNumber: 10,
      standsInStep: 5,
      depth: 2450 - (10 * 28.5),
      tubularName: 'DP 3½" S-135 13.30# NC38',
      mode: 'POOH_DRY',
      vTheoriqueStepM3: 0.399,
      vTheoriqueCumulM3: 0.798,
      tripTankReadingM3: 2.70, // Drop from 3.10 to 2.70 => Delta = 0.40 m³
      tripTankDeltaM3: 0.40,
      vReelCumulM3: 0.80,
      ecartStepM3: -0.001,
      ecartCumulM3: -0.002,
      status: 'NORMAL',
      event: 'NONE',
      remarks: 'Normal'
    };
    const r3: TripRow = {
      id: 'row-3',
      timestamp: '15:05',
      standNumber: 15,
      standsInStep: 5,
      depth: 2450 - (15 * 28.5),
      tubularName: 'DP 3½" S-135 13.30# NC38',
      mode: 'POOH_DRY',
      vTheoriqueStepM3: 0.399,
      vTheoriqueCumulM3: 1.197,
      tripTankReadingM3: 2.31,
      tripTankDeltaM3: 0.39,
      vReelCumulM3: 1.19,
      ecartStepM3: 0.009,
      ecartCumulM3: 0.007,
      status: 'NORMAL',
      event: 'NONE',
      remarks: 'Normal'
    };
    return [r1, r2, r3];
  });

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isStringComposerOpen, setIsStringComposerOpen] = useState(false);
  const [isTubularCatalogOpen, setIsTubularCatalogOpen] = useState(false);

  // Recalculate whenever thresholds or initial TT change
  const recompute = (newRows: TripRow[]) => {
    return recalculateAllRows(
      newRows,
      header.initialTripTankVolume,
      header.warningThresholdM3,
      header.criticalThresholdM3
    );
  };

  // Current Trip Tank Reading (from last row, or initial)
  const currentTTReading = rows.length > 0 
    ? rows[rows.length - 1].tripTankReadingM3 
    : header.initialTripTankVolume;

  const totalEcartCumulM3 = rows.length > 0 
    ? rows[rows.length - 1].ecartCumulM3 
    : 0;

  const overallStatus = rows.length > 0 
    ? rows[rows.length - 1].status 
    : 'NORMAL';

  // --- Add Step Handler ---
  const handleAddStep = (
    standsCount: number,
    eventType: EventType = 'NONE',
    customTTReading?: number,
    remarks: string = ''
  ) => {
    const prevRow = rows.length > 0 ? rows[rows.length - 1] : null;
    const prevStands = prevRow ? prevRow.standNumber : 0;
    const prevDepth = prevRow ? prevRow.depth : header.currentDepth;
    const prevTT = prevRow ? prevRow.tripTankReadingM3 : header.initialTripTankVolume;

    const unitLPerM = getDisplacementLPerM(activeTubular, activeMode);
    const { volumeM3: theoStepM3 } = calculateStepTheoreticalVolume(
      unitLPerM,
      standsCount,
      header.standLength
    );

    const isPOOH = activeMode.startsWith('POOH');
    const newStands = prevStands + standsCount;
    const stepDepthM = standsCount * header.standLength;
    const newDepth = isPOOH 
      ? Math.max(prevDepth - stepDepthM, 0)
      : prevDepth + stepDepthM;

    // Estimate expected TT reading if not entered manually
    let targetTT = customTTReading;
    if (targetTT === undefined || isNaN(targetTT)) {
      if (isPOOH) {
        targetTT = Number(Math.max(prevTT - theoStepM3, 0).toFixed(3));
      } else {
        targetTT = Number(Math.min(prevTT + theoStepM3, header.tripTankCapacity).toFixed(3));
      }
    }

    const newRow: TripRow = {
      id: `row-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      standNumber: newStands,
      standsInStep: standsCount,
      depth: Number(newDepth.toFixed(1)),
      tubularName: activeTubular.name,
      mode: activeMode,
      vTheoriqueStepM3: theoStepM3,
      vTheoriqueCumulM3: 0,
      tripTankReadingM3: targetTT,
      tripTankDeltaM3: 0,
      vReelCumulM3: 0,
      ecartStepM3: 0,
      ecartCumulM3: 0,
      status: 'NORMAL',
      event: eventType,
      remarks: remarks || (eventType !== 'NONE' ? eventType : 'Normal')
    };

    const updated = recompute([...rows, newRow]);
    setRows(updated);
  };

  // --- Inline Edit TT Reading ---
  const handleUpdateRowTT = (rowId: string, newTTValue: number) => {
    const updated = rows.map(r => r.id === rowId ? { ...r, tripTankReadingM3: newTTValue } : r);
    setRows(recompute(updated));
  };

  // --- Inline Edit Remark ---
  const handleUpdateRowRemark = (rowId: string, remark: string) => {
    setRows(rows.map(r => r.id === rowId ? { ...r, remarks: remark } : r));
  };

  // --- Delete Row ---
  const handleDeleteRow = (rowId: string) => {
    const remaining = rows.filter(r => r.id !== rowId);
    setRows(recompute(remaining));
  };

  // --- Quick Tank Events ---
  const handleQuickVidange = () => {
    const newLevel = 1.20; // typical drained level in m³
    const prevRow = rows.length > 0 ? rows[rows.length - 1] : null;
    const prevStands = prevRow ? prevRow.standNumber : 0;
    const prevDepth = prevRow ? prevRow.depth : header.currentDepth;

    const eventRow: TripRow = {
      id: `event-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      standNumber: prevStands,
      standsInStep: 0,
      depth: prevDepth,
      tubularName: activeTubular.name,
      mode: activeMode,
      vTheoriqueStepM3: 0,
      vTheoriqueCumulM3: 0,
      tripTankReadingM3: newLevel,
      tripTankDeltaM3: 0,
      vReelCumulM3: 0,
      ecartStepM3: 0,
      ecartCumulM3: 0,
      status: 'NORMAL',
      event: 'VIDANGE_TT',
      remarks: `Vidange TT vers bac actif (Nouveau niveau: ${newLevel} m³)`
    };

    setRows(recompute([...rows, eventRow]));
  };

  const handleQuickRemplissage = () => {
    const newLevel = 4.20; // typical refilled level in m³
    const prevRow = rows.length > 0 ? rows[rows.length - 1] : null;
    const prevStands = prevRow ? prevRow.standNumber : 0;
    const prevDepth = prevRow ? prevRow.depth : header.currentDepth;

    const eventRow: TripRow = {
      id: `event-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      standNumber: prevStands,
      standsInStep: 0,
      depth: prevDepth,
      tubularName: activeTubular.name,
      mode: activeMode,
      vTheoriqueStepM3: 0,
      vTheoriqueCumulM3: 0,
      tripTankReadingM3: newLevel,
      tripTankDeltaM3: 0,
      vReelCumulM3: 0,
      ecartStepM3: 0,
      ecartCumulM3: 0,
      status: 'NORMAL',
      event: 'REMPLISSAGE_TT',
      remarks: `Remplissage TT depuis bac actif (Nouveau niveau: ${newLevel} m³)`
    };

    setRows(recompute([...rows, eventRow]));
  };

  const handleLogFlowCheck = (result: string) => {
    const prevRow = rows.length > 0 ? rows[rows.length - 1] : null;
    const prevStands = prevRow ? prevRow.standNumber : 0;
    const prevDepth = prevRow ? prevRow.depth : header.currentDepth;
    const prevTT = prevRow ? prevRow.tripTankReadingM3 : header.initialTripTankVolume;

    const eventRow: TripRow = {
      id: `fc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      standNumber: prevStands,
      standsInStep: 0,
      depth: prevDepth,
      tubularName: activeTubular.name,
      mode: activeMode,
      vTheoriqueStepM3: 0,
      vTheoriqueCumulM3: 0,
      tripTankReadingM3: prevTT,
      tripTankDeltaM3: 0,
      vReelCumulM3: 0,
      ecartStepM3: 0,
      ecartCumulM3: 0,
      status: 'NORMAL',
      event: 'FLOW_CHECK',
      remarks: `FLOW CHECK 15 MIN : ${result}`
    };

    setRows(recompute([...rows, eventRow]));
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = [
      'N_Stand',
      'Stands_In_Step',
      'Depth_m',
      'Tubular',
      'Mode',
      'V_Theorique_Step_m3',
      'V_Theorique_Cumul_m3',
      'TT_Reading_m3',
      'V_Reel_Delta_m3',
      'Ecart_Step_m3',
      'Ecart_Cumul_m3',
      'Status',
      'Event',
      'Remarks',
      'Timestamp'
    ];

    const lines = rows.map(r => [
      r.standNumber,
      r.standsInStep,
      r.depth,
      `"${r.tubularName}"`,
      r.mode,
      r.vTheoriqueStepM3,
      r.vTheoriqueCumulM3,
      r.tripTankReadingM3,
      r.tripTankDeltaM3,
      r.ecartStepM3,
      r.ecartCumulM3,
      r.status,
      r.event,
      `"${r.remarks.replace(/"/g, '""')}"`,
      r.timestamp
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...lines].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TripSheet_${header.wellName || 'TRNW12Z'}_${header.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toutes les données de la manœuvre en cours ?')) {
      setRows([]);
    }
  };

  const isPOOH = activeMode.startsWith('POOH');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Interactive App Screen */}
      <div className="print:hidden flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <Header
          header={header}
          overallStatus={overallStatus}
          totalEcartCumulM3={totalEcartCumulM3}
          currentTTReading={currentTTReading}
          onOpenSetup={() => setIsSetupOpen(true)}
          onOpenStringComposer={() => setIsStringComposerOpen(true)}
          onOpenTubularCatalog={() => setIsTubularCatalogOpen(true)}
          onPrint={handlePrint}
          onExportCSV={handleExportCSV}
          onReset={handleReset}
        />

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
          
          {/* Well Control Warning / Kick Alert Banner */}
          <WellControlBanner
            status={overallStatus}
            totalEcartCumulM3={totalEcartCumulM3}
            warningThresholdM3={header.warningThresholdM3}
            criticalThresholdM3={header.criticalThresholdM3}
            onLogFlowCheck={handleLogFlowCheck}
          />

          {/* Top Info Grid: Trip Tank Gauge + Quick Rig Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Visual Tank Gauge */}
            <div className="lg:col-span-1">
              <TripTankGauge
                currentVolumeM3={currentTTReading}
                initialVolumeM3={header.initialTripTankVolume}
                capacityM3={header.tripTankCapacity}
                isPOOH={isPOOH}
                onQuickVidange={handleQuickVidange}
                onQuickRemplissage={handleQuickRemplissage}
              />
            </div>

            {/* Quick Summary Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-mono">Longueurs Manœuvrées</span>
                <div className="text-2xl font-bold font-mono text-white mt-2">
                  {rows.length > 0 ? rows[rows.length - 1].standNumber : 0} <span className="text-xs font-normal text-slate-400">stands</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Prof: {rows.length > 0 ? rows[rows.length - 1].depth : header.currentDepth} m
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-mono">Vol. Théorique Cumulé</span>
                <div className="text-2xl font-bold font-mono text-sky-400 mt-2">
                  {rows.length > 0 ? rows[rows.length - 1].vTheoriqueCumulM3.toFixed(3) : '0.000'} <span className="text-xs font-normal text-slate-400">m³</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {(rows.length > 0 ? rows[rows.length - 1].vTheoriqueCumulM3 * 1000 : 0).toFixed(0)} Litres
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-mono">Vol. Réel Déplacé</span>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                  {rows.length > 0 ? rows[rows.length - 1].vReelCumulM3.toFixed(3) : '0.000'} <span className="text-xs font-normal text-slate-400">m³</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {(rows.length > 0 ? rows[rows.length - 1].vReelCumulM3 * 1000 : 0).toFixed(0)} Litres
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-mono">Écart Cumulé Net</span>
                <div className={`text-2xl font-bold font-mono mt-2 ${
                  totalEcartCumulM3 >= header.warningThresholdM3 
                    ? 'text-rose-400' 
                    : totalEcartCumulM3 <= -header.warningThresholdM3 
                      ? 'text-amber-400' 
                      : 'text-emerald-400'
                }`}>
                  {totalEcartCumulM3 >= 0 ? `+${totalEcartCumulM3.toFixed(3)}` : totalEcartCumulM3.toFixed(3)} <span className="text-xs font-normal text-slate-400">m³</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {(totalEcartCumulM3 * 1000).toFixed(0)} L ({totalEcartCumulM3 >= 0 ? 'Gain' : 'Perte'})
                </span>
              </div>
            </div>
          </div>

          {/* Core Interactive Trip Table */}
          <TripTable
            rows={rows}
            activeMode={activeMode}
            activeTubular={activeTubular}
            tubulars={tubulars}
            standLength={header.standLength}
            currentTTLevel={currentTTReading}
            onModeChange={setActiveMode}
            onTubularChange={setActiveTubular}
            onAddStep={handleAddStep}
            onUpdateRowTT={handleUpdateRowTT}
            onUpdateRowRemark={handleUpdateRowRemark}
            onDeleteRow={handleDeleteRow}
            onQuickVidange={handleQuickVidange}
            onQuickRemplissage={handleQuickRemplissage}
          />

          {/* Interactive Volume & Well Control Charts */}
          <TripChart
            rows={rows}
            warningThresholdM3={header.warningThresholdM3}
            criticalThresholdM3={header.criticalThresholdM3}
          />

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/50 py-4 text-center text-xs text-slate-500 font-mono">
          Rig TP-228 • Puits TRNW12Z • Contrôle des Volumes en Manœuvres (Trip Tank & Well Control System)
        </footer>
      </div>

      {/* Printable Sheet (Visible only on window.print()) */}
      <PrintSheet
        header={header}
        rows={rows}
        activeTubulars={tubulars}
      />

      {/* Modals */}
      <TripSetup
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        header={header}
        onSave={(updated) => {
          setHeader(updated);
          setRows(recalculateAllRows(rows, updated.initialTripTankVolume, updated.warningThresholdM3, updated.criticalThresholdM3));
        }}
      />

      <StringComposer
        isOpen={isStringComposerOpen}
        onClose={() => setIsStringComposerOpen(false)}
        sections={stringSections}
        tubulars={tubulars}
        standLength={header.standLength}
        onSave={setStringSections}
      />

      <TubularCatalogModal
        isOpen={isTubularCatalogOpen}
        onClose={() => setIsTubularCatalogOpen(false)}
        tubulars={tubulars}
        onAddTubular={(tub) => setTubulars([...tubulars, tub])}
      />

    </div>
  );
}
