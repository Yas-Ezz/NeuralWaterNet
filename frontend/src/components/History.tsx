import React from 'react';
import { Calendar, Download, FileText, Wrench, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

export function History() {
  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-900">Historique & Rapports</h1>

      {/* Chronologie */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" /> Chronologie
        </h2>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          <TimelineItem
            icon={<CheckCircle2 size={16} className="text-emerald-500" />}
            title="Installation du système"
            date="12 Janvier 2026"
            desc="Mise en service réussie. Paramètres initiaux configurés."
          />
          <TimelineItem
            icon={<AlertTriangle size={16} className="text-orange-500" />}
            title="Alerte: pH anormal"
            date="28 Février 2026"
            desc="Correction automatique appliquée par le système."
          />
          <TimelineItem
            icon={<Wrench size={16} className="text-blue-500" />}
            title="Maintenance: Filtres"
            date="15 Mars 2026"
            desc="Remplacement des filtres primaires effectué."
          />
          <TimelineItem
            icon={<Lightbulb size={16} className="text-yellow-500" />}
            title="Optimisation IA"
            date="16 Mars 2026"
            desc="Ajustement du cycle de nuit pour maximiser les économies."
          />
        </div>
      </div>

      {/* Rapports Automatiques */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-emerald-500" /> Rapports
        </h2>
        <div className="space-y-3">
          <ReportCard title="Rapport Mensuel (Février)" type="PDF" size="1.2 MB" />
          <ReportCard title="Bilan Annuel 2025" type="PDF Interactif" size="4.5 MB" />
          <ReportCard title="Données Brutes (Q1 2026)" type="CSV" size="850 KB" />
        </div>
        
        <button className="w-full mt-4 bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
          <Download size={18} /> Générer un rapport personnalisé
        </button>
      </div>
    </div>
  );
}

function TimelineItem({ icon, title, date, desc }: { icon: React.ReactNode, title: string, date: string, desc: string }) {
  return (
    <div className="relative flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-50 shadow shrink-0 z-10">
        {icon}
      </div>
      <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between space-x-2 mb-1">
          <div className="font-bold text-gray-900 text-sm">{title}</div>
          <time className="text-xs font-medium text-gray-500">{date}</time>
        </div>
        <div className="text-gray-500 text-xs">{desc}</div>
      </div>
    </div>
  );
}

function ReportCard({ title, type, size }: { title: string, type: string, size: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500 group-hover:text-blue-600">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{type} • {size}</p>
        </div>
      </div>
      <Download size={18} className="text-gray-400 group-hover:text-blue-500" />
    </div>
  );
}
