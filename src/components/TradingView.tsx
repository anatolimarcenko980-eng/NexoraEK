import React, { useState } from 'react';
import { Market } from '../types/market';
import { useTrading } from '../context/TradingContext';
import { InteractiveChart } from './InteractiveChart';
import { OrderBook } from './OrderBook';
import { TradingPanel } from './TradingPanel';
import { PositionsTracker } from './PositionsTracker';
import { formatPrice, formatCompactUsd } from '../utils/tradingMath';
import { CryptoLogo } from './CryptoLogo';
import { ArrowLeft, ChevronDown, Search, ArrowUpRight, ArrowDownRight, Clock, Star, Zap } from 'lucide-react';

interface TradingViewProps {
  onBackToMarkets: () => void;
  onOpenCalendar?: () => void;
}

export const TradingView: React.FC<TradingViewProps> = ({ onBackToMarkets, onOpenCalendar }) => {
  const {
    t,
    markets,
    selectedMarket,
    setSelectedMarket,
    positions,
    closePosition,
    favorites,
    toggleFavorite,
    tradingMode,
    isDemoMode,
    setTradingMode,
    toggleTradingMode,
    resetDemoBalance,
    demoBalance,
  } = useTrading();
  
  const [showMarketDropdown, setShowMarketDropdown] = useState<boolean>(false);
  const [dropdownSearch, setDropdownSearch] = useState<string>('');
  const [selectedLimitPrice, setSelectedLimitPrice] = useState<number | undefined>(undefined);

  const filteredDropdownMarkets = markets.filter(m => 
    m.symbol.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
    m.name.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const isUp = selectedMarket.change24h >= 0;
  const isFav = favorites.includes(selectedMarket.id);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Trading Asset Header Strip */}
      <div className="flex items-center justify-between bg-[#08090d] border border-[#1e293b]/70 rounded-xl px-4 py-2.5 shadow-xl flex-wrap gap-3">
        {/* Market Selector & Back Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMarkets}
            className="p-1.5 rounded-lg bg-[#141620] hover:bg-[#1e293b] text-slate-300 hover:text-white transition-colors"
            title={t('backToAllMarkets')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Market Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMarketDropdown(!showMarketDropdown)}
              className="flex items-center gap-2 bg-[#121520] hover:bg-[#1a1f2e] border border-[#1e293b] rounded-xl px-3 py-1.5 transition-all group"
            >
              <div className="flex items-center gap-2">
                <CryptoLogo symbol={selectedMarket.baseAsset} size="sm" />
                <span className="font-extrabold text-white text-base font-mono tracking-tight">
                  {selectedMarket.symbol}
                </span>
                {selectedMarket.leverageMax > 1 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30">
                    {selectedMarket.leverageMax}x
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* Market Dropdown Menu */}
            {showMarketDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-[#0c0e15] border border-[#1e293b] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder={t('searchPair')}
                    autoFocus
                    className="w-full bg-[#141620] border border-[#1e293b] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-[#1e293b]/30">
                  {filteredDropdownMarkets.map(m => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMarket(m);
                        setShowMarketDropdown(false);
                      }}
                      className="p-2 hover:bg-[#161a26] rounded-lg cursor-pointer flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CryptoLogo symbol={m.baseAsset} size="xs" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white font-mono">{m.symbol}</span>
                          <span className="text-[10px] text-slate-400 truncate">{m.name}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <div className="text-white font-medium">{formatPrice(m.price, m.precision)}</div>
                        <div className={`text-[10px] ${m.change24h >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}`}>
                          {m.change24h >= 0 ? '+' : ''}{m.change24h}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Favorite Star */}
          <button
            onClick={() => toggleFavorite(selectedMarket.id)}
            className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
          >
            <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs overflow-x-auto">
          {/* Last Price */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-sans">{t('price')}</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base sm:text-lg font-bold tabular-nums ${isUp ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                {formatPrice(selectedMarket.price, selectedMarket.precision)}
              </span>
              <span className={`text-[11px] font-bold flex items-center ${isUp ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {isUp ? '+' : ''}{selectedMarket.change24h}%
              </span>
            </div>
          </div>

          {/* 24h High */}
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] text-slate-500 uppercase font-sans">{t('high24h')}</span>
            <span className="text-white font-medium tabular-nums">{formatPrice(selectedMarket.high24h, selectedMarket.precision)}</span>
          </div>

          {/* 24h Low */}
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] text-slate-500 uppercase font-sans">{t('low24h')}</span>
            <span className="text-white font-medium tabular-nums">{formatPrice(selectedMarket.low24h, selectedMarket.precision)}</span>
          </div>

          {/* 24h Volume */}
          <div className="flex flex-col hidden md:flex">
            <span className="text-[10px] text-slate-500 uppercase font-sans">{t('volume24h')}</span>
            <span className="text-white font-medium tabular-nums">{formatCompactUsd(selectedMarket.volume24h)}</span>
          </div>

          {/* Funding Rate */}
          {selectedMarket.fundingRate !== undefined && (
            <div className="flex flex-col hidden md:flex">
              <span className="text-[10px] text-slate-500 uppercase font-sans flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>{t('fundingRate')}</span>
              </span>
              <span className={`tabular-nums ${selectedMarket.fundingRate >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}`}>
                {(selectedMarket.fundingRate * 100).toFixed(4)}%
              </span>
            </div>
          )}

          {/* Trading Mode Toggle Pill */}
          {isDemoMode ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTradingMode('live')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#00d2ff] text-black shadow-[0_0_14px_rgba(0,210,255,0.5)] hover:brightness-110 transition-all cursor-pointer"
                title={t('backToLive')}
              >
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span>{t('demoBtc50x')}</span>
              </button>
              <button
                onClick={() => resetDemoBalance()}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-[#141824] hover:bg-[#1e2536] text-[#00d2ff] border border-[#00d2ff]/40 transition-colors cursor-pointer"
                title={t('resetDemoBalance')}
              >
                {t('resetDemoBalance')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTradingMode('demo')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00d2ff]/15 hover:bg-[#00d2ff]/25 border border-[#00d2ff]/40 text-[#00d2ff] transition-all cursor-pointer shadow-sm"
              title={t('demoTrading')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>{t('live')} · {t('demoMode')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo Trading Mode Active Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-[#00d2ff]/15 via-[#0c1626] to-[#00d2ff]/10 border border-[#00d2ff]/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg shadow-[#00d2ff]/5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff] animate-ping" />
            <div>
              <span className="font-extrabold text-[#00d2ff] font-mono mr-2 uppercase tracking-wide">
                {t('demoMode')}
              </span>
              <span className="text-slate-300">
                {t('demoNotice')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => resetDemoBalance()}
              className="px-3 py-1 rounded-lg text-[11px] font-mono font-bold bg-[#101826] hover:bg-[#182438] text-[#00d2ff] border border-[#00d2ff]/40 transition-colors cursor-pointer"
            >
              {t('resetDemoBalance')}
            </button>
            <button
              onClick={() => setTradingMode('live')}
              className="px-3 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-200 text-black transition-colors cursor-pointer"
            >
              {t('exitToLive')}
            </button>
          </div>
        </div>
      )}


      {/* Grid Layout: Desktop 3-column / Tablet 2-column / Mobile stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column: Interactive Chart + Positions Tracker (7 or 8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Chart Section */}
          <div className="h-[430px] w-full">
            <InteractiveChart
              market={selectedMarket}
              activePositions={positions.filter(p => (isDemoMode ? Boolean(p.isDemo) : !p.isDemo))}
              onClosePosition={closePosition}
            />
          </div>

          {/* Positions & Orders Tracker */}
          <PositionsTracker
            onSelectMarket={(id) => {
              const m = markets.find(item => item.id === id);
              if (m) setSelectedMarket(m);
            }}
            onOpenCalendar={onOpenCalendar}
          />
        </div>

        {/* Right Column: Order Book & Trading Execution Panel (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Order Execution Panel */}
          <TradingPanel
            market={selectedMarket}
            initialPrice={selectedLimitPrice}
          />

          {/* Order Book & Recent Trades */}
          <div className="h-[360px]">
            <OrderBook
              market={selectedMarket}
              onSelectPrice={(price) => setSelectedLimitPrice(price)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
