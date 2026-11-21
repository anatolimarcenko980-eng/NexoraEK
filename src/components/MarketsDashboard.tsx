import React, { useState, useMemo } from 'react';
import { Market, MarketCategory } from '../types/market';
import { useTrading } from '../context/TradingContext';
import { formatPrice, formatCompactUsd } from '../utils/tradingMath';
import { Search, Star, TrendingUp, TrendingDown, Flame, Zap, ArrowUpRight, ArrowDownRight, Layers, BarChart2, Calendar, Users, Briefcase, UserPlus } from 'lucide-react';
import { CryptoLogo } from './CryptoLogo';

interface MarketsDashboardProps {
  onSelectMarket: (market: Market) => void;
  onOpenCalendar?: () => void;
  onOpenCopytrading?: () => void;
  onOpenPortfolio?: () => void;
  onOpenAuth?: (mode: 'register' | 'login') => void;
}

type MetricFilter = 'all' | 'gainers' | 'losers' | 'volume' | 'favorites';

export const MarketsDashboard: React.FC<MarketsDashboardProps> = ({
  onSelectMarket,
  onOpenCalendar,
  onOpenCopytrading,
  onOpenPortfolio,
  onOpenAuth,
}) => {
  const { markets, lastPriceFlash, favorites, toggleFavorite, currentUser, isLoggedIn, t, tradingMode, setTradingMode } = useTrading();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'price'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Summary Metrics
  const totalVolume = useMemo(() => {
    return markets.reduce((sum, m) => sum + m.volume24h, 0);
  }, [markets]);

  const topGainer = useMemo(() => {
    return [...markets].sort((a, b) => b.change24h - a.change24h)[0];
  }, [markets]);

  const topVolume = useMemo(() => {
    return [...markets].sort((a, b) => b.volume24h - a.volume24h)[0];
  }, [markets]);

  // Filtered and Sorted Markets
  const filteredMarkets = useMemo(() => {
    return markets.filter(market => {
      // Category match
      if (selectedCategory !== 'all' && market.category !== selectedCategory) {
        return false;
      }
      
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSymbol = market.symbol.toLowerCase().includes(q);
        const matchesName = market.name.toLowerCase().includes(q);
        const matchesBase = market.baseAsset.toLowerCase().includes(q);
        if (!matchesSymbol && !matchesName && !matchesBase) return false;
      }

      // Metric Filter
      if (metricFilter === 'favorites' && !favorites.includes(market.id)) {
        return false;
      }
      if (metricFilter === 'gainers' && market.change24h <= 0) {
        return false;
      }
      if (metricFilter === 'losers' && market.change24h >= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === 'volume') {
        valA = a.volume24h;
        valB = b.volume24h;
      } else if (sortBy === 'change') {
        valA = a.change24h;
        valB = b.change24h;
      } else if (sortBy === 'price') {
        valA = a.price;
        valB = b.price;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [markets, selectedCategory, searchQuery, metricFilter, favorites, sortBy, sortOrder]);

  // Featured Hot Assets Cards
  const hotAssets = useMemo(() => {
    return markets.filter(m => m.isHot).slice(0, 4);
  }, [markets]);

  const handleSort = (type: 'volume' | 'change' | 'price') => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Volume & High-Visibility Market Highlights Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Volume */}
        <div className="bg-[#0a0c10] border border-[#1e293b]/70 rounded-xl p-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('dexVolume24h')}</span>
            <BarChart2 className="w-3.5 h-3.5 text-[#00d2ff]" />
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {formatCompactUsd(totalVolume)}
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-1">
            {markets.length} {t('markets')}
          </div>
        </div>

        {/* Top Volume Asset */}
        {topVolume && (
          <div
            onClick={() => onSelectMarket(topVolume)}
            className="bg-[#0a0c10] border border-[#1e293b]/70 hover:border-[#00d2ff]/40 rounded-xl p-3.5 shadow-lg cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>{t('topVolume')}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#00d2ff] transition-colors">{t('trade')} →</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-white text-base font-mono">{topVolume.symbol}</span>
              <span className="font-mono text-xs text-slate-300">{formatCompactUsd(topVolume.volume24h)}</span>
            </div>
            <div className="text-[11px] font-mono text-[#00d2ff] mt-1 font-semibold">
              {formatPrice(topVolume.price, topVolume.precision)} (+{topVolume.change24h}%)
            </div>
          </div>
        )}

        {/* Top Gainer Asset */}
        {topGainer && (
          <div
            onClick={() => onSelectMarket(topGainer)}
            className="bg-[#0a0c10] border border-[#1e293b]/70 hover:border-[#00d2ff]/40 rounded-xl p-3.5 shadow-lg cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#00d2ff]" />
                <span>{t('topGainer')}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#00d2ff] transition-colors">{t('trade')} →</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-white text-base font-mono">{topGainer.symbol}</span>
              <span className="font-mono text-xs font-bold text-[#00d2ff]">+{topGainer.change24h}%</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 mt-1">
              {formatPrice(topGainer.price, topGainer.precision)}
            </div>
          </div>
        )}

        {/* Profit Calendar Highlight Card */}
        <div
          onClick={onOpenCalendar}
          className="bg-[#0a0c10] border border-[#1e293b]/70 hover:border-[#00d2ff]/50 rounded-xl p-3.5 shadow-lg flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1 text-[#00d2ff]">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-semibold text-white">{t('profitCalendar')}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#00d2ff] transition-colors">
              →
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-[#00d2ff] font-mono">
              +68.2% {t('winRate')}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
            +$56 / -$12
          </div>
        </div>
      </div>

      {/* Featured Quick Tickers Horizontal Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {hotAssets.map((asset) => {
          const isUp = asset.change24h >= 0;
          return (
            <div
              key={asset.id}
              onClick={() => onSelectMarket(asset)}
              className="bg-[#0a0c10] border border-[#1e293b]/60 hover:border-[#00d2ff]/50 rounded-xl px-3.5 py-2.5 flex items-center gap-3 shrink-0 cursor-pointer transition-all shadow-md group"
            >
              <CryptoLogo symbol={asset.baseAsset} size="sm" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white font-mono text-xs">{asset.symbol}</span>
                  {asset.leverageMax > 1 && (
                    <span className="text-[9px] font-mono font-bold text-[#00d2ff] px-1 bg-[#00d2ff]/10 rounded">
                      {asset.leverageMax}x
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-sans">{asset.name}</span>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs font-semibold text-white">
                  {formatPrice(asset.price, asset.precision)}
                </div>
                <div className={`text-[10px] font-bold flex items-center justify-end ${isUp ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{isUp ? '+' : ''}{asset.change24h}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Mode Notice Banner in Markets */}
      {tradingMode === 'demo' && (
        <div className="bg-gradient-to-r from-[#00d2ff]/20 via-[#0a1526] to-[#00d2ff]/10 border border-[#00d2ff]/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg shadow-[#00d2ff]/10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff] animate-ping" />
            <div>
              <span className="font-extrabold text-[#00d2ff] font-mono block text-sm uppercase">
                {t('demoPaperTrading')} · {t('demoBtc50x')}
              </span>
              <span className="text-slate-300">
                {t('demoBannerMarkets')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const btc = markets.find(m => m.id === 'BTC-USDC') || markets[0];
                onSelectMarket(btc);
              }}
              className="px-4 py-2 rounded-xl bg-[#00d2ff] hover:bg-[#38bdf8] text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              {t('trade')} BTC-USDC 50x
            </button>
            <button
              onClick={() => setTradingMode('live')}
              className="px-3.5 py-2 rounded-xl bg-[#141a27] hover:bg-[#1d2638] border border-[#232c3f] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('backToLive')}
            </button>
          </div>
        </div>
      )}


      {/* Registration Callout Banner for guests / unauthenticated users */}
      {!isLoggedIn && onOpenAuth && (
        <div className="bg-gradient-to-r from-[#00d2ff]/10 via-[#0a1222] to-[#120a22] border border-[#00d2ff]/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-cyan-400 p-0.5 flex-shrink-0 shadow-md shadow-[#00d2ff]/20">
              <div className="w-full h-full bg-[#050912] rounded-[10px] flex items-center justify-center text-[#00d2ff]">
                <UserPlus className="w-5 h-5 text-[#00d2ff]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  {t('signInOrRegister')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 font-bold">
                  0% {t('makerFee')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('readyToTradeSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0099ff] hover:brightness-110 text-black font-extrabold text-xs shadow-md shadow-[#00d2ff]/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('createAccount')}</span>
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 rounded-xl bg-[#10141f] hover:bg-[#161d2d] border border-[#1e293b] text-slate-300 hover:text-white font-bold text-xs transition-all"
            >
              <span>{t('logIn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Markets Explorer Toolbar */}
      <div className="flex flex-col gap-3 bg-[#08090d] border border-[#1e293b]/70 rounded-2xl p-4 shadow-xl">
        {/* Search Bar & Primary Category Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Instant Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchMarkets')}
              className="w-full bg-[#10131c] border border-[#1e293b] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                {t('clear')}
              </button>
            )}
          </div>

          {/* Category Tabs: ALL, PERPS, STOCKS, INDICES, COMMODITIES, SPOT */}
          <div className="flex items-center gap-1 bg-[#10131c] p-1 rounded-xl border border-[#1e293b]/70 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: t('allMarkets') },
              { id: 'perps', label: t('perps') },
              { id: 'stocks', label: t('stocks') },
              { id: 'indices', label: t('indices') },
              { id: 'commodities', label: t('commodities') },
              { id: 'spot', label: t('spot') },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#00d2ff] text-black shadow-md shadow-[#00d2ff]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Chips: All, Top Gainers, Top Losers, Volume, Favorites */}
        <div className="flex items-center justify-between border-t border-[#1e293b]/50 pt-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setMetricFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                metricFilter === 'all'
                  ? 'bg-[#1e293b] text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('allAssets')} ({filteredMarkets.length})
            </button>
            <button
              onClick={() => setMetricFilter('gainers')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                metricFilter === 'gainers'
                  ? 'bg-emerald-500/20 text-[#00d2ff] border border-[#00d2ff]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-[#00d2ff]" />
              <span>{t('gainers')}</span>
            </button>
            <button
              onClick={() => setMetricFilter('losers')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                metricFilter === 'losers'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span>{t('losers')}</span>
            </button>
            <button
              onClick={() => setMetricFilter('favorites')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                metricFilter === 'favorites'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{t('favorites')} ({favorites.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            <span className="text-white font-medium">{filteredMarkets.length}</span> {t('markets')}
          </div>
        </div>

        {/* Markets Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-[11px] font-mono uppercase text-slate-400 tracking-wider bg-[#0c0e15]">
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">{t('market')}</th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  {t('lastPrice')} {sortBy === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  onClick={() => handleSort('change')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  {t('change24h')} {sortBy === 'change' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="py-2.5 px-3 hidden md:table-cell">{t('highLow24h')}</th>
                <th
                  onClick={() => handleSort('volume')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  {t('volume24h')} {sortBy === 'volume' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="py-2.5 px-3 hidden lg:table-cell">{t('fundingRate')}</th>
                <th className="py-2.5 px-3 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/40 font-mono text-xs">
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    {t('noMarketsFound')} "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((market) => {
                  const isUp = market.change24h >= 0;
                  const flash = lastPriceFlash[market.id];
                  const isFav = favorites.includes(market.id);

                  return (
                    <tr
                      key={market.id}
                      className="hover:bg-[#0f121b] transition-colors group cursor-pointer"
                      onClick={() => onSelectMarket(market)}
                    >
                      {/* Favorite Toggle */}
                      <td className="py-3 px-3 w-8 text-center" onClick={(e) => { e.stopPropagation(); toggleFavorite(market.id); }}>
                        <Star
                          className={`w-3.5 h-3.5 cursor-pointer transition-colors ${
                            isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        />
                      </td>

                      {/* Symbol & Category */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 font-sans">
                          <CryptoLogo symbol={market.baseAsset} size="sm" />
                          <span className="font-extrabold text-white text-sm font-mono tracking-tight group-hover:text-[#00d2ff] transition-colors">
                            {market.symbol}
                          </span>
                          {market.leverageMax > 1 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30">
                              {market.leverageMax}x
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 uppercase hidden sm:inline">
                            {market.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans truncate max-w-[140px] sm:max-w-none pl-8 sm:pl-0">
                          {market.name}
                        </div>
                      </td>

                      {/* Price (Real-time color flash animation) */}
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold tabular-nums px-1.5 py-0.5 rounded transition-all ${
                            flash === 'up'
                              ? 'bg-[#00d2ff]/20 text-[#00d2ff]'
                              : flash === 'down'
                              ? 'bg-red-500/20 text-[#ff4d4d]'
                              : 'text-white'
                          }`}
                        >
                          {formatPrice(market.price, market.precision)}
                        </span>
                      </td>

                      {/* 24h Change Pill */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded text-[11px] font-mono ${
                            isUp
                              ? 'bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30'
                              : 'bg-red-500/15 text-[#ff4d4d] border border-red-500/30'
                          }`}
                        >
                          {isUp ? '+' : ''}{market.change24h}%
                        </span>
                      </td>

                      {/* 24h High / Low */}
                      <td className="py-3 px-3 text-slate-400 hidden md:table-cell text-[11px]">
                        <div>H: {formatPrice(market.high24h, market.precision)}</div>
                        <div className="text-slate-500">L: {formatPrice(market.low24h, market.precision)}</div>
                      </td>

                      {/* 24h Volume */}
                      <td className="py-3 px-3 text-slate-300">
                        {formatCompactUsd(market.volume24h)}
                      </td>

                      {/* Funding Rate */}
                      <td className="py-3 px-3 hidden lg:table-cell">
                        {market.fundingRate !== undefined ? (
                          <span className={`text-[11px] ${market.fundingRate >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}`}>
                            {(market.fundingRate * 100).toFixed(4)}%
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Action Trade Button */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMarket(market);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe8] text-black font-bold text-xs font-sans transition-all shadow-md shadow-[#00d2ff]/10"
                        >
                          {t('trade')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
