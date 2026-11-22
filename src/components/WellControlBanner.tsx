import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { AlarmSeverity } from '../types/trip';

interface WellControlBannerProps {
  status: AlarmSeverity;
  totalEcartCumulM3: number;
  warningThresholdM3: number;
  criticalThresholdM3: number;
  onLogFlowCheck: (result: 'NÉGATIF (Pas de débit)' | 'POSITIF (Débit détecté / Kick!)' | 'DOUTE') => void;
}

export const WellControlBanner: React.FC<WellControlBannerProps> = ({
  status,
  totalEcartCumulM3,
  warningThresholdM3,
  criticalThresholdM3,
  onLogFlowCheck
}) => {
  const [showFlowCheckModal, setShowFlowCheckModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 mins = 900s
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const resetTimer = (totalSecs = 900) => {
    setIsTimerRunning(false);
    setTimerSeconds(totalSecs);
  };

  const getBannerDetails = () => {
    switch (status) {
      case 'KICK_ALERT':
        return {
          bg: 'bg-rose-950/70 border-rose-600/80 text-rose-200',
          icon: <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />,
          title: 'ALERTE CRITIQUE : RISQUE DE KICK / INFLUX DÉTECTÉ !',
          description: `L'écart cumulé dépasse le seuil critique (+${totalEcartCumulM3.toFixed(3)} m³ ≥ +${criticalThresholdM3.toFixed(2)} m³). Le puits rend plus de boue que prévu. Arrêter immédiatement la manœuvre et procéder au Flow Check !`,
          cta: 'Exécuter Flow Check Immédiat',
          ctaClass: 'bg-rose-600 hover:bg-rose-500 text-white'
        };
      case 'LOSS_ALERT':
        return {
          bg: 'bg-amber-950/70 border-amber-600/80 text-amber-200',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />,
          title: 'ATTENTION : PERTE DE CIRCULATION DÉTECTÉE',
          description: `Perte cumulative de boue (${totalEcartCumulM3.toFixed(3)} m³ ≤ -${criticalThresholdM3.toFixed(2)} m³). Le puits absorbe du fluide. Surveiller la baisse de niveau hydrostatique.`,
          cta: 'Contrôler le puits / Flow Check',
          ctaClass: 'bg-amber-600 hover:bg-amber-500 text-white'
        };
      case 'WARNING':
        return {
          bg: 'bg-yellow-950/50 border-yellow-600/60 text-yellow-200',
          icon: <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0" />,
          title: 'SURVEILLANCE : ÉCART SIGNIFICATIF EN COURS',
          description: `Écart cumulé de ${totalEcartCumulM3 > 0 ? `+${totalEcartCumulM3.toFixed(3)}` : totalEcartCumulM3.toFixed(3)} m³ supérieur au seuil d'avertissement (±${warningThresholdM3.toFixed(2)} m³). Contrôler les prochaines longueurs attentivement.`,
          cta: 'Faire un Flow Check',
          ctaClass: 'bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-semibold'
        };
      default:
        return {
          bg: 'bg-slate-900/80 border-slate-800 text-slate-300',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />,
          title: 'Conditions de Manœuvre Stables (Well Control OK)',
          description: `Écart cumulé actuel : ${totalEcartCumulM3 >= 0 ? `+${totalEcartCumulM3.toFixed(3)}` : totalEcartCumulM3.toFixed(3)} m³ (${(totalEcartCumulM3 * 1000).toFixed(0)} L). Les volumes mesurés au Trip Tank correspondent aux volumes théoriques d'acier et de capacité.`,
          cta: 'Flow Check de Routine (10/15 min)',
          ctaClass: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
        };
    }
  };

  const details = getBannerDetails();

  return (
    <>
      <div className={`rounded-2xl border p-4 shadow-md transition-all ${details.bg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {details.icon}
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {details.title}
              </h2>
              <p className="text-xs mt-1 text-slate-300 max-w-3xl leading-relaxed">
                {details.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFlowCheckModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium shadow transition shrink-0 ${details.ctaClass}`}
          >
            <Timer className="w-4 h-4" />
            <span>{details.cta}</span>
          </button>
        </div>
      </div>

      {/* Flow Check Modal */}
      {showFlowCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Contrôle de Débit (Flow Check)</h3>
              </div>
              <button
                onClick={() => setShowFlowCheckModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 text-center">
              <div className="text-5xl font-mono font-bold tracking-widest text-amber-400 mb-3">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs text-slate-400">
                Puits arrêté sur Trip Tank. Vérifier l'immobilité totale du niveau de boue.
              </p>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTimerRunning ? 'Pause' : 'Démarrer chrono'}</span>
                </button>
                <button
                  onClick={() => resetTimer(900)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                >
                  15 min
                </button>
                <button
                  onClick={() => resetTimer(600)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                >
                  10 min
                </button>
                <button
                  onClick={() => resetTimer(900)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                  title="Réinitialiser"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Result logging */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-300 mb-2">
                Enregistrer le résultat dans la feuille de manœuvre :
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    onLogFlowCheck('NÉGATIF (Pas de débit)');
                    setShowFlowCheckModal(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>NÉGATIF : Puits calme (Pas de débit)</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20">OK</span>
                </button>

                <button
                  onClick={() => {
                    onLogFlowCheck('POSITIF (Débit détecté / Kick!)');
                    setShowFlowCheckModal(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>POSITIF : Débit observé (Risque de Kick)</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 font-bold">ALERTE</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
