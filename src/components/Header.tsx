import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { PrivyWalletModal } from './PrivyWalletModal';
import { AuthModal } from './AuthModal';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import {
  Wallet,
  Bell,
  Activity,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Calendar,
  Settings,
  Users,
  Briefcase,
  User,
  UserPlus,
  LogIn,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  ShieldAlert,
  CreditCard,
  Zap,
  RefreshCw,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { AppView } from '../App';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings?: () => void;
  onOpenAuth?: (mode: 'register' | 'login') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSettings,
  onOpenAuth,
}) => {
  const {
    isConnected,
    walletBalance,
    totalPortfolioValue,
    walletAddress,
    notifications,
    dismissNotification,
    t,
    language,
    currentUser,
    isLoggedIn,
    logoutUser,
    tradingMode,
    setTradingMode,
    toggleTradingMode,
    theme,
    setTheme,
    hideFlag,
    isAdmin,
  } = useTrading();

  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [localAuthModal, setLocalAuthModal] = useState<'register' | 'login' | null>(null);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleOpenAuth = (mode: 'register' | 'login') => {
    setShowUserMenu(false);
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      setLocalAuthModal(mode);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050608]/90 backdrop-blur-md border-b border-[#1e293b]/80 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onNavigate('auth')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="Nexora — Return to Overview & FAQ"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#05080f] border border-[#38bdf8]/40 shadow-[0_0_14px_rgba(56,189,248,0.22)] shrink-0">
              <img
                src="/assets/aistudio/signal-2026-11-19-06-44-03-203_d369e7fa.jpg"
                alt="Nexora DEX"
                className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-200"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white font-sans flex items-center gap-1">
                NEXORA <span className="text-[#00d2ff]">DEX</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500 -mt-1 hidden sm:block">Hyperliquid L1</span>
            </div>
          </div>

          {/* Primary View Switch Tabs */}
          <nav className="flex items-center gap-1 bg-[#0f121a] p-1 rounded-xl border border-[#1e293b]/70">
            <button
              onClick={() => onNavigate('markets')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 group ${
                currentView === 'markets'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={!isLoggedIn ? 'Sign in to access Markets Dashboard' : 'Markets'}
            >
              <span>{t('markets')}</span>
              {!isLoggedIn && (
                <Lock className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
              )}
            </button>
            <button
              onClick={() => onNavigate('trade')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 group ${
                currentView === 'trade'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={!isLoggedIn ? 'Sign in to access Trading Terminal' : 'Trade Terminal'}
            >
              <span>{t('tradeTerminal')}</span>
              {!isLoggedIn && (
                <Lock className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
              )}
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 group ${
                currentView === 'calendar'
                  ? 'bg-[#00d2ff] text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={!isLoggedIn ? 'Sign in to access Profit Calendar' : 'Profit Calendar'}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('profitCalendar')}</span>
              {!isLoggedIn && (
                <Lock className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
              )}
            </button>

            {/* Demo Trading Button in Light Blue Colour (placed right near Profit Calendar) */}
            <button
              onClick={() => {
                if (currentView === 'trade' && tradingMode === 'demo') {
                  toggleTradingMode();
                } else {
                  setTradingMode('demo');
                  onNavigate('trade');
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                tradingMode === 'demo'
                  ? 'bg-[#00d2ff] text-black shadow-[0_0_16px_rgba(0,210,255,0.65)] ring-2 ring-[#00d2ff] ring-offset-1 ring-offset-[#050608]'
                  : 'bg-[#00d2ff]/20 text-[#00d2ff] hover:bg-[#00d2ff]/30 border border-[#00d2ff]/50 shadow-[0_0_10px_rgba(0,210,255,0.2)]'
              }`}
              title="Demo Trading (Exclusive BTC-USDC 50x paper trading with $10,000 virtual USDC)"
            >
              <span className={`w-2 h-2 rounded-full ${tradingMode === 'demo' ? 'bg-black animate-pulse' : 'bg-[#00d2ff]'}`} />
              <span>{t('demoTrading')}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-black ${
                tradingMode === 'demo' ? 'bg-black/25 text-black' : 'bg-[#00d2ff]/20 text-[#00d2ff]'
              }`}>
                50x
              </span>
            </button>
            <button
              onClick={() => onNavigate('copytrading')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 group ${
                currentView === 'copytrading'
                  ? 'bg-[#00d2ff] text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={!isLoggedIn ? 'Sign in to access Copy Trading' : 'Copy Trading'}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('copytrading')}</span>
              {!isLoggedIn && (
                <Lock className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
              )}
            </button>
            <button
              onClick={() => onNavigate('portfolio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 group ${
                currentView === 'portfolio'
                  ? 'bg-[#00d2ff] text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={!isLoggedIn ? 'Sign in to access Portfolio' : 'Portfolio'}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t('portfolio', 'Portfolio')}</span>
              {!isLoggedIn && (
                <Lock className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
              )}
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  currentView === 'admin'
                    ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-black shadow-md shadow-amber-400/20'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-400/30'
                }`}
                title="SuperAdmin Control Panel (anatolimarcenko980@gmail.com)"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t('admin')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </button>
            )}
          </nav>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Always Visible SuperAdmin Gold Badge when user is anatolimarcenko980@gmail.com */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shrink-0 ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-black shadow-amber-400/30 ring-2 ring-amber-400/60'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/50 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              }`}
              title="SuperAdmin Panel (anatolimarcenko980@gmail.com)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="tracking-wide">{t('adminUpper')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </button>
          )}

          {/* Trading Mode Status Badge (Interactive Live / Demo Toggle) */}
          {tradingMode === 'demo' ? (
            <button
              onClick={() => setTradingMode('live')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00d2ff]/20 border border-[#00d2ff]/60 text-[#00d2ff] text-xs font-extrabold shadow-[0_0_12px_rgba(0,210,255,0.35)] hover:brightness-110 transition-all cursor-pointer"
              title="Demo Mode Active (BTC-USDC 50x). Click to switch to Live Trading"
            >
              <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
              <span>{t('demoBtc50x')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setTradingMode('demo');
                onNavigate('trade');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 text-xs font-bold shadow-sm shadow-blue-500/15 hover:bg-blue-600/30 transition-all cursor-pointer"
              title="Live Trading Active. Click to switch to Demo Trading"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>{t('live')}</span>
            </button>
          )}

          {/* Quick Network Status Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#0e111a] border border-[#1e293b] rounded-lg text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shadow-[0_0_6px_#00d2ff]" />
            <span>Hyperliquid L1</span>
          </div>

          {/* User Account / Registration Section */}
          {isLoggedIn && currentUser ? (
            /* Logged in User Menu Pill */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-[#0e111a] hover:bg-[#151a28] border border-[#1e293b] hover:border-[#00d2ff]/40 rounded-xl px-2.5 py-1.5 transition-all text-xs font-sans group select-none"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00d2ff] to-[#0077ff] flex items-center justify-center text-black font-extrabold text-[11px] shadow-sm">
                  {currentUser.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col text-left hidden sm:flex">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white text-[11px] leading-tight max-w-[85px] truncate">
                      {currentUser.username}
                    </span>
                    <span className="text-[9px] font-mono text-[#00d2ff] bg-[#00d2ff]/10 px-1 py-0.2 rounded border border-[#00d2ff]/20 font-bold">
                      {currentUser.vipTier}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {currentUser.id}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a0c12] border border-[#1e293b] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                  <div className="p-2.5 bg-[#121624] rounded-xl border border-[#1e293b] mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs truncate">
                        {currentUser.username}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#00d2ff] bg-[#00d2ff]/15 px-1.5 py-0.5 rounded">
                        {currentUser.vipTier}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 mt-2 border-t border-[#1e293b]">
                      <span>{t('makerFee')}:</span>
                      <span className="text-emerald-400 font-bold">0.00% ({t('free')})</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowWalletModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors font-medium"
                    >
                      <Wallet className="w-4 h-4 text-blue-400" />
                      <span>{t('liveWalletDeposit')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('portfolio');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#151a28] transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-[#00d2ff]" />
                      <span>{t('portfolioBalances')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSettings?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#151a28] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-purple-400" />
                      <span>{t('accountSecurity')}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('admin');
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-500/40 transition-colors font-bold text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          <span>{t('adminPanel')}</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-amber-400 text-black font-extrabold px-1.5 py-0.5 rounded">
                          {t('admin')}
                        </span>
                      </button>
                    )}

                    <div className="pt-1.5 border-t border-[#1e293b]/70">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logoutUser();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logOut')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out / Guest State: Prominent Connect / Sign In Buttons */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0099ff] hover:brightness-110 text-black font-extrabold text-xs shadow-md shadow-[#00d2ff]/20 transition-all flex items-center gap-1.5 group select-none active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{t('connectSignIn')}</span>
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-3 py-1.5 rounded-xl bg-[#0e111a] hover:bg-[#151a28] border border-[#1e293b] hover:border-[#00d2ff]/40 text-slate-200 hover:text-white font-bold text-xs transition-all select-none hidden sm:flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>{t('register')}</span>
              </button>
            </div>
          )}

          {/* Live / Demo Balance Pill */}
          {isLoggedIn ? (
            <button
              onClick={() => setShowWalletModal(true)}
              className={`flex items-center gap-2 bg-[#0e111a] hover:bg-[#151a28] rounded-xl px-3 py-1.5 transition-all text-xs font-mono group border ${
                tradingMode === 'demo'
                  ? 'border-[#00d2ff]/60 hover:border-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.25)]'
                  : 'border-blue-500/40 hover:border-blue-500'
              }`}
              title={
                tradingMode === 'demo'
                  ? 'Virtual Demo Paper Balance (BTC-USDC 50x) — Click to manage'
                  : 'Hyperliquid L1 Live Account Balance — Click to manage or deposit'
              }
            >
              <div className="flex items-center gap-1.5 text-slate-300">
                <Wallet className={`w-3.5 h-3.5 ${tradingMode === 'demo' ? 'text-[#00d2ff]' : 'text-blue-400'}`} />
                <span className="font-semibold tabular-nums text-white">
                  ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${
                    tradingMode === 'demo'
                      ? 'bg-[#00d2ff]/20 text-[#00d2ff] border-[#00d2ff]/50'
                      : 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                  }`}
                >
                  {tradingMode === 'demo' ? t('demoUpper') : t('liveUpper')}
                </span>
              </div>
              {isConnected && walletAddress ? (
                <span className="text-[11px] text-slate-400 hidden md:inline border-l border-[#1e293b] pl-2 font-mono">
                  {walletAddress}
                </span>
              ) : (
                <span className="text-[10px] text-blue-400/80 hidden md:inline border-l border-[#1e293b] pl-2">
                  {t('deposit')} +
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleOpenAuth('login')}
              className="hidden sm:flex items-center gap-1.5 bg-[#0e111a] hover:bg-[#151a28] border border-amber-500/30 hover:border-amber-500/60 rounded-xl px-2.5 py-1.5 transition-all text-xs font-mono text-slate-400 hover:text-slate-200 group"
              title="Sign in or connect wallet to view account balances"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] text-amber-400/90 font-sans">{t('authRequired')}</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-[#0e111a] hover:bg-[#151a28] border border-[#1e293b] text-slate-300 hover:text-white transition-all relative"
              title={t('notifications')}
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00d2ff] rounded-full shadow-[0_0_6px_#00d2ff]" />
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#0c0e15] border border-[#1e293b] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]/60 mb-2">
                  <span className="text-xs font-bold text-white">{t('liveActivityFills')}</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-[#1e293b]/30 space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        {n.type === 'success' ? (
                          <CheckCircle className="w-3.5 h-3.5 text-[#00d2ff] shrink-0 mt-0.5" />
                        ) : n.type === 'warning' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-white">{n.title}</div>
                          <div className="text-[11px] text-slate-400">{n.message}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Theme Mode Toggle (Dark vs Midnight) */}
          <button
            onClick={() => setTheme(theme === 'midnight' ? 'dark' : 'midnight')}
            className="p-2 rounded-xl bg-[#0e111a] hover:bg-[#151a28] border border-[#1e293b] text-slate-300 hover:text-white transition-all group"
            title={theme === 'midnight' ? 'Switch to Dark Theme' : 'Switch to Midnight OLED Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'midnight' ? (
              <Sun className="w-4 h-4 text-purple-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-[#00d2ff] group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Settings Trigger with Flag */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-[#0e111a] hover:bg-[#151a28] border border-[#1e293b] text-slate-300 hover:text-white transition-all group"
              title={t('settings')}
            >
              {!hideFlag && <span className="text-xs leading-none select-none">{currentLangObj.flag}</span>}
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-[#00d2ff] group-hover:rotate-45 transition-transform duration-200" />
            </button>
          )}
        </div>
      </div>

      {/* Privy Wallet Modal */}
      {showWalletModal && (
        <PrivyWalletModal onClose={() => setShowWalletModal(false)} />
      )}



      {/* Local Auth Modal */}
      {localAuthModal && (
        <AuthModal
          initialMode={localAuthModal}
          onClose={() => setLocalAuthModal(null)}
        />
      )}
    </header>
  );
};
