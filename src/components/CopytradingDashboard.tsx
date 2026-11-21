import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { MasterTrader } from '../data/copytradingData';
import { Identicon } from './Identicon';
import { SparklineChart } from './SparklineChart';
import { LeaderDetailsView } from './LeaderDetailsView';
import {
  Star,
  Search,
  SlidersHorizontal,
  X,
  Check,
  TrendingUp,
  Shield,
  Zap,
  Info,
  DollarSign,
  AlertCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface CopytradingDashboardProps {
  onTradeMarket?: (marketId: string) => void;
}

export const CopytradingDashboard: React.FC<CopytradingDashboardProps> = ({ onTradeMarket }) => {
  const {
    masterTraders,
    copyTraderById,
    stopCopyingTrader,
    copiedTraders,
    availableBalance,
    t,
  } = useTrading();

  // Selected leader to view details (matching Screenshot 2)
  const [selectedLeader, setSelectedLeader] = useState<MasterTrader | null>(null);

  // Tab: 'all' vs 'favorites'
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>(['0xd839...7255', '0x6859...7e1e']);

  // Copy trading enabled state
  const [copyTradingEnabled, setCopyTradingEnabled] = useState<boolean>(true);
  const [enabledToast, setEnabledToast] = useState<string | null>(null);

  // Search & Filter state
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'pnl' | 'winrate' | 'aum' | 'drawdown'>('pnl');

  // Copy modal state
  const [modalTrader, setModalTrader] = useState<MasterTrader | null>(null);
  const [copyMargin, setCopyMargin] = useState<number>(500);
  const [copySlPercent, setCopySlPercent] = useState<number>(15);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleEnableToggle = () => {
    setCopyTradingEnabled(prev => !prev);
    setEnabledToast(!copyTradingEnabled ? 'Copy Trading activated on Hyperliquid L1' : 'Copy Trading paused');
    setTimeout(() => setEnabledToast(null), 3000);
  };

  const handleOpenCopyModal = (trader: MasterTrader, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setModalTrader(trader);
    setCopyStatus(null);
  };

  const handleConfirmCopy = () => {
    if (!modalTrader) return;
    const res = copyTraderById(modalTrader.id, copyMargin, copySlPercent);
    if (res.success) {
      setCopyStatus(`Successfully copied ${modalTrader.name}! Trades will mirror automatically.`);
      setTimeout(() => {
        setModalTrader(null);
        setCopyStatus(null);
      }, 1500);
    } else {
      setCopyStatus(res.error || 'Failed to copy trader.');
    }
  };

  // Filter & sort
  const filteredTraders = masterTraders
    .filter(t => {
      if (activeTab === 'favorites' && !favorites.includes(t.id)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q) ||
        t.shortAddress.toLowerCase().includes(q) ||
        t.bias.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'pnl') return b.lead30dPnlPercent - a.lead30dPnlPercent;
      if (sortBy === 'winrate') return b.winRate30d - a.winRate30d;
      if (sortBy === 'aum') return b.aum - a.aum;
      if (sortBy === 'drawdown') return a.maxDrawdown30d - b.maxDrawdown30d;
      return 0;
    });

  // If a leader is selected, render LeaderDetailsView
  if (selectedLeader) {
    return (
      <LeaderDetailsView
        trader={selectedLeader}
        onBack={() => setSelectedLeader(null)}
        onCopyTrader={(trader) => handleOpenCopyModal(trader)}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 text-white font-sans animate-in fade-in duration-200">
      {/* Toast Notification */}
      {enabledToast && (
        <div className="fixed top-16 right-4 z-50 bg-[#00d2ff] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Zap className="w-4 h-4 fill-black" />
          <span>{enabledToast}</span>
        </div>
      )}

      {/* Top Header Section matching Screenshot 1 */}
      <div className="flex flex-col gap-2 pt-2">
        {/* Title + Beta Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('copytrading')}
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1e293b]/70 text-slate-300 border border-[#334155]/60 tracking-wider uppercase">
            {t('beta')}
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          {t('copyTradingSubtitle')}
        </p>

        {/* Action Button: Enable Copy Trading */}
        <div className="pt-2">
          <button
            onClick={handleEnableToggle}
            className={`px-5 py-2 rounded-full font-bold text-xs transition-all cursor-pointer shadow-md ${
              copyTradingEnabled
                ? 'bg-[#e2e8f0] text-black hover:bg-white active:scale-95'
                : 'bg-[#1e293b] text-slate-300 hover:bg-[#334155]'
            }`}
          >
            {t('enableCopyTrading')}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar (All Leaders vs My Favorites + Search + Filters) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b202e] pb-3 pt-2">
        {/* Left Tabs */}
        <div className="flex items-center gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative pb-2 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('allLeaders')}</span>
            {activeTab === 'all' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`relative pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('myFavorites')}</span>
            {favorites.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1b2230] text-slate-300 font-mono">
                {favorites.length}
              </span>
            )}
            {activeTab === 'favorites' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Right Action Icons: Search & Filters */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Search Input bar / Circle Button */}
          {showSearchBar ? (
            <div className="flex items-center bg-[#0c0f16] border border-[#232a3b] rounded-full px-3 py-1 text-xs gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchTradersPlaceholder')}
                className="bg-transparent text-white focus:outline-none w-36 sm:w-56 font-mono"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchBar(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchBar(true)}
              className="w-9 h-9 rounded-full bg-[#0d1017] hover:bg-[#161b26] border border-[#1e2536] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title={t('searchTradersPlaceholder')}
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Filters Pill Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(prev => !prev)}
              className="px-4 py-2 rounded-full bg-[#0d1017] hover:bg-[#161b26] border border-[#1e2536] text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('filters')}</span>
            </button>

            {/* Filter Popover */}
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0c0f17] border border-[#232a3b] rounded-2xl shadow-2xl p-2 z-30 text-xs font-mono">
                <span className="text-[10px] text-slate-500 uppercase px-2.5 py-1 block">{t('sortLeadersBy')}</span>
                <button
                  onClick={() => { setSortBy('pnl'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    sortBy === 'pnl' ? 'bg-[#182030] text-[#00d2ff]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{t('pnl30d')}</span>
                  {sortBy === 'pnl' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setSortBy('winrate'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    sortBy === 'winrate' ? 'bg-[#182030] text-[#00d2ff]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{t('winRate')}</span>
                  {sortBy === 'winrate' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setSortBy('aum'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    sortBy === 'aum' ? 'bg-[#182030] text-[#00d2ff]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{t('aum')}</span>
                  {sortBy === 'aum' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setSortBy('drawdown'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    sortBy === 'drawdown' ? 'bg-[#182030] text-[#00d2ff]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{t('lowestDrawdown')}</span>
                  {sortBy === 'drawdown' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid matching Screenshot 1 */}
      {filteredTraders.length === 0 ? (
        <div className="p-12 text-center bg-[#090b10] border border-[#1b202e] rounded-3xl flex flex-col items-center justify-center gap-3">
          <Info className="w-8 h-8 text-slate-500" />
          <h3 className="text-base font-bold text-white">{t('noLeadersFound')}</h3>
          <button
            onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
            className="mt-2 px-4 py-2 rounded-full bg-[#1e293b] text-white text-xs font-semibold hover:bg-[#334155]"
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 sm:gap-5">
          {filteredTraders.map((trader) => {
            const isFav = favorites.includes(trader.id);
            const isCopied = copiedTraders.some(c => c.traderId === trader.id);

            return (
              <div
                key={trader.id}
                onClick={() => setSelectedLeader(trader)}
                className="bg-[#0b0d13] hover:bg-[#0e111a] border border-[#181d2a] hover:border-[#273248] rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl group"
              >
                {/* Card Top: Identicon + Name + Short Address + Star + Copy Button */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Identicon + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Identicon seed={trader.address || trader.name} size={42} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono font-bold text-sm sm:text-base text-white truncate group-hover:text-[#00d2ff] transition-colors">
                        {trader.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono truncate">
                        {trader.shortAddress || trader.name}
                      </span>
                    </div>
                  </div>

                  {/* Right: Star & Copy Pill Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Star Favorite Toggle */}
                    <button
                      onClick={(e) => toggleFavorite(trader.id, e)}
                      className="p-1.5 rounded-full hover:bg-white/5 transition-colors text-slate-500 hover:text-amber-400"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    {/* Copy Pill Button */}
                    <button
                      onClick={(e) => handleOpenCopyModal(trader, e)}
                      className={`px-4 py-1.5 rounded-full font-extrabold text-xs transition-all shadow-sm ${
                        isCopied
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                          : 'bg-[#e2e8f0] text-black hover:bg-white active:scale-95'
                      }`}
                    >
                      {isCopied ? t('copiedBadge') : t('copy')}
                    </button>
                  </div>
                </div>

                {/* Card Middle: 30D PnL Percentage & Dollar Amount & Bias + Mini Sparkline Chart */}
                <div className="grid grid-cols-12 items-center gap-2 py-4">
                  {/* Left Sub-Block (6 cols) */}
                  <div className="col-span-7 flex flex-col justify-center">
                    <span className="text-[11px] text-slate-500 font-sans">
                      {t('leadTrader30dPnl')}
                    </span>
                    <div className="text-2xl font-extrabold text-[#00d2ff] tracking-tight font-mono tabular-nums mt-0.5">
                      {trader.lead30dPnlPercent >= 0 ? '+' : ''}
                      {trader.lead30dPnlPercent.toFixed(2)}%
                    </div>
                    <div className="text-xs font-mono text-slate-300 tabular-nums font-semibold">
                      {trader.lead30dPnlAmount >= 0 ? '+' : '-'}$
                      {Math.abs(trader.lead30dPnlAmount).toLocaleString()}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`text-[11px] font-mono font-medium ${
                          trader.bias.toLowerCase().includes('bearish')
                            ? 'text-[#f87171]'
                            : trader.bias.toLowerCase().includes('bullish')
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {trader.bias}
                      </span>
                    </div>
                  </div>

                  {/* Right Sub-Block (5 cols) Sparkline Chart */}
                  <div className="col-span-5 flex justify-end items-center pr-1">
                    <SparklineChart data={trader.sparkline} width={130} height={46} />
                  </div>
                </div>

                {/* Card Bottom: 5 Key Metrics Table (Matching Screenshot 1) */}
                <div className="border-t border-[#161a26] pt-3 flex flex-col gap-1.5 text-xs font-mono">
                  {/* Volume 30d */}
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-500">{t('volume30d')}</span>
                    <span className="text-slate-200 tabular-nums font-medium">{trader.volume30d}</span>
                  </div>

                  {/* AUM */}
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-500">{t('aum')}</span>
                    <span className="text-slate-200 tabular-nums font-medium">{trader.aumFormatted}</span>
                  </div>

                  {/* Avg trades / day */}
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-500">{t('avgTradesPerDay')}</span>
                    <span className="text-slate-200 tabular-nums font-medium">{trader.avgTradesPerDay}</span>
                  </div>

                  {/* Win rate 30d */}
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-500">{t('winRate30d')}</span>
                    <span className="text-slate-200 tabular-nums font-medium">{trader.winRate30d.toFixed(2)}%</span>
                  </div>

                  {/* Max drawdown 30d */}
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-500">{t('maxDrawdown30d')}</span>
                    <span className="text-slate-200 tabular-nums font-medium">{trader.maxDrawdown30d.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Copy Modal */}
      {modalTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0a0d14] border border-[#212631] rounded-3xl shadow-2xl p-6 font-sans">
            <button
              onClick={() => setModalTrader(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <Identicon seed={modalTrader.address || modalTrader.name} size={44} />
              <div className="flex flex-col">
                <h3 className="text-base font-extrabold text-white font-mono">
                  {t('copy')} {modalTrader.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {t('roi30d')}: +{modalTrader.lead30dPnlPercent}% · {t('winRate')}: {modalTrader.winRate30d}%
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4 mt-5">
              {/* Margin Allocation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t('allocationMarginUsdc')}</span>
                  <span className="text-slate-500 font-mono">${availableBalance.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">$</span>
                  <input
                    type="number"
                    value={copyMargin}
                    onChange={(e) => setCopyMargin(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2 pl-7 pr-3 text-white font-mono text-sm focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>

              {/* Stop Loss Guard */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t('copyStopLossDrawdown')}</span>
                  <span className="text-slate-400 font-mono">{copySlPercent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={copySlPercent}
                  onChange={(e) => setCopySlPercent(parseInt(e.target.value))}
                  className="w-full accent-[#00d2ff]"
                />
              </div>

              {/* Status Message */}
              {copyStatus && (
                <div className="p-3 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-mono">
                  {copyStatus}
                </div>
              )}

              {/* Action */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setModalTrader(null)}
                  className="flex-1 py-2.5 rounded-full bg-[#151924] hover:bg-[#1f2536] text-slate-300 font-semibold text-xs"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleConfirmCopy}
                  className="flex-1 py-2.5 rounded-full bg-[#e2e8f0] hover:bg-white text-black font-extrabold text-xs shadow-lg active:scale-95 transition-all"
                >
                  {t('confirmCopy')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
