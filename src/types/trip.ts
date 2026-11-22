export type TripMode = 'POOH_DRY' | 'POOH_WET' | 'RIH_DRY' | 'RIH_WET';

export type EventType = 
  | 'NONE'
  | 'VIDANGE_TT'
  | 'REMPLISSAGE_TT'
  | 'FLOW_CHECK'
  | 'CHG_STRING'
  | 'AUTRE';

export type AlarmSeverity = 'NORMAL' | 'WARNING' | 'KICK_ALERT' | 'LOSS_ALERT';

export interface Tubular {
  id: string;
  name: string;
  category: 'DP' | 'HWDP' | 'DC' | 'TUBING' | 'CASING';
  odInch: number;
  idInch: number;
  weightLbsFt: number;
  connection?: string;
  // Volumes in L/m
  vAcierLPerM: number;     // Steel displacement
  vIntLPerM: number;       // Inside capacity
  vExtLPerM: number;       // External volume (vAcier + vInt)
  vAcierPerStand?: number; // Liters (per 28.5m stand)
  vExtPerStand?: number;   // Liters (per 28.5m stand)
  notes?: string;
}

export interface StringSection {
  id: string;
  tubularId: string;
  tubularName: string;
  numStands: number;
  lengthMeters: number;
  vAcierLPerM: number;
  vExtLPerM: number;
  vIntLPerM: number;
}

export interface TripHeader {
  wellName: string;
  rigName: string;
  date: string;
  time: string;
  shift: 'JOUR' | 'NUIT';
  drillerName: string;
  companyMan: string;
  drillingSupervisor: string;
  mudDensity: number; // SG (e.g. 1.15)
  standLength: number; // meters, default 28.5m
  tripTankCapacity: number; // m3, default 5.0m3
  initialTripTankVolume: number; // m3
  warningThresholdM3: number; // default 0.20 m3 (200L)
  criticalThresholdM3: number; // default 0.40 m3 (400L)
  currentDepth: number; // meters
  finalDepth: number; // meters
  operationNotes: string;
}

export interface TripRow {
  id: string;
  timestamp: string;
  standNumber: number; // cumulative stands pulled/run
  standsInStep: number; // e.g. 1, 3, 5 stands
  depth: number; // m
  tubularName: string;
  mode: TripMode;
  
  // Theoretical volumes
  vTheoriqueStepM3: number;
  vTheoriqueCumulM3: number;
  
  // Actual Trip Tank readings
  tripTankReadingM3: number;
  tripTankDeltaM3: number; // Real mud volume displaced in this step
  vReelCumulM3: number;
  
  // Discrepancy (Ecart = Reel - Theorique)
  ecartStepM3: number;
  ecartCumulM3: number;
  
  // Status & Event
  status: AlarmSeverity;
  event: EventType;
  remarks: string;
}
