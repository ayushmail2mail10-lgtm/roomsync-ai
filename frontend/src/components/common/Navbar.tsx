import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Users, 
  Receipt, 
  MessageSquare, 
  ShieldCheck, 
  User as UserIcon,
  Sparkles,
  Zap,
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Building2,
  BedDouble,
  ShieldAlert,
  FileCheck,
  AlertTriangle,
  Settings,
  Plus,
  ChevronDown,
  Check,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, profile, verification, logout, switchRoleDemo, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Role-Specific Navigation items based on authenticated role
  const getRoleNavItems = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Admin Dashboard', icon: ShieldAlert, badge: 'Superadmin' },
          { id: 'dashboard', label: 'Users & Roles', icon: Users },
          { id: 'dashboard', label: 'KYC Verifications', icon: FileCheck },
          { id: 'dashboard', label: 'Incident Reports', icon: AlertTriangle },
          { id: 'profile', label: 'System Settings', icon: Settings },
        ];
      case 'property_owner':
        return [
          { id: 'dashboard', label: 'Owner Dashboard', icon: Home },
          { id: 'dashboard', label: 'My Properties', icon: Building2 },
          { id: 'dashboard', label: 'Applications', icon: Users, badge: 'New' },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'safety', label: 'Verification', icon: ShieldCheck },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
      case 'flat_owner':
        return [
          { id: 'dashboard', label: 'Flat Dashboard', icon: Home },
          { id: 'dashboard', label: 'Vacant Rooms', icon: BedDouble },
          { id: 'explore', label: 'Find Flatmates', icon: Users, badge: 'AI' },
          { id: 'expenses', label: 'Shared Expenses', icon: Receipt },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
      case 'tenant':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'explore', label: 'Find Roommates', icon: Users, badge: 'AI' },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'expenses', label: 'Rent & Bills', icon: Receipt },
          { id: 'safety', label: 'Trust & Safety', icon: ShieldCheck },
          { id: 'profile', label: 'Preferences', icon: UserIcon },
        ];
    }
  };

  const navItems = getRoleNavItems(user?.role);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setRoleSwitcherOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setActiveTab('landing');
  };

  const handleRoleSwitch = async (targetRole: UserRole) => {
    setIsSwitchingRole(true);
    setRoleSwitcherOpen(false);
    try {
      await switchRoleDemo(targetRole);
      setActiveTab('dashboard');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-[#FFD600]/15 text-[#FFD600] border-[#FFD600]/30';
      case 'property_owner':
        return 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30';
      case 'flat_owner':
        return 'bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/30';
      case 'tenant':
      default:
        return 'bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E283A] bg-[#06080D]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F59B] rounded-xl p-1"
            tabIndex={0}
            role="button"
            aria-label="RoomSync AI Home"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavClick(user ? 'dashboard' : 'landing'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#111722] to-[#161F2E] border border-[#00F59B]/40 flex items-center justify-center shadow-neon-green/20 shadow-md group-hover:border-[#00F59B] transition-all">
              <Zap className="w-5 h-5 text-[#00F59B] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#F5F7FA] flex items-center gap-1.5 leading-none">
                RoomSync <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30">AI</span>
              </span>
              <span className="text-[9px] text-[#929BAA] block font-mono tracking-widest mt-0.5 uppercase">
                CO-LIVING INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F59B] ${
                      isActive 
                        ? 'bg-[#161F2E] text-[#00F59B] border border-[#00F59B]/40 shadow-sm' 
                        : 'text-[#929BAA] hover:text-[#F5F7FA] hover:bg-[#111722] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-[#00F59B]' : 'text-[#929BAA]'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#00F59B] rounded-full shadow-[0_0_8px_#00F59B]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right User Bar / Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Interactive Role Switcher Pill (Development Mode Only) */}
            {user && import.meta.env.DEV && (
              <div className="relative">
                <button
                  onClick={() => setRoleSwitcherOpen(prev => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all focus-visible:outline-none ${getRoleBadgeColor(user.role)} hover:opacity-90`}
                  title="[DEV ONLY] Switch between Indian startup personas to test role-specific dashboards"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  <span className="capitalize">{user.role?.replace('_', ' ')}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${roleSwitcherOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Role Switcher Dropdown */}
                <AnimatePresence>
                  {roleSwitcherOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111722] border border-[#1E283A] shadow-2xl p-2 space-y-1 z-50"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#929BAA] border-b border-[#1E283A] mb-1">
                        Select Platform Role (Real Auth)
                      </div>

                      {/* 1. Tenant */}
                      <button
                        onClick={() => handleRoleSwitch('tenant')}
                        disabled={isSwitchingRole}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                          user.role === 'tenant' ? 'bg-[#161F2E] text-[#00F59B]' : 'text-[#F5F7FA] hover:bg-[#161F2E]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>Tenant / Room Seeker</span>
                            {user.role === 'tenant' && <Check className="w-3.5 h-3.5 text-[#00F59B]" />}
                          </div>
                          <div className="text-[10px] text-[#929BAA] font-mono">Rohan Verma (Razorpay)</div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00F59B]/10 text-[#00F59B]">Bengaluru</span>
                      </button>

                      {/* 2. Flat Owner */}
                      <button
                        onClick={() => handleRoleSwitch('flat_owner')}
                        disabled={isSwitchingRole}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                          user.role === 'flat_owner' ? 'bg-[#161F2E] text-[#00F59B]' : 'text-[#F5F7FA] hover:bg-[#161F2E]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>Existing Flat Owner</span>
                            {user.role === 'flat_owner' && <Check className="w-3.5 h-3.5 text-[#00F59B]" />}
                          </div>
                          <div className="text-[10px] text-[#929BAA] font-mono">Arjun Mehta (Swiggy)</div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00F59B]/10 text-[#00F59B]">HSR Sec 2</span>
                      </button>

                      {/* 3. Property Owner */}
                      <button
                        onClick={() => handleRoleSwitch('property_owner')}
                        disabled={isSwitchingRole}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                          user.role === 'property_owner' ? 'bg-[#00F0FF]/10 text-[#00F0FF]' : 'text-[#F5F7FA] hover:bg-[#161F2E]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>Property Owner / Landlord</span>
                            {user.role === 'property_owner' && <Check className="w-3.5 h-3.5 text-[#00F0FF]" />}
                          </div>
                          <div className="text-[10px] text-[#929BAA] font-mono">Sneha Kulkarni (Bain & Co)</div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF]">Powai</span>
                      </button>

                      {/* 4. Admin */}
                      <button
                        onClick={() => handleRoleSwitch('admin')}
                        disabled={isSwitchingRole}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left border-t border-[#1E283A] mt-1 pt-2 ${
                          user.role === 'admin' ? 'bg-[#FFD600]/10 text-[#FFD600]' : 'text-[#F5F7FA] hover:bg-[#161F2E]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>Platform Superadmin</span>
                            {user.role === 'admin' && <Check className="w-3.5 h-3.5 text-[#FFD600]" />}
                          </div>
                          <div className="text-[10px] text-[#929BAA] font-mono">RoomSync System Admin</div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FFD600]/10 text-[#FFD600]">RBAC Lock</span>
                      </button>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* If Authenticated: Profile Avatar with Dropdown */}
            {user ? (
              <div className="relative">
                <div 
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 pl-2 border-l border-[#1E283A] cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F59B] rounded-xl py-1 px-1.5"
                  tabIndex={0}
                  role="button"
                  aria-label="User Profile Menu"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setUserMenuOpen(prev => !prev); }}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-xl object-cover border border-[#1E283A] group-hover:border-[#00F59B] transition-all"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00F59B] border-2 border-[#06080D]"></span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-[#F5F7FA] leading-tight group-hover:text-[#00F59B] transition-colors">
                      {user.full_name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-[#929BAA] leading-tight font-mono capitalize">
                      {user.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#111722] border border-[#1E283A] shadow-2xl p-2 space-y-1 z-50"
                    >
                      <button
                        onClick={() => handleNavClick('profile')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#F5F7FA] hover:bg-[#161F2E] transition-colors text-left"
                      >
                        <UserIcon className="w-4 h-4 text-[#00F59B]" />
                        <span>Profile & Settings</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('safety')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#F5F7FA] hover:bg-[#161F2E] transition-colors text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Trust & Safety</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left border-t border-[#1E283A] mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-[#1E283A]">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F5F7FA] hover:bg-[#111722] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#06080D] bg-[#00F59B] hover:bg-[#05FFA1] transition-all shadow-sm"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl text-[#929BAA] hover:text-[#F5F7FA] hover:bg-[#111722] border border-[#1E283A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F59B]"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[#1E283A] bg-[#06080D]/95 px-4 py-4 space-y-1 overflow-hidden"
          >
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#161F2E] text-[#00F59B] border border-[#00F59B]/40' 
                      : 'text-[#929BAA] hover:text-[#F5F7FA] hover:bg-[#111722]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F59B]' : 'text-[#929BAA]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {user ? (
              <div className="pt-3 border-t border-[#1E283A] mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#929BAA]">
                  <span>Signed in as {user.full_name}</span>
                  <span className="text-emerald-400 font-mono text-[10px] capitalize">
                    {user.role?.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-[#1E283A] mt-2 flex gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#F5F7FA] bg-[#111722] border border-[#1E283A]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-[#06080D] bg-[#00F59B]"
                >
                  Register
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Quick-Access Bar */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#06080D]/95 backdrop-blur-xl border-t border-[#1E283A] flex items-center justify-around py-2 px-2 shadow-2xl">
          {navItems.slice(0, 5).map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'text-[#00F59B]' : 'text-[#929BAA]'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] whitespace-nowrap">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
