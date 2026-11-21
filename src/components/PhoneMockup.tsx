import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { CryptoLogo } from './CryptoLogo';
import { ChevronDown, TrendingUp, Infinity, ArrowLeftRight, Settings2 } from 'lucide-react';

interface MockMarket {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  leverage: string;
  volume: string;
  price: string;
  subPrice: string;
  change: string;
  isPositive: boolean;
  type: string;
}

const CATEGORY_DATA: Record<string, MockMarket[]> = {
  Perps: [
    {
      symbol: 'BTC/USDC',
      baseAsset: 'BTC',
      quoteAsset: 'USDC',
      leverage: '40x',
      volume: '$2.6B',
      price: '66,360',
      subPrice: '$66,359.50',
      change: '+3.34%',
      isPositive: true,
      type: 'Perp',
    },
    {
      symbol: 'ETH/USDC',
      baseAsset: 'ETH',
      quoteAsset: 'USDC',
      leverage: '25x',
      volume: '$827.6M',
      price: '1,941',
      subPrice: '$1,941.35',
      change: '+4.09%',
      isPositive: true,
      type: 'Perp',
    },
    {
      symbol: 'HYPE/USDC',
      baseAsset: 'HYPE',
      quoteAsset: 'USDC',
      leverage: '10x',
      volume: '$239.2M',
      price: '63.15',
      subPrice: '$63.15',
      change: '+3.97%',
      isPositive: true,
      type: 'Perp',
    },
    {
      symbol: 'SOL/USDC',
      baseAsset: 'SOL',
      quoteAsset: 'USDC',
      leverage: '20x',
      volume: '$122.6M',
      price: '78.38',
      subPrice: '$78.38',
      change: '+2.36%',
      isPositive: true,
      type: 'Perp',
    },
    {
      symbol: 'ZEC/USDC',
      baseAsset: 'ZEC',
      quoteAsset: 'USDC',
      leverage: '10x',
      volume: '$98.84M',
      price: '538.80',
      subPrice: '$538.79',
      change: '+1.49%',
      isPositive: true,
      type: 'Perp',
    },
    {
      symbol: 'XRP/USDC',
      baseAsset: 'XRP',
      quoteAsset: 'USDC',
      leverage: '20x',
      volume: '$58.27M',
      price: '1.13',
      subPrice: '$1.13',
      change: '+3.79%',
      isPositive: true,
      type: 'Perp',
    },
    {
      symbol: 'PUMP/USDC',
      baseAsset: 'PUMP',
      quoteAsset: 'USDC',
      leverage: '10x',
      volume: '$41.28M',
      price: '0.002007',
      subPrice: '$0.00',
      change: '+0.96%',
      isPositive: true,
      type: 'Perp',
    },
    {
      symbol: 'kBONK/USDC',
      baseAsset: 'BONK',
      quoteAsset: 'USDC',
      leverage: '10x',
      volume: '$20.25M',
      price: '0.003070',
      subPrice: '$0.00',
      change: '+3.09%',
      isPositive: true,
      type: 'Perp',
    },
    {
      symbol: 'CASHCAT/USDC',
      baseAsset: 'WIF',
      quoteAsset: 'USDC',
      leverage: '5x',
      volume: '$19.20M',
      price: '0.07902',
      subPrice: '$0.08',
      change: '+19.47%',
      isPositive: true,
      type: 'Perp',
    },
  ],
  Stocks: [
    {
      symbol: 'NVDA/USDC',
      baseAsset: 'NVDA',
      quoteAsset: 'USDC',
      leverage: '10x',
      volume: '$412.5M',
      price: '128.40',
      subPrice: '$128.40',
      change: '+4.12%',
      isPositive: true,
      type: 'Equity Perp',
    },
    {
      symbol: 'AAPL/USDC',
      baseAsset: 'AAPL',
      quoteAsset: 'USDC',
      leverage: '10x',
      volume: '$320.1M',
      price: '232.15',
      subPrice: '$232.15',
      change: '+1.28%',
      isPositive: true,
      type: 'Equity Perp',
    },
    {
      symbol: 'TSLA/USDC',
      baseAsset: 'TSLA',
      quoteAsset: 'USDC',
      leverage: '10x',
      volume: '$285.9M',
      price: '218.60',
      subPrice: '$218.60',
      change: '+5.84%',
      isPositive: true,
      type: 'Equity Perp',
    },
    {
      symbol: 'MSFT/USDC',
      baseAsset: 'MSFT',
      quoteAsset: 'USDC',
      leverage: '10x',
      volume: '$198.4M',
      price: '448.20',
      subPrice: '$448.20',
      change: '+0.85%',
      isPositive: true,
      type: 'Equity Perp',
    },
  ],
  Commodities: [
    {
      symbol: 'XAU/USDC',
      baseAsset: 'GOLD',
      quoteAsset: 'USDC',
      leverage: '50x',
      volume: '$540.2M',
      price: '2,745.20',
      subPrice: '$2,745.20',
      change: '+0.64%',
      isPositive: true,
      type: 'Commodity',
    },
    {
      symbol: 'XAG/USDC',
      baseAsset: 'SILVER',
      quoteAsset: 'USDC',
      leverage: '20x',
      volume: '$180.4M',
      price: '34.18',
      subPrice: '$34.18',
      change: '+2.15%',
      isPositive: true,
      type: 'Commodity',
    },
    {
      symbol: 'WTI/USDC',
      baseAsset: 'OIL',
      quoteAsset: 'USDC',
      leverage: '20x',
      volume: '$210.8M',
      price: '71.85',
      subPrice: '$71.85',
      change: '+1.92%',
      isPositive: true,
      type: 'Commodity',
    },
  ],
  Indices: [
    {
      symbol: 'SPX/USDC',
      baseAsset: 'SPX',
      quoteAsset: 'USDC',
      leverage: '25x',
      volume: '$610.4M',
      price: '5,864.20',
      subPrice: '$5,864.20',
      change: '+0.78%',
      isPositive: true,
      type: 'Index Perp',
    },
    {
      symbol: 'NDX/USDC',
      baseAsset: 'NDX',
      quoteAsset: 'USDC',
      leverage: '25x',
      volume: '$520.1M',
      price: '20,412.50',
      subPrice: '$20,412.50',
      change: '+1.12%',
      isPositive: true,
      type: 'Index Perp',
    },
  ],
  FX: [
    {
      symbol: 'EUR/USD',
      baseAsset: 'EUR',
      quoteAsset: 'USD',
      leverage: '50x',
      volume: '$380.5M',
      price: '1.0854',
      subPrice: '$1.0854',
      change: '+0.22%',
      isPositive: true,
      type: 'FX Perp',
    },
    {
      symbol: 'USD/JPY',
      baseAsset: 'JPY',
      quoteAsset: 'USD',
      leverage: '50x',
      volume: '$290.3M',
      price: '152.40',
      subPrice: '$152.40',
      change: '+0.41%',
      isPositive: true,
      type: 'FX Perp',
    },
  ],
};

