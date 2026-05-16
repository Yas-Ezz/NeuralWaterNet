import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Droplet, Activity, ShieldCheck, Zap, Battery, Leaf, BarChart2 } from 'lucide-react';

const data = [
  { name: 'Lun', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Mar', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mer', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Jeu', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Ven', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Sam', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Dim', uv: 3490, pv: 4300, amt: 2100 },
];

export function Tracking() {
  const [view, setView] = useState('consommation');

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-900">Suivi Détaillé</h1>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <TabButton active={view === 'consommation'} onClick={() => setView('consommation')} icon={<BarChart2 size={16} />} label="Consommation" />
        <TabButton active={view === 'qualite'} onClick={() => setView('qualite')} icon={<Activity size={16} />} label="Qualité" />
        <TabButton active={view === 'systeme'} onClick={() => setView('systeme')} icon={<ShieldCheck size={16} />} label="Système" />
        <TabButton active={view === 'impact'} onClick={() => setView('impact')} icon={<Leaf size={16} />} label="Impact" />
      </div>

      {view === 'consommation' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Consommation Hebdomadaire</h2>
              <select className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none">
                <option>Cette semaine</option>
                <option>Semaine dernière</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="pv" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <span className="flex items-center gap-2"><Droplet size={16} className="text-blue-500" /> Pic de consommation:</span>
              <span className="font-semibold text-gray-900">Mercredi (9.8 m³)</span>
            </div>
          </div>
        </div>
      )}

      {view === 'qualite' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold border-4 border-emerald-50">
                B
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Indice Global</h2>
                <p className="text-sm text-gray-500">Qualité très satisfaisante</p>
                <div className="flex gap-1 mt-1 text-yellow-400">⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="space-y-4">
              <QualityMetric label="pH" value="7.2" optimal="7.0 - 7.5" progress={60} color="bg-emerald-500" />
              <QualityMetric label="Turbidité" value="12 NTU" optimal="< 15 NTU" progress={80} color="bg-blue-500" />
              <QualityMetric label="Température" value="18°C" optimal="15°C - 25°C" progress={40} color="bg-orange-500" />
            </div>
          </div>
        </div>
      )}

      {view === 'systeme' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SystemCard icon={<ShieldCheck className="text-blue-500" />} title="Filtres" value="85%" sub="45 jours restants" />
            <SystemCard icon={<Zap className="text-yellow-500" />} title="Pompes" value="1240h" sub="Durée de vie: 60%" />
            <SystemCard icon={<Activity className="text-purple-500" />} title="Lampe UV" value="92%" sub="Efficacité résiduelle" />
            <SystemCard icon={<Battery className="text-emerald-500" />} title="Batterie" value="78%" sub="Autonomie: 12h" />
          </div>
        </div>
      )}

      {view === 'impact' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-emerald-600" size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Impact Environnemental</h2>
            <p className="text-gray-500 text-sm mb-6">Votre contribution à la préservation des ressources.</p>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">CO₂ Évité</p>
                <p className="text-2xl font-bold text-emerald-600">28 kg</p>
                <p className="text-xs text-gray-400 mt-1">Équivalent 120 km en voiture</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Eau Préservée</p>
                <p className="text-2xl font-bold text-blue-600">45 m³</p>
                <p className="text-xs text-gray-400 mt-1">Soit 300 bains</p>
              </div>
            </div>

            <button className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-emerald-700 transition-colors">
              Partager mon impact
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function QualityMetric({ label, value, optimal, progress, color }: { label: string, value: string, optimal: string, progress: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-xs text-gray-400 text-right">Optimal: {optimal}</p>
    </div>
  );
}

function SystemCard({ icon, title, value, sub }: { icon: React.ReactNode, title: string, value: string, sub: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-xl font-bold text-gray-900 my-1">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}
