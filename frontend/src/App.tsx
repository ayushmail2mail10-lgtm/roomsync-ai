import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TenantDashboard } from './pages/dashboards/TenantDashboard';
import { PropertyOwnerDashboard } from './pages/dashboards/PropertyOwnerDashboard';
import { FlatOwnerDashboard } from './pages/dashboards/FlatOwnerDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ExploreRoommates } from './pages/ExploreRoommates';
import { ExpensesPage } from './pages/ExpensesPage';
import { MessagesPage } from './pages/MessagesPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { ProfilePage } from './pages/ProfilePage';
import { RoommateMatch } from './types';
import { Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [chatTargetMatch, setChatTargetMatch] = useState<RoommateMatch | null>(null);

  const handleOpenChatWith = (match: RoommateMatch) => {
    setChatTargetMatch(match);
    setActiveTab('messages');
  };

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'property_owner':
        return (
          <PropertyOwnerDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenChatWith={handleOpenChatWith}
          />
        );
      case 'flat_owner':
        return (
          <FlatOwnerDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenChatWith={handleOpenChatWith}
          />
        );
      case 'tenant':
      default:
        return (
          <TenantDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenChatWith={handleOpenChatWith}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#06080D] text-[#F5F7FA] flex flex-col font-sans selection:bg-[#00F59B] selection:text-[#06080D]">
      
      {/* Top Navbar with Role-Aware Navigation & Live Persona Switcher */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Tab Routing */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onEnterApp={() => setActiveTab('dashboard')}
            onExploreMatches={() => setActiveTab('explore')}
            onNavigateToLogin={() => setActiveTab('login')}
            onNavigateToRegister={() => setActiveTab('register')}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage
            onNavigateToRegister={() => setActiveTab('register')}
            onLoginSuccess={() => setActiveTab('dashboard')}
            onNavigateHome={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage
            onNavigateToLogin={() => setActiveTab('login')}
            onRegisterSuccess={() => setActiveTab('dashboard')}
            onNavigateHome={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'dashboard' && renderDashboardByRole()}

        {activeTab === 'explore' && (
          <ExploreRoommates
            onOpenChatWith={handleOpenChatWith}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesPage />
        )}

        {activeTab === 'messages' && (
          <MessagesPage
            initialTargetMatch={chatTargetMatch}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyCenterPage />
        )}

        {activeTab === 'profile' && (
          <ProfilePage />
        )}
      </main>

      {/* Global Modern Startup Footer (for authenticated inner pages) */}
      {activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'register' && (
        <footer className="border-t border-[#1E283A] bg-[#06080D] py-8 px-4 sm:px-6 lg:px-8 mt-12 mb-14 md:mb-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#929BAA]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#111722] border border-[#00F59B]/40 flex items-center justify-center text-[#00F59B]">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-[#F5F7FA] tracking-wide">
                RoomSync AI
              </span>
              <span>— Modern Indian Co-Living & Shared Rent Intelligence</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-[#00F59B]">Bengaluru (HSR • Koramangala)</span>
              <span>•</span>
              <span className="text-[#00F0FF]">Mumbai (Powai • Bandra)</span>
              <span>•</span>
              <span className="text-[#FFD600]">Gurgaon (Cyber City)</span>
            </div>

            <div className="text-[11px] text-[#5F697A] font-mono">
              © 2026 RoomSync Technologies Pvt Ltd.
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
