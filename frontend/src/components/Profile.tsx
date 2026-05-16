import React from 'react';
import { User, Settings, Shield, Bell, HelpCircle, MessageSquare, Phone, LogOut, ChevronRight } from 'lucide-react';

export function Profile({ onLogout, openModal }: { onLogout: () => void, openModal: (m: string) => void }) {
  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-900">Profil & Support</h1>

      {/* Header Profil */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
          AH
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ahmed Hassan</h2>
          <p className="text-sm text-gray-500">ahmed.hassan@example.com</p>
          <span className="inline-block mt-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            Propriétaire
          </span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <MenuItem icon={<User size={20} className="text-blue-500" />} label="Informations personnelles" />
        <MenuItem icon={<Settings size={20} className="text-gray-500" />} label="Préférences (Langue, Unités)" />
        <MenuItem icon={<Shield size={20} className="text-emerald-500" />} label="Gestion des accès" />
        <MenuItem icon={<Bell size={20} className="text-purple-500" />} label="Notifications" onClick={() => openModal('notifications')} />
      </div>

      {/* Support Client */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <HelpCircle size={18} className="text-orange-500" /> Support & Aide
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <SupportCard
            icon={<MessageSquare size={24} className="text-blue-500" />}
            title="Chat en direct"
            desc="Réponse en ~2 min"
            onClick={() => openModal('chat')}
          />
          <a href="tel:0522000000" className="block">
            <SupportCard
              icon={<Phone size={24} className="text-emerald-500" />}
              title="Assistance Tél"
              desc="Lun-Ven, 8h-18h"
            />
          </a>
        </div>

        <div className="mt-4 space-y-2">
          <button onClick={() => openModal('tutorials')} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="text-sm font-medium text-gray-700">FAQ & Tutoriels vidéo</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
          <button onClick={() => openModal('diagnostic')} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="text-sm font-medium text-gray-700">Diagnostic à distance</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Logout */}
      <button onClick={onLogout} className="w-full bg-red-50 text-red-600 font-semibold py-3 rounded-xl border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
        <LogOut size={18} /> Déconnexion
      </button>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </div>
  );
}

function SupportCard({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer text-center h-full">
      <div className="flex justify-center mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </div>
  );
}
