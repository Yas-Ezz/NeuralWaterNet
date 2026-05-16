import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Settings } from 'lucide-react';

export function Notifications() {
  const notifs = [
    { id: 1, type: 'warning', title: 'pH anormal détecté', desc: 'Le pH est de 7.8. Une maintenance est recommandée.', time: 'Il y a 2h', unread: true },
    { id: 2, type: 'info', title: 'Cycle de nuit terminé', desc: 'Le système a fonctionné en mode éco pendant 6h.', time: 'Il y a 5h', unread: true },
    { id: 3, type: 'success', title: 'Filtres optimaux', desc: 'La qualité de filtration est à 95%.', time: 'Hier', unread: false },
    { id: 4, type: 'info', title: 'Mise à jour disponible', desc: 'Une nouvelle version du firmware est prête à être installée.', time: 'Hier', unread: false },
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
      case 'success': return <CheckCircle2 size={20} className="text-emerald-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBg = (type: string) => {
    switch(type) {
      case 'warning': return 'bg-orange-100';
      case 'success': return 'bg-emerald-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-white">
        <span className="text-sm font-medium text-gray-500">2 non lues</span>
        <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700 transition-colors">
          <Settings size={16} /> Gérer
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {notifs.map(n => (
          <div key={n.id} className={`p-4 flex gap-4 ${n.unread ? 'bg-blue-50/30' : 'bg-white'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBg(n.type)}`}>
              {getIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-sm ${n.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{n.title}</h4>
                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{n.time}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{n.desc}</p>
            </div>
            {n.unread && (
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
