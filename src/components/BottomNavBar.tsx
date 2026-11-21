import React from 'react';
import { useTrading } from '../context/TradingContext';
import { LayoutGrid, CandlestickChart, Calendar, Users, Settings, Briefcase, UserPlus, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { AppView } from '../App';
import { SUPERADMIN_EMAIL } from '../types/user';

interface BottomNavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  onOpenAuth?: (mode: 'register' | 'login') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onNavigate,
  onOpenWallet,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { positions, t, isLoggedIn, currentUser, isAdmin } = useTrading();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-md border-t border-[#1e293b] md:hidden px-2 py-1.5">
      <div className={`grid ${isAdmin ? 'grid-cols-7' : 'grid-cols-6'} items-center`}>
        {/* Markets Tab */}
        <button
          onClick={() => onNavigate('markets')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            currentView === 'markets' ? 'text-[#00d2ff]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutGrid className="w-4 h-4 mb-1" />
            {!isLoggedIn && (
              <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight truncate max-w-[50px]">{t('markets')}</span>
        </button>

        {/* Trade Terminal Tab */}
        <button
          onClick={() => onNavigate('trade')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            currentView === 'trade' ? 'text-[#00d2ff]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CandlestickChart className="w-4 h-4 mb-1" />
            {!isLoggedIn && (
              <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight truncate max-w-[50px]">{t('trade')}</span>
        </button>

        {/* Profit Calendar Tab */}
        <button
          onClick={() => onNavigate('calendar')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            currentView === 'calendar' ? 'text-[#00d2ff]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Calendar className="w-4 h-4 mb-1" />
            {!isLoggedIn && (
              <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight truncate max-w-[50px]">{t('calendar')}</span>
        </button>

        {/* Copytrading Tab */}
        <button
          onClick={() => onNavigate('copytrading')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            currentView === 'copytrading' ? 'text-[#00d2ff]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className="w-4 h-4 mb-1" />
            {!isLoggedIn && (
              <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight truncate max-w-[50px]">{t('copytrading')}</span>
        </button>

        {/* Portfolio Tab */}
        <button
          onClick={() => onNavigate('portfolio')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative ${
            currentView === 'portfolio' ? 'text-[#00d2ff]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Briefcase className="w-4 h-4 mb-1" />
            {!isLoggedIn && (
              <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight truncate max-w-[50px]">{t('portfolio', 'Portfolio')}</span>
        </button>

        {/* Admin Tab (Exclusive to SuperAdmins) */}
        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex flex-col items-center justify-center py-1 transition-all relative ${
              currentView === 'admin' ? 'text-amber-400 font-bold' : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4 mb-1 text-amber-400" />
            <span className="text-[9px] font-bold tracking-tight truncate max-w-[50px]">{t('admin')}</span>
          </button>
        )}

        {/* Settings or Register Tab */}
        {!isLoggedIn && onOpenAuth ? (
          <button
            onClick={() => onOpenAuth('login')}
            className="flex flex-col items-center justify-center py-1 text-[#00d2ff] hover:brightness-125 transition-all"
          >
            <LogIn className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-bold tracking-tight truncate max-w-[50px]">{t('signIn')}</span>
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Settings className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-medium tracking-tight truncate max-w-[50px]">{t('settings')}</span>
          </button>
        )}
      </div>
    </nav>
  );
};
