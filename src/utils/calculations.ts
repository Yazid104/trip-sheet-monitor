import { TripMode, EventType, AlarmSeverity, TripRow, Tubular } from '../types/trip';

export function getDisplacementLPerM(tubular: Tubular, mode: TripMode): number {
  switch (mode) {
    case 'POOH_DRY':
    case 'RIH_DRY':
      return tubular.vAcierLPerM;
    case 'POOH_WET':
    case 'RIH_WET':
      return tubular.vExtLPerM;
  }
}

export function calculateStepTheoreticalVolume(
  unitLPerM: number,
  standsInStep: number,
  standLength: number
): { volumeLiters: number; volumeM3: number } {
  const lengthMeters = standsInStep * standLength;
  const volumeLiters = lengthMeters * unitLPerM;
  const volumeM3 = volumeLiters / 1000;
  return {
    volumeLiters: Number(volumeLiters.toFixed(2)),
    volumeM3: Number(volumeM3.toFixed(3))
  };
}

export interface RowCalculationResult {
  vTheoriqueStepM3: number;
  vTheoriqueCumulM3: number;
  tripTankDeltaM3: number;
  vReelCumulM3: number;
  ecartStepM3: number;
  ecartCumulM3: number;
  status: AlarmSeverity;
}

export function evaluateAlarm(
  ecartCumulM3: number,
  warningThresholdM3: number,
  criticalThresholdM3: number
): AlarmSeverity {
  if (ecartCumulM3 >= criticalThresholdM3) {
    return 'KICK_ALERT';
  }
  if (ecartCumulM3 <= -criticalThresholdM3) {
    return 'LOSS_ALERT';
  }
  if (Math.abs(ecartCumulM3) >= warningThresholdM3) {
    return 'WARNING';
  }
  return 'NORMAL';
}

/**
 * Recomputes all cumulative values and discrepancies across the entire trip sheet
 */
export function recalculateAllRows(
  rows: TripRow[],
  initialTTVolume: number,
  warningThresholdM3: number,
  criticalThresholdM3: number
): TripRow[] {
  let prevTTLevel = initialTTVolume;
  let cumTheoriqueM3 = 0;
  let cumReelM3 = 0;
  let cumEcartM3 = 0;

  return rows.map((row) => {
    // If this row is a tank reset event (Vidange or Remplissage with reset),
    // update the reference baseline for next steps
    if (row.event === 'VIDANGE_TT' || row.event === 'REMPLISSAGE_TT') {
      prevTTLevel = row.tripTankReadingM3;
      return {
        ...row,
        vTheoriqueCumulM3: Number(cumTheoriqueM3.toFixed(3)),
        vReelCumulM3: Number(cumReelM3.toFixed(3)),
        tripTankDeltaM3: 0,
        ecartStepM3: 0,
        ecartCumulM3: Number(cumEcartM3.toFixed(3)),
        status: evaluateAlarm(cumEcartM3, warningThresholdM3, criticalThresholdM3)
      };
    }

    cumTheoriqueM3 += row.vTheoriqueStepM3;

    let deltaTT = 0;
    let ecartStep = 0;

    const isPOOH = row.mode.startsWith('POOH');

    if (isPOOH) {
      // Tank level drops to fill hole.
      // Expected drop = vTheoriqueStepM3
      // Actual drop = prevTTLevel - row.tripTankReadingM3
      deltaTT = prevTTLevel - row.tripTankReadingM3;
      
      // Positive discrepancy = GAIN / INFLUX (hole took LESS mud than steel volume pulled)
      // Gain = Theoretical_Drop - Actual_Drop
      ecartStep = row.vTheoriqueStepM3 - deltaTT;
    } else {
      // RIH: Tank level rises as mud is pushed into tank.
      // Expected rise = vTheoriqueStepM3
      // Actual rise = row.tripTankReadingM3 - prevTTLevel
      deltaTT = row.tripTankReadingM3 - prevTTLevel;
      
      // Positive discrepancy = GAIN / INFLUX (more mud displaced to tank than theoretical)
      // Gain = Actual_Rise - Theoretical_Rise
      ecartStep = deltaTT - row.vTheoriqueStepM3;
    }

    cumReelM3 += deltaTT;
    cumEcartM3 += ecartStep;
    prevTTLevel = row.tripTankReadingM3;

    const status = evaluateAlarm(cumEcartM3, warningThresholdM3, criticalThresholdM3);

    return {
      ...row,
      vTheoriqueCumulM3: Number(cumTheoriqueM3.toFixed(3)),
      tripTankDeltaM3: Number(deltaTT.toFixed(3)),
      vReelCumulM3: Number(cumReelM3.toFixed(3)),
      ecartStepM3: Number(ecartStep.toFixed(3)),
      ecartCumulM3: Number(cumEcartM3.toFixed(3)),
      status
    };
  });
}
