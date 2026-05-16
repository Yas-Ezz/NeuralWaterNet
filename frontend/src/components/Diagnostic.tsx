import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, RefreshCw, Server, Droplet, ShieldCheck } from 'lucide-react';

export function Diagnostic() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: <Server size={20}/>, text: "Connexion au système central..." },
    { icon: <Droplet size={20}/>, text: "Analyse de la qualité d'eau..." },
    { icon: <Activity size={20}/>, text: "Vérification des pompes et débits..." },
    { icon: <ShieldCheck size={20}/>, text: "Contrôle des filtres et UV..." }
  ];

  const runDiagnostic = () => {
    setStatus('running');
    setProgress(0);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setStatus('done');
          return 100;
        }
        const newP = p + 2;
        if (newP > 25 && newP <= 50) setCurrentStep(1);
        else if (newP > 50 && newP <= 75) setCurrentStep(2);
        else if (newP > 75) setCurrentStep(3);
        return newP;
      });
    }, 100);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-full">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
        {status === 'running' && (
          <svg className="absolute inset-0 w-full h-full animate-spin text-blue-500" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="75 225" strokeLinecap="round" />
          </svg>
        )}
        <Activity size={40} className={status === 'running' ? 'text-blue-600 animate-pulse' : 'text-blue-600'} />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Diagnostic Système</h2>
      
      {status === 'idle' && (
        <>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Lancez une analyse complète de votre installation pour vérifier l'état des composants et la qualité de l'eau.
          </p>
          <button onClick={runDiagnostic} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <RefreshCw size={18} /> Lancer le diagnostic
          </button>
        </>
      )}

      {status === 'running' && (
        <div className="w-full space-y-6">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${idx === currentStep ? 'bg-blue-50 border-blue-200 text-blue-700' : idx < currentStep ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                {idx < currentStep ? <CheckCircle2 size={20} /> : step.icon}
                <span className="text-sm font-medium">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="w-full space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mb-2" />
            <h3 className="text-lg font-bold text-emerald-800">Système Optimal</h3>
            <p className="text-sm text-emerald-600 mt-1">Aucune anomalie détectée. Tous les composants fonctionnent correctement.</p>
          </div>
          <button onClick={() => setStatus('idle')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
            Terminer
          </button>
        </div>
      )}
    </div>
  );
}
