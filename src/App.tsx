import React, { useState, useMemo } from 'react';
import { 
  ArrowUpFromLine, 
  ArrowDownToLine, 
  Droplet, 
  Droplets, 
  Plus, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet,
  Layers,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { INITIAL_TUBULARS } from './data/tubularDatabase';

// Types
type TripType = 'POOH_DRY' | 'POOH_WET' | 'RIH_DRY' | 'RIH_WET';

interface StringItem {
  id: string;
  name: string;
  category: string;
  vAcierPerStand: number; // Litres per stand (28.5m)
  vExtPerStand: number;   // Litres per stand (28.5m)
  standsCount: number;
}

interface TripRow {
  id: string;
  stepNumber: number;
  fromStand: number;
  toStand: number;
  standsCount: number;
  stringItemId: string;
  isVidange: boolean; // Vidange / Remplissage event
  startTT: number;    // m³
  endTT: number;      // m³
  comment?: string;
}

const DEFAULT_STRING: StringItem[] = [
  {
    id: 's-dp-3.5',
    name: 'DP 3½" S-135 (NC38)',
    category: 'DP',
    vAcierPerStand: 79.8,  // ~0.40 m³ for 5 stands
    vExtPerStand: 190.1,   // ~0.95 m³ for 5 stands
    standsCount: 80
  },
  {
    id: 's-hwdp-3.5',
    name: 'HWDP 3½" 25.3# (NC38)',
    category: 'HWDP',
    vAcierPerStand: 216.6,
    vExtPerStand: 289.6,
    standsCount: 15
  },
  {
    id: 's-dc-4.75',
    name: 'DC 4¾" (ID 2¼")',
    category: 'DC',
    vAcierPerStand: 250.8,
    vExtPerStand: 323.8,
    standsCount: 6
  }
];

export default function App() {
  // 1. Trip Mode State
  const [tripType, setTripType] = useState<TripType>('POOH_DRY');

  // 2. String Components State
  const [stringItems, setStringItems] = useState<StringItem[]>(DEFAULT_STRING);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('dp-5-s135');

  // Well & Rig basic info
  const [wellName, setWellName] = useState('TRNW12Z');
  const [rigName, setRigName] = useState('TP-228');

  // 3. Trip Table Rows State
  const [rows, setRows] = useState<TripRow[]>([
    {
      id: 'row-1',
      stepNumber: 1,
      fromStand: 1,
      toStand: 5,
      standsCount: 5,
      stringItemId: 's-dp-3.5',
      isVidange: false,
      startTT: 4.80,
      endTT: 4.41,
      comment: 'Initial 5 stands'
    },
    {
      id: 'row-2',
      stepNumber: 2,
      fromStand: 6,
      toStand: 10,
      standsCount: 5,
      stringItemId: 's-dp-3.5',
      isVidange: false,
      startTT: 4.41,
      endTT: 4.02,
      comment: ''
    }
  ]);

  // Is mode Dry or Wet?
  const isDry = tripType === 'POOH_DRY' || tripType === 'RIH_DRY';
  const isPOOH = tripType === 'POOH_DRY' || tripType === 'POOH_WET';

  // Helper to get displacement in L/stand for a string component
  const getDisplacementPerStand = (item: StringItem) => {
    return isDry ? item.vAcierPerStand : item.vExtPerStand;
  };

  // Add component from catalog to string
  const handleAddToString = () => {
    const catalogItem = INITIAL_TUBULARS.find(t => t.id === selectedCatalogId);
    if (!catalogItem) return;

    const newItem: StringItem = {
      id: `s-${Date.now()}`,
      name: catalogItem.name,
      category: catalogItem.category,
      vAcierPerStand: catalogItem.vAcierPerStand || Number((catalogItem.vAcierLPerM * 28.5).toFixed(1)),
      vExtPerStand: catalogItem.vExtPerStand || Number((catalogItem.vExtLPerM * 28.5).toFixed(1)),
      standsCount: 10
    };
    setStringItems([...stringItems, newItem]);
  };

  const handleRemoveFromString = (id: string) => {
    if (stringItems.length <= 1) return;
    setStringItems(stringItems.filter(item => item.id !== id));
  };

  const handleUpdateStringItem = (id: string, field: 'vAcierPerStand' | 'vExtPerStand' | 'standsCount' | 'name', value: any) => {
    setStringItems(stringItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Add next row in table
  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];
    const nextStep = lastRow ? lastRow.stepNumber + 1 : 1;
    const nextFrom = lastRow ? (lastRow.isVidange ? lastRow.toStand : lastRow.toStand + 1) : 1;
    const defaultStands = 5;
    const nextTo = nextFrom + defaultStands - 1;
    const startTT = lastRow ? lastRow.endTT : 5.0;
    const defaultStringId = stringItems[0]?.id || '';

    const newRow: TripRow = {
      id: `row-${Date.now()}`,
      stepNumber: nextStep,
      fromStand: nextFrom,
      toStand: nextTo,
      standsCount: defaultStands,
      stringItemId: lastRow ? lastRow.stringItemId : defaultStringId,
      isVidange: false,
      startTT: startTT,
      endTT: startTT, // will be typed by user
      comment: ''
    };
    setRows([...rows, newRow]);
  };

  // Add Vidange / Remplissage TT event row
  const handleAddVidange = () => {
    const lastRow = rows[rows.length - 1];
    const nextStep = lastRow ? lastRow.stepNumber + 1 : 1;
    const currentStand = lastRow ? lastRow.toStand : 0;
    const prevEnd = lastRow ? lastRow.endTT : 0;

    const newRow: TripRow = {
      id: `row-${Date.now()}`,
      stepNumber: nextStep,
      fromStand: currentStand,
      toStand: currentStand,
      standsCount: 0,
      stringItemId: lastRow ? lastRow.stringItemId : (stringItems[0]?.id || ''),
      isVidange: true,
      startTT: prevEnd,
      endTT: 5.0, // newly refilled or drained level
      comment: 'Vidange / Remplissage TT'
    };
    setRows([...rows, newRow]);
  };

  const handleUpdateRow = (id: string, field: keyof TripRow, value: any) => {
    setRows(rows.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: value };
      if (field === 'fromStand' || field === 'toStand') {
        const from = field === 'fromStand' ? Number(value) : row.fromStand;
        const to = field === 'toStand' ? Number(value) : row.toStand;
        updated.standsCount = Math.max(0, to - from + 1);
      } else if (field === 'standsCount') {
        updated.toStand = updated.fromStand + Math.max(0, Number(value)) - 1;
      }
      return updated;
    }));
  };

  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm('هل تريد مسح بيانات الجدول والبدء من جديد؟')) {
      setRows([
        {
          id: 'row-1',
          stepNumber: 1,
          fromStand: 1,
          toStand: 5,
          standsCount: 5,
          stringItemId: stringItems[0]?.id || '',
          isVidange: false,
          startTT: 5.0,
          endTT: 5.0,
          comment: ''
        }
      ]);
    }
  };

  // Calculated Table Data
  const calculatedRows = useMemo(() => {
    let cumTheo = 0;
    let cumReal = 0;

    return rows.map((row) => {
      if (row.isVidange) {
        // Vidange TT resets reference tank gauge, zero displacement for well
        return {
          ...row,
          dispPerStandL: 0,
          theoM3: 0,
          realM3: 0,
          diffM3: 0,
          cumTheoM3: cumTheo,
          cumRealM3: cumReal,
          cumDiffM3: cumReal - cumTheo,
          status: 'info'
        };
      }

      const stringItem = stringItems.find(s => s.id === row.stringItemId) || stringItems[0];
      const dispPerStandL = stringItem ? getDisplacementPerStand(stringItem) : 0;
      
      // Theoretical Volume in m³ = (Stands * L/stand) / 1000
      const theoM3 = Number(((row.standsCount * dispPerStandL) / 1000).toFixed(3));

      // Real Volume in m³:
      // In POOH (Pull out of hole): Rig pump fills hole, TT gauge decreases: Real = startTT - endTT
      // In RIH (Run into hole): Pipe displaces mud to TT, TT gauge increases: Real = endTT - startTT
      const rawDelta = isPOOH ? (row.startTT - row.endTT) : (row.endTT - row.startTT);
      const realM3 = Number(rawDelta.toFixed(3));

      // Difference:
      // In POOH: If Real < Theo => Hole took less mud than expected => Possible Kick / Influx!
      //          If Real > Theo => Hole took more mud than expected => Losses!
      // In RIH:  If Real > Theo => TT gained more mud than pipe volume => Possible Kick / Influx!
      //          If Real < Theo => TT gained less mud than pipe volume => Losses!
      const diffM3 = Number((realM3 - theoM3).toFixed(3));

      cumTheo = Number((cumTheo + theoM3).toFixed(3));
      cumReal = Number((cumReal + realM3).toFixed(3));
      const cumDiffM3 = Number((cumReal - cumTheo).toFixed(3));

      // Well control status check: threshold 0.15 m³ (~1 bbl)
      let status: 'normal' | 'kick' | 'loss' = 'normal';
      const tolerance = 0.15;
      
      if (isPOOH) {
        if (diffM3 < -tolerance) status = 'kick'; // took less mud => influx pushed mud
        else if (diffM3 > tolerance) status = 'loss'; // took more mud => losses
      } else {
        // RIH
        if (diffM3 > tolerance) status = 'kick'; // displaced too much => influx
        else if (diffM3 < -tolerance) status = 'loss'; // displaced too little => mud lost to formation
      }

      return {
        ...row,
        dispPerStandL,
        theoM3,
        realM3,
        diffM3,
        cumTheoM3: cumTheo,
        cumRealM3: cumReal,
        cumDiffM3,
        status
      };
    });
  }, [rows, stringItems, isDry, isPOOH]);

  // Overall Summary
  const summary = useMemo(() => {
    const nonVidangeRows = calculatedRows.filter(r => !r.isVidange);
    const lastRow = calculatedRows[calculatedRows.length - 1];
    const totalTheo = lastRow?.cumTheoM3 || 0;
    const totalReal = lastRow?.cumRealM3 || 0;
    const totalDiff = lastRow?.cumDiffM3 || 0;
    const totalStands = nonVidangeRows.reduce((sum, r) => sum + r.standsCount, 0);

    const hasKickAlert = calculatedRows.some(r => r.status === 'kick');
    const hasLossAlert = calculatedRows.some(r => r.status === 'loss');

    return {
      totalTheo,
      totalReal,
      totalDiff,
      totalStands,
      hasKickAlert,
      hasLossAlert
    };
  }, [calculatedRows]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-3 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* --- HEADER --- */}
        <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                Trip Tank Monitor
                <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded-full border border-blue-200">
                  Contrôle des volumes
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                حسابات إزاحة خزان الرحلات الفورية • Rig: <span className="font-semibold text-slate-700">{rigName}</span> | Well: <span className="font-semibold text-slate-700">{wellName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={wellName} 
              onChange={e => setWellName(e.target.value)}
              placeholder="Well name"
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 w-24 text-center font-medium"
              title="اسم البئر"
            />
            <input 
              type="text" 
              value={rigName} 
              onChange={e => setRigName(e.target.value)}
              placeholder="Rig"
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1.5 w-20 text-center font-medium"
              title="اسم الحفارة"
            />
            <button 
              onClick={handleResetData}
              className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded transition"
              title="مسح وتصفير الجدول"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              تصفير
            </button>
          </div>
        </header>

        {/* --- SECTION 1: TRIP TYPE (أنواع الـ TRIP) --- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              1. نوع الرحلة (Mode de manœuvre)
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              القاعدة المعتمدة: {isDry ? 'حجم الفولاذ (V_acier)' : 'الحجم الخارجي الكامل (V_ext)'}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* POOH DRY */}
            <button
              onClick={() => setTripType('POOH_DRY')}
              className={`p-3.5 rounded-xl border-2 text-left transition relative flex flex-col justify-between ${
                tripType === 'POOH_DRY'
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <ArrowUpFromLine className="w-4 h-4 text-blue-600" />
                  POOH Dry
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  سحب جاف
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                أنبوب فارغ / مفتوح • إزاحة: <strong className="text-slate-700">V_acier</strong>
              </p>
              <p className="text-[11px] text-blue-700 font-medium mt-1">
                الخزان ينقص لملء البئر
              </p>
            </button>

            {/* POOH WET */}
            <button
              onClick={() => setTripType('POOH_WET')}
              className={`p-3.5 rounded-xl border-2 text-left transition relative flex flex-col justify-between ${
                tripType === 'POOH_WET'
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <ArrowUpFromLine className="w-4 h-4 text-indigo-600" />
                  POOH Wet
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  سحب رطب
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                أنبوب مملوء / مغلق • إزاحة: <strong className="text-slate-700">V_ext</strong>
              </p>
              <p className="text-[11px] text-indigo-700 font-medium mt-1">
                الخزان ينقص بكامل حجم الأنبوب
              </p>
            </button>

            {/* RIH DRY */}
            <button
              onClick={() => setTripType('RIH_DRY')}
              className={`p-3.5 rounded-xl border-2 text-left transition relative flex flex-col justify-between ${
                tripType === 'RIH_DRY'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                  RIH Dry / Open
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  إنزال مفتوح
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                يدخل الطين داخل الأنبوب • إزاحة: <strong className="text-slate-700">V_acier</strong>
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                الخزان يمتلئ بحجم الفولاذ فقط
              </p>
            </button>

            {/* RIH WET */}
            <button
              onClick={() => setTripType('RIH_WET')}
              className={`p-3.5 rounded-xl border-2 text-left transition relative flex flex-col justify-between ${
                tripType === 'RIH_WET'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <ArrowDownToLine className="w-4 h-4 text-teal-600" />
                  RIH Wet / Closed
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                  إنزال مغلق
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                صمام مغلق / منع دخول • إزاحة: <strong className="text-slate-700">V_ext</strong>
              </p>
              <p className="text-[11px] text-teal-700 font-medium mt-1">
                الخزان يمتلئ بكامل حجم الأنبوب
              </p>
            </button>
          </div>
        </section>

        {/* --- SECTION 2: STRING COMPONENTS (أجزاء السترينغ) --- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              2. أجزاء السترينغ المستخدمة (Composition de la garniture)
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedCatalogId}
                onChange={e => setSelectedCatalogId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium max-w-[220px]"
              >
                {INITIAL_TUBULARS.map(t => (
                  <option key={t.id} value={t.id}>
                    + إضافة: {t.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddToString}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة للسترينغ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stringItems.map((item, idx) => {
              const activeDispL = getDisplacementPerStand(item);
              const fiveStandsM3 = ((activeDispL * 5) / 1000).toFixed(2);

              return (
                <div 
                  key={item.id} 
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 relative flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        #{idx + 1} • {item.category}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-900 mt-1">{item.name}</h3>
                    </div>
                    {stringItems.length > 1 && (
                      <button
                        onClick={() => handleRemoveFromString(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="حذف هذا الجزء"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">الإزاحة الحالية:</span>
                      <span className="font-bold text-blue-700 text-sm">
                        {activeDispL} <span className="text-[10px] text-slate-500 font-normal">L/std</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">لكل 5 ستاندات:</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {fiveStandsM3} <span className="text-[10px] text-slate-500 font-normal">m³</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                    <span>Dry (Acier): {item.vAcierPerStand} L/std</span>
                    <span>Wet (Ext): {item.vExtPerStand} L/std</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- SECTION 3: AUTOMATIC CALCULATION TABLE (جدول الحساب الأوتوماتيكي) --- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Table Header Controls */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                3. جدول الحساب الأوتوماتيكي (Feuille de manœuvre)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                أدخل قراءات الخزان (Début / Fin) ويتم حساب النظري والفعلي والفارق فورياً
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddRow}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                + إضافة 5 ستاندات
              </button>
              <button
                onClick={handleAddVidange}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
                title="تسجيل تفريغ أو تعبئة خزان الرحلات لإعادة تعيين خط الأساس"
              >
                <RefreshCw className="w-4 h-4" />
                تفريغ الخزان (Vidange TT)
              </button>
            </div>
          </div>

          {/* Alert Banner if kick or loss detected */}
          {summary.hasKickAlert && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center gap-2 text-red-800 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span><strong>تنبيه أمان (Kick / Influx):</strong> يوجد فارق يظهر زيادة غير متوقعة في حجم الطين. تحقق من البئر فوراً وأوقف الرحلة إن لزم الأمر (Flow Check).</span>
            </div>
          )}
          {summary.hasLossAlert && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 text-amber-800 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>تنبيه فقدان (Losses):</strong> يوجد فارق يظهر نقصاً في الطين الراجع أو استهلاكاً أكبر من النظري. راقب الضغوط ومستوى الخزان.</span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-3 w-40">المقطع (String)</th>
                  <th className="py-3 px-3 text-center w-28">الستاندات (Stands)</th>
                  <th className="py-3 px-3 text-right bg-blue-50/50 text-blue-900 w-32">
                    النظري (Théo)
                    <span className="block text-[9px] font-normal text-blue-600">m³</span>
                  </th>
                  <th className="py-3 px-3 text-center bg-slate-50 w-28">
                    خزان بداية
                    <span className="block text-[9px] font-normal text-slate-500">m³ Début</span>
                  </th>
                  <th className="py-3 px-3 text-center bg-slate-50 w-28">
                    خزان نهاية
                    <span className="block text-[9px] font-normal text-slate-500">m³ Fin</span>
                  </th>
                  <th className="py-3 px-3 text-right bg-slate-50 font-bold text-slate-900 w-28">
                    الفعلي (Réel)
                    <span className="block text-[9px] font-normal text-slate-500">m³</span>
                  </th>
                  <th className="py-3 px-3 text-right w-28">
                    الفرق (Diff)
                    <span className="block text-[9px] font-normal text-slate-500">Réel - Théo</span>
                  </th>
                  <th className="py-3 px-3 text-right bg-slate-100 text-slate-800 w-32">
                    التراكمي (Cumulé)
                    <span className="block text-[9px] font-normal text-slate-500">Cumulé Diff</span>
                  </th>
                  <th className="py-3 px-3 text-center w-24">الحالة</th>
                  <th className="py-3 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {calculatedRows.map((row, idx) => {
                  if (row.isVidange) {
                    return (
                      <tr key={row.id} className="bg-amber-50/70 font-medium text-amber-900">
                        <td className="py-2.5 px-3 text-center font-bold">{row.stepNumber}</td>
                        <td colSpan={3} className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-bold">
                              VIDANGE / REMPLISSAGE
                            </span>
                            <span className="text-xs">إعادة ضبط مستوى خزان الرحلات</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-xs text-slate-500 line-through">{row.startTT} m³</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input 
                            type="number" 
                            step="0.01"
                            value={row.endTT}
                            onChange={e => handleUpdateRow(row.id, 'endTT', Number(e.target.value))}
                            className="w-20 text-center font-bold bg-white border border-amber-300 rounded px-1.5 py-1 text-xs"
                            title="المستوى الجديد بعد التعبئة/التفريغ"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                          {row.cumDiffM3 > 0 ? `+${row.cumDiffM3}` : row.cumDiffM3} m³
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            ضبط المرجع
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button 
                            onClick={() => handleDeleteRow(row.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition">
                      {/* Step Number */}
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                        {row.stepNumber}
                      </td>

                      {/* String Item Select */}
                      <td className="py-2.5 px-3">
                        <select
                          value={row.stringItemId}
                          onChange={e => handleUpdateRow(row.id, 'stringItemId', e.target.value)}
                          className="w-full bg-transparent font-medium text-slate-800 border-0 focus:ring-1 focus:ring-blue-500 rounded p-1 text-xs"
                        >
                          {stringItems.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </td>

                      {/* Stands (From - To) */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 font-mono">
                          <input 
                            type="number"
                            value={row.fromStand}
                            onChange={e => handleUpdateRow(row.id, 'fromStand', Number(e.target.value))}
                            className="w-10 text-center bg-slate-50 border border-slate-200 rounded py-0.5 text-xs font-semibold"
                          />
                          <span className="text-slate-400">-</span>
                          <input 
                            type="number"
                            value={row.toStand}
                            onChange={e => handleUpdateRow(row.id, 'toStand', Number(e.target.value))}
                            className="w-10 text-center bg-slate-50 border border-slate-200 rounded py-0.5 text-xs font-semibold"
                          />
                          <span className="text-[10px] text-slate-400">({row.standsCount})</span>
                        </div>
                      </td>

                      {/* Theoretical Volume */}
                      <td className="py-2.5 px-3 text-right bg-blue-50/30 font-bold text-blue-900 font-mono text-sm">
                        {row.theoM3.toFixed(3)}
                      </td>

                      {/* TT Start */}
                      <td className="py-2.5 px-3 text-center bg-slate-50/50">
                        <input 
                          type="number" 
                          step="0.01"
                          value={row.startTT}
                          onChange={e => handleUpdateRow(row.id, 'startTT', Number(e.target.value))}
                          className="w-20 text-center font-mono font-medium bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                        />
                      </td>

                      {/* TT End */}
                      <td className="py-2.5 px-3 text-center bg-slate-50/50">
                        <input 
                          type="number" 
                          step="0.01"
                          value={row.endTT}
                          onChange={e => handleUpdateRow(row.id, 'endTT', Number(e.target.value))}
                          className="w-20 text-center font-mono font-bold bg-white border border-slate-300 rounded px-1.5 py-1 text-xs text-blue-950 focus:border-blue-500"
                        />
                      </td>

                      {/* Real Volume */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm bg-slate-50/30">
                        {row.realM3.toFixed(3)}
                      </td>

                      {/* Difference */}
                      <td className={`py-2.5 px-3 text-right font-mono font-bold text-sm ${
                        row.status === 'kick' 
                          ? 'text-red-600 bg-red-50/50' 
                          : row.status === 'loss' 
                          ? 'text-amber-600 bg-amber-50/50' 
                          : 'text-emerald-700'
                      }`}>
                        {row.diffM3 > 0 ? `+${row.diffM3.toFixed(3)}` : row.diffM3.toFixed(3)}
                      </td>

                      {/* Cumulative Difference */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 bg-slate-100/50">
                        {row.cumDiffM3 > 0 ? `+${row.cumDiffM3.toFixed(3)}` : row.cumDiffM3.toFixed(3)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-3 text-center">
                        {row.status === 'normal' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            مطابق
                          </span>
                        )}
                        {row.status === 'kick' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            KICK !
                          </span>
                        )}
                        {row.status === 'loss' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            LOSS !
                          </span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td className="py-2.5 px-2 text-center">
                        <button 
                          onClick={() => handleDeleteRow(row.id)}
                          className="text-slate-300 hover:text-red-500 p-1 transition"
                          title="حذف الصف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer / Totals */}
              <tfoot>
                <tr className="bg-slate-200/80 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="py-3 px-3 text-right">
                    المجموع الكلي (Total):
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    {summary.totalStands} std
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-900">
                    {summary.totalTheo.toFixed(3)} m³
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-center text-slate-500 text-xs font-normal">
                    (تراكمي الرحلة)
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900">
                    {summary.totalReal.toFixed(3)} m³
                  </td>
                  <td colSpan={2} className={`py-3 px-3 text-right font-mono text-sm ${
                    summary.totalDiff > 0.2 ? 'text-amber-700' : summary.totalDiff < -0.2 ? 'text-red-700' : 'text-emerald-700'
                  }`}>
                    الفارق الكلي: {summary.totalDiff > 0 ? `+${summary.totalDiff.toFixed(3)}` : summary.totalDiff.toFixed(3)} m³
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-center">
                    <button
                      onClick={() => window.print()}
                      className="bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-sm inline-flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3" />
                      طباعة
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
