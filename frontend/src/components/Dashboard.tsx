import React from 'react';
import { Droplet, Activity, Settings, AlertTriangle, ShieldCheck, Battery, Zap, CheckCircle2, Info, Bell } from 'lucide-react';

export function Dashboard({ openModal }: { openModal: (m: string) => void }) {
  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, Ahmed !</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span className="text-blue-500">📍</span> Villa - Casablanca
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openModal('notifications')} className="relative p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            AH
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg flex items-start gap-3 shadow-sm">
        <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-orange-800">Avertissement</h4>
          <p className="text-xs text-orange-700 mt-1">pH légèrement anormal (7.8). Maintenance prévue dans 5 jours.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Droplet size={18} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Aujourd'hui</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">340 L</p>
            <p className="text-sm text-green-600 font-medium">8,50 DH économisés</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <span>Qualité:</span>
              <span className="text-yellow-500">⭐⭐⭐⭐</span>
              <span className="font-semibold text-gray-700">(B)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Activity size={18} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Depuis l'installation</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">45.2 m³</p>
            <p className="text-sm text-emerald-600 font-medium">1 130 DH économisés</p>
            <p className="text-xs text-gray-500 mt-2">CO₂ évité: <span className="font-semibold text-gray-700">28 kg</span></p>
          </div>
        </div>
      </div>

      {/* Real-time System Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Système en temps réel</h2>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            En ligne
          </span>
        </div>
        
        <div className="p-4">
          {/* Animated Flow Visualization Placeholder */}
          <div className="h-32 bg-blue-50 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center border border-blue-100">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="flex flex-col items-center z-10">
              <Droplet className="text-blue-500 mb-2 animate-bounce" size={32} />
              <span className="text-blue-800 font-semibold">Flux actif: 8,2 L/min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <StatusItem icon={<Activity size={16} />} label="pH" value="7.2" status="good" subtext="Optimal" />
            <StatusItem icon={<Droplet size={16} />} label="Turbidité" value="12 NTU" status="good" subtext="Eau claire" />
            <StatusItem icon={<Battery size={16} />} label="Réservoir" value="65%" status="warning" subtext="Niveau moyen" />
            <StatusItem icon={<ShieldCheck size={16} />} label="Filtres" value="85%" status="good" subtext="45 jours restants" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ icon, label, value, status, subtext }: { icon: React.ReactNode, label: string, value: string, status: 'good' | 'warning' | 'error', subtext: string }) {
  const statusColors = {
    good: 'text-emerald-500 bg-emerald-50',
    warning: 'text-orange-500 bg-orange-50',
    error: 'text-red-500 bg-red-50',
  };

  const statusTextColors = {
    good: 'text-emerald-600',
    warning: 'text-orange-600',
    error: 'text-red-600',
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${statusColors[status]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
        <p className={`text-[10px] font-medium ${statusTextColors[status]}`}>{subtext}</p>
      </div>
    </div>
  );
}
