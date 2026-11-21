import React, { useState } from 'react';
import { MasterTrader } from '../data/copytradingData';
import { Identicon } from './Identicon';
import { useTrading } from '../context/TradingContext';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Search,
  Info,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
} from 'lucide-react';

interface LeaderDetailsViewProps {
  trader: MasterTrader;
  onBack: () => void;
  onCopyTrader: (trader: MasterTrader) => void;
}

type TimeframeOption = '1 Day' | '7 Days' | '1 Month' | '90 Days' | '1 Year' | 'All Time';

export const LeaderDetailsView: React.FC<LeaderDetailsViewProps> = ({
  trader,
  onBack,
  onCopyTrader,
}) => {
  const { t } = useTrading();
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1 Month');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; date: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(trader.address || trader.name);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '#copytrading-' + trader.id);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Generate realistic chart curve matching the screenshot wave
  // Screenshot shows: starts ~ mid, rises smoothly, dips down, rebounds, drops down, series of jagged ripples
  const chartPointsByTimeframe: Record<TimeframeOption, number[]> = {
    '1 Day': [40, 42, 45, 43, 39, 36, 38, 41, 40, 37, 34, 32, 30, 28, 29, 27],
    '7 Days': [50, 48, 55, 62, 58, 48, 42, 38, 45, 52, 44, 35, 30, 26, 28, 22],
    '1 Month': [
      48, 52, 60, 68, 64, 56, 54, 53, 52, 46, 38, 42, 40, 44, 52, 54, 48,
      40, 36, 34, 35, 33, 31, 28, 29, 26, 28, 25, 24, 27, 23, 21, 24, 20
    ],
    '90 Days': [
      30, 35, 42, 58, 65, 72, 68, 55, 48, 44, 50, 56, 52, 40, 32, 28, 25, 22
    ],
    '1 Year': [
      20, 25, 30, 42, 58, 70, 75, 68, 60, 54, 58, 62, 48, 38, 30, 25, 24, 21
    ],
    'All Time': [
      15, 20, 28, 40, 55, 72, 85, 78, 65, 58, 62, 66, 50, 40, 32, 28, 25, 22
    ],
  };

  const activePoints = chartPointsByTimeframe[selectedTimeframe] || chartPointsByTimeframe['1 Month'];
  const minVal = Math.min(...activePoints);
  const maxVal = Math.max(...activePoints);
  const valRange = maxVal - minVal || 1;

  // Chart dimensions
  const chartWidth = 900;
  const chartHeight = 240;
  const paddingX = 10;
  const paddingY = 20;

  const coords = activePoints.map((val, idx) => {
    const x = paddingX + (idx / (activePoints.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((val - minVal) / valRange) * (chartHeight - paddingY * 2);
    return { x, y, val };
  });

  // Build smooth bezier path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  // Gradient area closed path
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${chartHeight} L ${coords[0].x} ${chartHeight} Z`;

  // Is predominantly negative/drawdown like in screenshot?
  const isRedWave = trader.lead30dPnlPercent <= 0 || trader.id === '0x7271...1e2c';
  const strokeColor = isRedWave ? '#f87171' : '#00d2ff';
  const gradientId = `area-gradient-${trader.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 text-white font-sans animate-in fade-in duration-200">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <button
          onClick={onBack}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{t('copytrading')}</span>
        </button>
        <span className="text-slate-600">&gt;</span>
        <span className="text-slate-200 font-semibold">{t('leaderDetails')}</span>
      </div>

      {/* Main Trader Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Left: Avatar + Verified Name + Full Address */}
        <div className="flex items-center gap-3.5">
          <Identicon seed={trader.address || trader.name} size={48} className="border-2 border-slate-700/80" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-mono">
                {trader.name}
              </h1>
              {trader.verified && (
                <div className="w-4 h-4 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#00d2ff] text-black" />
                </div>
              )}
            </div>

            {/* Address with copy button */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
              <span className="truncate max-w-[260px] sm:max-w-md">{trader.address || trader.shortAddress}</span>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:text-white transition-colors rounded hover:bg-slate-800"
                title="Copy address"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons (Share, Search, Copy Trader) */}
        <div className="flex items-center gap-2.5">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-[#121620] hover:bg-[#1a202e] border border-[#232a3b] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Share profile"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Search Button */}
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#121620] hover:bg-[#1a202e] border border-[#232a3b] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Search leaders"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Copy Trader Pill Button */}
          <button
            onClick={() => onCopyTrader(trader)}
            className="px-6 py-2 rounded-full bg-[#e2e8f0] text-black font-extrabold text-xs hover:bg-white shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            {t('copyTrader')}
          </button>
        </div>
      </div>

      {/* Perps Total Value & Sub-Metrics Row */}
      <div className="flex flex-col gap-4 pt-3 pb-2">
        {/* Big Perps Total Value */}
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium">{t('perpsTotalValue')}</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono tabular-nums mt-0.5">
            ${(trader.perpsTotalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Horizontal Row of 5 Metrics with Dividers */}
        <div className="flex flex-wrap items-center gap-y-3 text-xs divide-x divide-slate-800 text-slate-400 overflow-x-auto py-1">
          {/* Unrealized PnL */}
          <div className="pr-5 flex flex-col">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{t('unrealizedPnl')}</span>
              <Info className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex items-center gap-1.5 font-mono font-semibold tabular-nums mt-0.5">
              <span className={trader.unrealizedPnl >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}>
                ${Math.abs(trader.unrealizedPnl || 0).toFixed(2)}
              </span>
              <span className="text-slate-600">|</span>
              <span className={trader.unrealizedPnlPercent >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}>
                {trader.unrealizedPnlPercent >= 0 ? '+' : ''}{(trader.unrealizedPnlPercent || 0).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 30d PnL */}
          <div className="px-5 flex flex-col">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{t('pnl30d')}</span>
              <Info className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex items-center gap-1.5 font-mono font-semibold tabular-nums mt-0.5">
              <span className={trader.lead30dPnlAmount >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}>
                ${Math.abs(trader.lead30dPnlAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-slate-600">|</span>
              <span className={trader.lead30dPnlPercent >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}>
                {trader.lead30dPnlPercent >= 0 ? '+' : ''}{(trader.lead30dPnlPercent || 0).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 30d ROI */}
          <div className="px-5 flex flex-col">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{t('roi30d')}</span>
              <Info className="w-3 h-3 text-slate-500" />
            </div>
            <div className="font-mono font-semibold tabular-nums mt-0.5 text-[#00d2ff]">
              {trader.lead30dPnlPercent >= 0 ? '+' : ''}{(trader.lead30dPnlPercent || 0).toFixed(2)}%
            </div>
          </div>

          {/* Margin Used */}
          <div className="px-5 flex flex-col">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{t('marginUsed')}</span>
              <Info className="w-3 h-3 text-slate-500" />
            </div>
            <div className="font-mono font-semibold tabular-nums mt-0.5 text-white">
              ${(trader.marginUsed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Available Margin */}
          <div className="pl-5 flex flex-col">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{t('availableMargin')}</span>
              <Info className="w-3 h-3 text-slate-500" />
            </div>
            <div className="font-mono font-semibold tabular-nums mt-0.5 text-white">
              ${(trader.availableMargin || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Switcher (Pill style aligned right) */}
      <div className="flex items-center justify-end w-full pt-1">
        <div className="inline-flex items-center gap-1 bg-[#0b0e14] p-1 rounded-full border border-[#1e2430]">
          {([
            { id: '1 Day', label: '1D' },
            { id: '7 Days', label: '7D' },
            { id: '1 Month', label: '1M' },
            { id: '90 Days', label: '90D' },
            { id: '1 Year', label: '1Y' },
            { id: 'All Time', label: t('allTime') },
          ] as { id: TimeframeOption; label: string }[]).map((tf) => (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeframe(tf.id)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTimeframe === tf.id
                  ? 'bg-[#1e2430] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Large Glowing Mountain Area Chart */}
      <div className="relative w-full h-[260px] sm:h-[300px] bg-[#07080c] rounded-2xl border border-[#141824] p-2 sm:p-4 overflow-hidden flex flex-col justify-end">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isRedWave ? '#f87171' : '#00d2ff'}
                stopOpacity="0.45"
              />
              <stop
                offset="40%"
                stopColor={isRedWave ? '#dc2626' : '#0284c7'}
                stopOpacity="0.20"
              />
              <stop
                offset="100%"
                stopColor="#000000"
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Smooth Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive hover points */}
          {coords.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              fill={strokeColor}
              onMouseEnter={() =>
                setHoveredPoint({
                  x: p.x,
                  y: p.y,
                  val: p.val,
                  date: `Day ${i + 1}`,
                })
              }
            />
          ))}
        </svg>

        {/* Hover Crosshair Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-[#0e121a] border border-[#1e293b] text-[11px] font-mono text-white shadow-xl"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: `${(hoveredPoint.y / chartHeight) * 75}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <span className="text-slate-400 block">{hoveredPoint.date}</span>
            <span className="font-bold text-[#00d2ff]">
              ${(hoveredPoint.val * 2400).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* 3-Column Performance / Volume / Style Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#1a1f2c]">
        {/* Column 1: Trading Performance */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">{t('tradingPerformance')}</h2>
            <span className="text-xs text-slate-400 font-mono">{t('days30')}</span>
          </div>
          <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-mono">
            <div className="flex justify-between items-center py-1 border-b border-[#141824]">
              <span>{t('winRate')}</span>
              <span className="text-white font-semibold tabular-nums">
                {trader.winRate30d > 0 ? `${trader.winRate30d.toFixed(2)}%` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#141824]">
              <span>{t('profitFactor')}</span>
              <span className="text-white font-semibold tabular-nums">
                {trader.sharpeRatio ? trader.sharpeRatio.toFixed(2) : '3.84'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#141824]">
              <span>{t('maxDrawdown30d')}</span>
              <span className="text-white font-semibold tabular-nums">
                {trader.maxDrawdown30d.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>{t('avgTradesPerDay')}</span>
              <span className="text-white font-semibold tabular-nums">
                {trader.avgTradesPerDay}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Volume */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">{t('volume')}</h2>
          </div>
          <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-mono">
            <div className="flex justify-between items-center py-1 border-b border-[#141824]">
              <span>{t('volume24hLabel')}</span>
              <span className="text-white font-semibold tabular-nums">$0.00</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#141824]">
              <span>{t('volume30d')}</span>
              <span className="text-white font-semibold tabular-nums">{trader.volume30d}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>{t('aum')}</span>
              <span className="text-white font-semibold tabular-nums">{trader.aumFormatted}</span>
            </div>
          </div>
        </div>

        {/* Column 3: Trading Style */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">{t('tradingStyle')}</h2>
          </div>
          <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-mono">
            <div className="flex justify-between items-center py-1 border-b border-[#141824]">
              <span>{t('style')}</span>
              <div className="flex items-center gap-1.5">
                {(trader.tradingStylePills || ['Perps', 'Active']).map((pill) => (
                  <span
                    key={pill}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#131b26] text-[#00d2ff] border border-[#00d2ff]/30"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#141824]">
              <span>{t('favToken')}</span>
              <span className="text-white font-semibold">{trader.favToken || 'BTC-PERP'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#141824]">
              <span>{t('avgHoldingTime')}</span>
              <span className="text-white font-semibold">{trader.avgHoldingTime || '2h 15m'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>{t('leverage')}</span>
              <span className="text-white font-semibold">{trader.leverageRange || '3x - 10x'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Positions & Deal History Table */}
      <div className="flex flex-col gap-3 pt-6">
        <div className="flex items-center justify-between border-b border-[#1a1f2c] pb-2">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('positions')}
              className={`pb-1 transition-colors ${
                activeTab === 'positions'
                  ? 'text-white border-b-2 border-[#00d2ff]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('positions')} ({trader.activeDeals.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-1 transition-colors ${
                activeTab === 'history'
                  ? 'text-white border-b-2 border-[#00d2ff]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('tradeHistory')} ({trader.closedDeals.length})
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{t('liveL1Execution')}</span>
        </div>

        {activeTab === 'positions' ? (
          trader.activeDeals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#090b10] rounded-xl border border-[#161a24]">
              {t('noActiveDealsLeader')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-[#161a24] text-[11px]">
                    <th className="py-2.5 px-3">{t('market')}</th>
                    <th className="py-2.5 px-3">{t('side')}</th>
                    <th className="py-2.5 px-3">{t('leverage')}</th>
                    <th className="py-2.5 px-3">{t('entryPrice')}</th>
                    <th className="py-2.5 px-3">{t('markPrice')}</th>
                    <th className="py-2.5 px-3 text-right">{t('unrealizedPnl')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141824]">
                  {trader.activeDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">{deal.marketSymbol}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                            deal.side === 'long'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {deal.side}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{deal.leverage}x</td>
                      <td className="py-3 px-3 text-slate-300">${deal.entryPrice.toLocaleString()}</td>
                      <td className="py-3 px-3 text-white font-semibold">${deal.currentPrice.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-bold ${
                            deal.unrealizedPnl >= 0 ? 'text-[#00d2ff]' : 'text-red-400'
                          }`}
                        >
                          {deal.unrealizedPnl >= 0 ? '+' : ''}${deal.unrealizedPnl.toFixed(2)} ({deal.unrealizedPnlPercent >= 0 ? '+' : ''}{deal.unrealizedPnlPercent}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-[#161a24] text-[11px]">
                  <th className="py-2.5 px-3">{t('market')}</th>
                  <th className="py-2.5 px-3">{t('side')}</th>
                  <th className="py-2.5 px-3">{t('exitPrice')}</th>
                  <th className="py-2.5 px-3">{t('realizedPnl')}</th>
                  <th className="py-2.5 px-3 text-right">{t('time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141824]">
                {trader.closedDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{deal.marketSymbol}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                          deal.side === 'long'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {deal.side}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">${deal.exitPrice.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          deal.realizedPnl >= 0 ? 'text-[#00d2ff]' : 'text-red-400'
                        }`}
                      >
                        {deal.realizedPnl >= 0 ? '+' : ''}${deal.realizedPnl.toFixed(2)} (+{deal.realizedPnlPercent}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">{deal.closedTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