interface PhoneMockupProps {
  onSelectMarket?: (symbol: string) => void;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ onSelectMarket }) => {
  const { t } = useTrading();
  const [activeTab, setActiveTab] = useState<string>('Perps');
  const tabs = [
    { key: 'Perps', label: t('perps', 'Perps') },
    { key: 'Stocks', label: t('stocks', 'Stocks') },
    { key: 'Commodities', label: t('commodities', 'Commodities') },
    { key: 'Indices', label: t('indices', 'Indices') },
    { key: 'FX', label: t('fx', 'FX') },
  ];
  const markets = CATEGORY_DATA[activeTab] || CATEGORY_DATA['Perps'];

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] select-none">
      {/* Outer ambient glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#00d2ff]/20 via-blue-600/10 to-transparent rounded-[54px] blur-2xl opacity-60 pointer-events-none" />

      {/* Sleek Smartphone Chassis */}
      <div className="relative bg-[#07080b] border-[6px] border-[#222736] rounded-[46px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden font-sans ring-1 ring-white/10">
        {/* Dynamic Island / Top Speaker Bar */}
        <div className="pt-3 pb-1 px-6 bg-[#07080b] flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 font-mono">9:41</span>
          <div className="w-20 h-4 bg-black rounded-full border border-neutral-800 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111] mr-3" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]/40" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">5G</span>
            <div className="w-4 h-2 border border-slate-500 rounded-sm p-0.5 flex items-center">
              <div className="w-2.5 h-full bg-slate-300 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* In-App Category Header Navigation */}
        <div className="px-3 pt-2 pb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#161a24]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1e2330] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Column Headers matching screenshot */}
        <div className="px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-[#141822]">
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
            <span>{t('nameVolume', 'Name / Volume')}</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="text-right">
            <span>{t('lastPrice', 'Last price')}</span>
          </div>
          <div className="w-16 text-right">
            <span>{t('changeLabel', 'Change')}</span>
          </div>
        </div>

        {/* Market List Rows */}
        <div className="divide-y divide-[#131722] max-h-[460px] overflow-y-auto no-scrollbar">
          {markets.map((m) => {
            return (
              <div
                key={m.symbol}
                onClick={() => onSelectMarket?.(m.baseAsset)}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-[#0e121a] cursor-pointer transition-colors group"
              >
                {/* Left: Token Icon + Symbol + Leverage + Volume */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <CryptoLogo symbol={m.baseAsset} size="sm" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white group-hover:text-[#00d2ff] transition-colors truncate">
                        {m.symbol}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#181d28] text-slate-400 border border-[#232938] font-mono">
                        {m.leverage}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <span>{m.volume}</span>
                      <span>·</span>
                      <span>{m.type}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Last Price */}
                <div className="text-right flex flex-col pr-2">
                  <span className="text-xs font-bold text-white tabular-nums font-mono">
                    {m.price}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                    {m.subPrice}
                  </span>
                </div>

                {/* Right: Neon Cyan Pill Badge as in Screenshot */}
                <div className="w-16 flex justify-end shrink-0">
                  <div className="px-2.5 py-1 rounded-md bg-[#00e5ff] text-black font-extrabold text-[11px] font-mono tracking-tight shadow-[0_0_10px_rgba(0,229,255,0.35)] group-hover:brightness-110 transition-all text-center min-w-[58px]">
                    {m.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Phone Bottom Navigation Bar matching screenshot */}
        <div className="px-4 py-2.5 bg-[#07080b] border-t border-[#161a24] flex items-center justify-around text-slate-400">
          {/* Infinity / Perps */}
          <button
            onClick={() => setActiveTab('Perps')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === 'Perps' ? 'text-[#00e5ff]' : 'hover:text-white'
            }`}
            title="Perpetuals"
          >
            <Infinity className="w-4 h-4" />
          </button>

          {/* Chart / Markets */}
          <button
            onClick={() => onSelectMarket?.('BTC')}
            className="p-1.5 rounded-lg hover:text-white transition-colors"
            title="Markets & Charts"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          {/* Swap / Trade */}
          <button
            onClick={() => onSelectMarket?.('BTC')}
            className="p-1.5 rounded-lg hover:text-white transition-colors"
            title="Swap & Trade"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Predictions Y|N */}
          <button
            className="px-1.5 py-0.5 rounded text-[11px] font-extrabold font-mono hover:text-white transition-colors text-slate-400"
            title="Predictions"
          >
            Y|N
          </button>

          {/* Settings / Account */}
          <button
            className="p-1.5 rounded-lg hover:text-white transition-colors"
            title="Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="pb-2 pt-1 bg-[#07080b] flex justify-center">
          <div className="w-28 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
