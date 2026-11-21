import React, { useState } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Header } from './components/Header';
import { MarketsDashboard } from './components/MarketsDashboard';
import { TradingView } from './components/TradingView';
import { ProfitCalendar } from './components/ProfitCalendar';
import { CopytradingDashboard } from './components/CopytradingDashboard';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { BottomNavBar } from './components/BottomNavBar';
import { PrivyWalletModal } from './components/PrivyWalletModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { StandaloneAuthGate } from './components/StandaloneAuthGate';
import { AdminPanel } from './components/AdminPanel';
import { Market } from './types/market';
import { Lock } from 'lucide-react';

export type AppView = 'auth' | 'markets' | 'trade' | 'calendar' | 'copytrading' | 'portfolio' | 'admin';

export const PROTECTED_VIEWS: AppView[] = ['markets', 'trade', 'calendar', 'copytrading', 'portfolio', 'admin'];

export const VIEW_TITLES: Record<AppView, string> = {
  auth: 'Overview & FAQ',
  markets: 'Markets Dashboard',
  trade: 'Trading Terminal',
  calendar: 'Profit Calendar',
  copytrading: 'Copy Trading',
  portfolio: 'Portfolio Balances',
  admin: 'SuperAdmin Panel',
};

const AppContent: React.FC = () => {
  const { setSelectedMarket, markets, isLoggedIn, isAdmin, theme, t } = useTrading();
  const [currentView, setCurrentView] = useState<AppView>('trade');
  const [intendedDestination, setIntendedDestination] = useState<AppView>('trade');
  const [authGuardNotice, setAuthGuardNotice] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Mandatory Route Guard Navigator: Redirects unauthenticated users to the Auth flow
  const handleNavigate = (view: AppView) => {
    if (PROTECTED_VIEWS.includes(view) && !isLoggedIn) {
      setIntendedDestination(view);
      setAuthGuardNotice(t('protectedRouteMsg'));
      setAuthMode('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (view === 'admin' && !isAdmin) {
      setAuthGuardNotice(null);
      setCurrentView('trade');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setAuthGuardNotice(null);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'register' | 'login', destination: AppView = 'trade') => {
    setAuthMode(mode);
    setIntendedDestination(destination);
    setShowAuthModal(true);
  };

  const handleSelectMarket = (market: Market) => {
    if (!isLoggedIn) {
      setIntendedDestination('trade');
      setAuthGuardNotice(`${t('protectedRouteMsg')} (${market.symbol})`);
      setAuthMode('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSelectedMarket(market);
    setCurrentView('trade');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTradeMarketId = (marketId: string) => {
    if (!isLoggedIn) {
      setIntendedDestination('trade');
      setAuthGuardNotice(`${t('protectedRouteMsg')} (${marketId})`);
      setAuthMode('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const found = markets.find(m => m.id === marketId || m.symbol === marketId);
    if (found) {
      setSelectedMarket(found);
      setCurrentView('trade');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. STRICT FULL-SCREEN AUTH GATE:
  // If the user is unauthenticated, completely isolate and render ONLY the Standalone Auth & FAQ Gate.
  // The main App Shell (Header with restricted navigation links, BottomNavBar, trading charts, order books)
  // is physically blocked and unmounted from the DOM.
  if (!isLoggedIn) {
    return (
      <StandaloneAuthGate
        initialMode={authMode}
        intendedDestination={intendedDestination}
        authGuardNotice={authGuardNotice}
        onClearNotice={() => setAuthGuardNotice(null)}
        showAuthModal={showAuthModal}
        onOpenAuthModal={(mode) => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
        onCloseAuthModal={() => setShowAuthModal(false)}
        onAuthenticated={(dest) => {
          setAuthGuardNotice(null);
          setCurrentView(dest || intendedDestination || 'trade');
        }}
      />
    );
  }

  // 2. AUTHENTICATED APP SHELL:
  // Rendered exclusively once the user is registered or logged in.
  const effectiveView: AppView = currentView === 'admin' && !isAdmin ? 'trade' : currentView;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-[#f3f6fa] text-slate-900 selection:bg-[#00d2ff]/20 selection:text-[#0077ff]'
          : theme === 'midnight'
          ? 'bg-black text-white selection:bg-[#00d2ff]/20 selection:text-[#00d2ff]'
          : 'bg-[#050608] text-white selection:bg-[#00d2ff]/20 selection:text-[#00d2ff]'
      }`}
    >
      {/* Fixed Top Header with full platform navigation */}
      <Header
        currentView={effectiveView}
        onNavigate={handleNavigate}
        onOpenSettings={() => setShowSettingsDrawer(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 pb-24 md:pb-10">
        {effectiveView === 'auth' ? (
          <AuthPage
            initialMode={authMode}
            intendedDestination={intendedDestination}
            authGuardNotice={authGuardNotice}
            onClearNotice={() => setAuthGuardNotice(null)}
            onBackToMarkets={() => handleNavigate('markets')}
            onNavigateToPage={handleNavigate}
          />
        ) : effectiveView === 'markets' ? (
          <MarketsDashboard
            onSelectMarket={handleSelectMarket}
            onOpenCalendar={() => handleNavigate('calendar')}
            onOpenCopytrading={() => handleNavigate('copytrading')}
            onOpenPortfolio={() => handleNavigate('portfolio')}
            onOpenAuth={handleOpenAuth}
          />
        ) : effectiveView === 'trade' ? (
          <TradingView
            onBackToMarkets={() => handleNavigate('markets')}
            onOpenCalendar={() => handleNavigate('calendar')}
          />
        ) : effectiveView === 'calendar' ? (
          <ProfitCalendar onTradeMarket={handleTradeMarketId} />
        ) : effectiveView === 'copytrading' ? (
          <CopytradingDashboard onTradeMarket={handleTradeMarketId} />
        ) : effectiveView === 'admin' && isAdmin ? (
          <AdminPanel
            onBackToTerminal={() => handleNavigate('trade')}
            onNavigateToCalendar={() => handleNavigate('calendar')}
            onNavigateToCopytrading={() => handleNavigate('copytrading')}
          />
        ) : (
          <PortfolioDashboard
            onTradeMarket={handleTradeMarketId}
            onNavigateToCalendar={() => handleNavigate('calendar')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e293b]/50 bg-[#08090d] py-6 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
            <span className="font-sans font-bold text-slate-300">Nexora DEX</span>
            <span>· {t('poweredByHyperliquid')}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Arbitrum / Hyperliquid L1</span>
            <span>·</span>
            <span>{t('oracleLatency')}</span>
            <span>·</span>
            <span>{t('zeroGasEngine')}</span>
          </div>
        </div>
      </footer>

      {/* Mobile-First Bottom Nav Bar */}
      <BottomNavBar
        currentView={effectiveView}
        onNavigate={handleNavigate}
        onOpenWallet={() => setShowWalletModal(true)}
        onOpenSettings={() => setShowSettingsDrawer(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Global Modals */}
      {showWalletModal && (
        <PrivyWalletModal
          onClose={() => setShowWalletModal(false)}
          onOpenPortfolio={() => setCurrentView('portfolio')}
        />
      )}

      {showSettingsDrawer && (
        <SettingsDrawer
          onClose={() => setShowSettingsDrawer(false)}
          onOpenRegister={() => {
            setShowSettingsDrawer(false);
            handleOpenAuth('register');
          }}
          onOpenAdmin={isAdmin ? () => {
            setShowSettingsDrawer(false);
            handleNavigate('admin');
          } : undefined}
        />
      )}

      {/* Registration & Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <TradingProvider>
      <AppContent />
    </TradingProvider>
  );
}
