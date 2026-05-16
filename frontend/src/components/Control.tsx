import React, { useState } from 'react';
import { Power, Settings, Moon, Sun, Zap, Calendar, Bell, ShieldAlert, Droplet, Leaf } from 'lucide-react';

export function Control() {
  const [activeMode, setActiveMode] = useState('eco');
  const [pumpCollect, setPumpCollect] = useState(true);
  const [pumpDist, setPumpDist] = useState(false);
  const [uvDisinfect, setUvDisinfect] = useState(true);

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-900">Contrôle & Réglages</h1>

      {/* Modes Préréglés */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings size={18} className="text-blue-500" /> Modes Préréglés
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <ModeButton
            active={activeMode === 'eco'}
            onClick={() => setActiveMode('eco')}
            icon={<Leaf size={20} />}
            label="Éco"
            color="emerald"
          />
          <ModeButton
            active={activeMode === 'confort'}
            onClick={() => setActiveMode('confort')}
            icon={<Sun size={20} />}
            label="Confort"
            color="orange"
          />
          <ModeButton
            active={activeMode === 'nuit'}
            onClick={() => setActiveMode('nuit')}
            icon={<Moon size={20} />}
            label="Nuit"
            color="indigo"
          />
          <ModeButton
            active={activeMode === 'vacances'}
            onClick={() => setActiveMode('vacances')}
            icon={<Calendar size={20} />}
            label="Vacances"
            color="blue"
          />
          <ModeButton
            active={activeMode === 'boost'}
            onClick={() => setActiveMode('boost')}
            icon={<Zap size={20} />}
            label="Boost"
            color="yellow"
          />
        </div>
      </div>

      {/* Contrôle Manuel */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Power size={18} className="text-red-500" /> Contrôle Manuel
        </h2>

        <ToggleControl
          label="Pompe de collecte"
          active={pumpCollect}
          onChange={() => setPumpCollect(!pumpCollect)}
          details="Vitesse: 75%"
          progress={75}
        />
        
        <ToggleControl
          label="Pompe de distribution"
          active={pumpDist}
          onChange={() => setPumpDist(!pumpDist)}
        />

        <ToggleControl
          label="Désinfection UV"
          active={uvDisinfect}
          onChange={() => setUvDisinfect(!uvDisinfect)}
          details="Durée restante: 15 min"
          progress={50}
        />

        <button className="w-full mt-4 bg-blue-50 text-blue-700 font-semibold py-3 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
          <Droplet size={18} /> Activer Cycle Filtration Forcé
        </button>
      </div>

      {/* Paramètres des alertes */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-purple-500" /> Alertes & Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">Détection de fuite</p>
              <p className="text-xs text-gray-500">Seuil de débit anormal</p>
            </div>
            <ShieldAlert size={20} className="text-red-500" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">Niveau minimum réservoir</p>
              <p className="text-xs text-gray-500">Alerte à 20%</p>
            </div>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100',
    orange: active ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100',
    indigo: active ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100',
    blue: active ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100',
    yellow: active ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${colorMap[color]}`}
    >
      {icon}
      <span className="text-xs font-semibold mt-2">{label}</span>
    </button>
  );
}

function ToggleControl({ label, active, onChange, details, progress }: { label: string, active: boolean, onChange: () => void, details?: string, progress?: number }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <button
          onClick={onChange}
          className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'right-1' : 'left-1'}`}></div>
        </button>
      </div>
      {active && details && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{details}</span>
          </div>
          {progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


