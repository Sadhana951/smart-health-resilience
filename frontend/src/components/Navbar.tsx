import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { UserRole, Language } from '../types';
import {
  Activity,
  MapPin,
  Pill,
  TrendingUp,
  ShieldAlert,
  ArrowLeftRight,
  Bot,
  Cpu,
  Search,
  Mic,
  Bell,
  User,
  Menu,
  X,
  Play,
  Zap
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenVoiceAssistant,
  onOpenNotifications
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, setRole } = useAuth();
  const { notifications, isConnected } = useWebSocket();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navItems = [
    { label: t('nav_overview'), path: '/dashboard', icon: Activity },
    { label: t('nav_network'), path: '/phc-network', icon: MapPin },
    { label: t('nav_inventory'), path: '/inventory', icon: Pill },
    { label: t('nav_forecasts'), path: '/forecasts', icon: TrendingUp },
    { label: t('nav_alerts'), path: '/alerts', icon: ShieldAlert, badge: '5' },
    { label: t('nav_redistribution'), path: '/redistribution', icon: ArrowLeftRight },
    { label: t('nav_assistant'), path: '/assistant', icon: Bot },
    { label: t('nav_federated'), path: '/federated-learning', icon: Cpu },
    { label: t('nav_simulation'), path: '/simulation', icon: Zap }
  ];

  const roles: { key: UserRole; label: string }[] = [
    { key: 'ADMIN', label: 'Apex Admin (NHM)' },
    { key: 'STATE_OFFICER', label: 'State Officer (Odisha)' },
    { key: 'DISTRICT_OFFICER', label: 'District Officer (Cuttack)' },
    { key: 'PHC_WORKER', label: 'PHC Pharmacist (Salipur)' }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-background-deep/95 border-b border-slate-800/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-teal-500/20 border border-cyan-500/50 shadow-glow-cyan">
                <Activity className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
              </div>
              <div>
                <span className="text-base font-extrabold tracking-wider text-white flex items-center gap-1.5 font-mono">
                  SMART HEALTH
                  <span className="text-[10px] font-normal uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    RESILIENCE
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block tracking-tight font-sans">
                  India Primary Healthcare Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Command Palette Button */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-background-card hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs transition-colors"
              title="Global Search (Ctrl + K)"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden md:inline font-mono text-[11px] text-slate-400">
                Search...
              </span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-slate-800 rounded border border-slate-700 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Multilingual Voice Assistant Button */}
            <button
              onClick={onOpenVoiceAssistant}
              className="p-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-all shadow-glow-cyan/20"
              title="Voice Assistant (English / Hindi / Odia)"
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-background-card text-xs font-mono text-slate-300 hover:text-white uppercase transition-colors"
              >
                {language}
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-background-panel border border-slate-700 shadow-xl py-1 z-50 text-xs font-mono">
                  <button
                    onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${language === 'en' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${language === 'hi' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    onClick={() => { setLanguage('or'); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${language === 'or' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
                  >
                    ଓଡ଼ିଆ (Odia)
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg border border-slate-800 bg-background-card text-slate-300 hover:text-white transition-colors"
              title="Live Alerts Feed"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              )}
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-800 bg-background-card hover:border-slate-700 text-xs transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px]">
                  {user.avatar}
                </div>
                <div className="text-left hidden lg:block leading-tight">
                  <span className="text-xs font-semibold text-slate-200 block truncate max-w-[110px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono block">
                    {user.role}
                  </span>
                </div>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-background-panel border border-slate-700 shadow-2xl p-2 z-50 text-xs">
                  <div className="p-2 border-b border-slate-800 mb-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Active User Session
                    </span>
                    <span className="font-bold text-white block">{user.name}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{user.jurisdiction}</span>
                  </div>

                  <span className="text-[10px] uppercase font-mono text-slate-500 px-2 py-1 block">
                    Switch Role for Demo:
                  </span>
                  {roles.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => {
                        setRole(r.key);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                        user.role === r.key
                          ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{r.label}</span>
                      {user.role === r.key && <span className="text-cyan-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-background-panel px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
