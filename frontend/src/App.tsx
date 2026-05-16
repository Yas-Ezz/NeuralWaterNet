import React, { useState, useEffect } from 'react';
import { Home, BarChart2, Sliders, Clock, User, X } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Dashboard } from './components/Dashboard';
import { Tracking } from './components/Tracking';
import { Control } from './components/Control';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { Chat } from './components/Chat';
import { Diagnostic } from './components/Diagnostic';
import { Tutorials } from './components/Tutorials';
import { Notifications } from './components/Notifications';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur de déconnexion", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <Auth onGuestLogin={() => setIsGuest(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard openModal={setActiveModal} />;
      case 'tracking':
        return <Tracking />;
      case 'control':
        return <Control />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile onLogout={handleLogout} openModal={setActiveModal} />;
      default:
        return <Dashboard openModal={setActiveModal} />;
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;
    let Content = null;
    let title = "";
    switch (activeModal) {
      case 'chat': Content = Chat; title = "Support Client"; break;
      case 'diagnostic': Content = Diagnostic; title = "Diagnostic à distance"; break;
      case 'tutorials': Content = Tutorials; title = "Tutoriels Vidéo"; break;
      case 'notifications': Content = Notifications; title = "Notifications"; break;
    }
    if (!Content) return null;

    return (
      <div className="fixed inset-0 z-50 flex justify-center bg-gray-900/50 backdrop-blur-sm">
        <div className="w-full max-w-md bg-gray-50 h-full relative flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button onClick={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
              <X size={20}/>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Content />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">
        {/* Header / Content Area */}
        <div className="flex-1 overflow-y-auto pb-20">
          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 pb-safe">
          <NavItem
            icon={<Home size={24} />}
            label="Accueil"
            isActive={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={<BarChart2 size={24} />}
            label="Suivi"
            isActive={activeTab === 'tracking'}
            onClick={() => setActiveTab('tracking')}
          />
          <NavItem
            icon={<Sliders size={24} />}
            label="Contrôle"
            isActive={activeTab === 'control'}
            onClick={() => setActiveTab('control')}
          />
          <NavItem
            icon={<Clock size={24} />}
            label="Historique"
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
          <NavItem
            icon={<User size={24} />}
            label="Profil"
            isActive={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </div>
        {renderModal()}
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
        isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
