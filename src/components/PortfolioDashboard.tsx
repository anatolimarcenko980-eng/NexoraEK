import React, { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import { useTrading } from '../context/TradingContext';
import { CryptoLogo } from './CryptoLogo';
import { TokenSelectorModal } from './TokenSelectorModal';
import { PORTFOLIO_CRYPTO_LIST, CryptoAssetMeta } from '../data/portfolioData';
import {
  getDepositAddressForAsset,
  getAvailableDepositNetworks,
  NetworkDepositAddress,
} from '../data/depositAddresses';
import {
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowRightLeft,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  SlidersHorizontal,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  PieChart,
  Copy,
  QrCode,
} from 'lucide-react';

interface PortfolioDashboardProps {
  onTradeMarket?: (marketId: string) => void;
  onNavigateToCalendar?: () => void;
}

type MainTab = 'overview' | 'perps' | 'spot';
type Timeframe = '1D' | '7D' | '1M' | '90D' | '1Y' | 'ALL';

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  onTradeMarket,
  onNavigateToCalendar,
}) => {
  const {
    liveBalance,
    walletAddress,
    tokenBalances,
    livePortfolioValue,
    portfolioTransactions,
    positions,
    closedTrades,
    depositTokens,
    withdrawTokens,
    swapTokens,
    markets,
    currentUser,
    candleColors,
    t,
  } = useTrading();

  const isGreenChart = candleColors === 'emerald-ruby';
  const chartStrokeColor = isGreenChart ? '#10b981' : '#00d2ff';

  // Navigation & Visibility State
  const [activeTab, setActiveTab] = useState<MainTab>('overview');
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [hideBalances, setHideBalances] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);

  // Modals for the 3 Action Buttons
  const [activeModal, setActiveModal] = useState<'swap' | 'withdraw' | 'deposit' | null>(null);
  const [tokenPickerTarget, setTokenPickerTarget] = useState<'swapFrom' | 'swapTo' | 'deposit' | 'withdraw' | null>(null);

  // Swap Form State
  const [swapFromAsset, setSwapFromAsset] = useState<string>('USDC');
  const [swapToAsset, setSwapToAsset] = useState<string>('ETH');
  const [swapAmount, setSwapAmount] = useState<string>('500');
  const [swapSuccessMsg, setSwapSuccessMsg] = useState<string>('');
  const [swapError, setSwapError] = useState<string>('');

  // Withdraw Form State
  const [withdrawAsset, setWithdrawAsset] = useState<string>('USDC');
  const [withdrawNetwork, setWithdrawNetwork] = useState<string>('Hyperliquid L1');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('0x981A...34F2');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string>('');

  // Deposit Form State
  const [depositAsset, setDepositAsset] = useState<string>('USDC');
  const [depositNetwork, setDepositNetwork] = useState<string>('ETH');
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string>('');
  const [depositErrorMsg, setDepositErrorMsg] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [copiedDepositAddr, setCopiedDepositAddr] = useState<boolean>(false);

  // Available deposit networks for currently selected asset
  const availableDepositNetworks = useMemo(() => {
    return getAvailableDepositNetworks(depositAsset);
  }, [depositAsset]);

  // Selected network's authentic deposit address
  const currentDepositAddress = useMemo(() => {
    return getDepositAddressForAsset(depositAsset, depositNetwork);
  }, [depositAsset, depositNetwork]);

  // QR Code State
  const [depositQrDataUrl, setDepositQrDataUrl] = useState<string>('');
  const [showQrCode, setShowQrCode] = useState<boolean>(true);

  // Generate crisp QR code whenever the deposit address or network changes
  useEffect(() => {
    if (!currentDepositAddress) {
      setDepositQrDataUrl('');
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(currentDepositAddress, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url: string) => {
        if (isMounted) {
          setDepositQrDataUrl(url);
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to generate deposit QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentDepositAddress, depositNetwork]);

  // Crypto list table filters
  const [spotSearch, setSpotSearch] = useState<string>('');
  const [hideZeroBalances, setHideZeroBalances] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'layer1' | 'defi' | 'stablecoin'>('all');

  // Strictly filter out Demo positions & Demo trades and scope closed trades to currentUser
  const livePositions = useMemo(() => positions.filter(p => !p.isDemo), [positions]);
  const liveClosedTrades = useMemo(() => {
    if (!currentUser) return [];
    const curId = currentUser.id;
    const curEmail = currentUser.email?.trim().toLowerCase();
    const isPrimaryAdmin = curId === 'NX-94718' || curEmail === 'anatolimarcenko980@gmail.com';
    return closedTrades.filter(tr => {
      if (tr.isDemo) return false;
      if (tr.userId && tr.userId === curId) return true;
      if (tr.userEmail && curEmail && tr.userEmail.trim().toLowerCase() === curEmail) return true;
      if (!tr.userId && !tr.userEmail && isPrimaryAdmin) return true;
      return false;
    });
  }, [closedTrades, currentUser]);
  const liveAvailableBalance = useMemo(() => {
    const liveMargin = livePositions.reduce((sum, p) => sum + (p.margin || 0), 0);
    return Math.max(0, liveBalance - liveMargin);
  }, [liveBalance, livePositions]);

  // PnL Metrics Calculations (Live only)
  const realizedProfit = useMemo(() => {
    return liveClosedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  }, [liveClosedTrades]);

  const unrealizedProfit = useMemo(() => {
    return livePositions.reduce((acc, p) => acc + (p.unrealizedPnl || 0), 0);
  }, [livePositions]);

  const totalPnl = useMemo(() => {
    return realizedProfit + unrealizedProfit;
  }, [realizedProfit, unrealizedProfit]);

  const fundingPnl = useMemo(() => {
    // Estimated accrued funding PnL
    return livePositions.reduce((acc, p) => {
      const mRate = markets.find(m => m.id === p.marketId)?.fundingRate || 0.0001;
      return acc + ((p.sizeUsdc || 0) * mRate * 2);
    }, 0);
  }, [livePositions, markets]);

  // Funding Metrics Calculations
  const totalDeposits = useMemo(() => {
    const fromTx = portfolioTransactions
      .filter(t => t.type === 'deposit')
      .reduce((acc, t) => acc + t.usdValue, 0);
    // Display baseline if user has real balance
    return fromTx > 0 ? fromTx : (livePortfolioValue > 0 ? livePortfolioValue : 0);
  }, [portfolioTransactions, livePortfolioValue]);

  const totalWithdrawals = useMemo(() => {
    return portfolioTransactions
      .filter(t => t.type === 'withdraw')
      .reduce((acc, t) => acc + t.usdValue, 0);
  }, [portfolioTransactions]);

  const netFunding = useMemo(() => {
    return totalDeposits - totalWithdrawals;
  }, [totalDeposits, totalWithdrawals]);

  // Trading Metrics Calculations (Live only)
  const tradesExecuted = useMemo(() => {
    return liveClosedTrades.length + livePositions.length;
  }, [liveClosedTrades, livePositions]);

  const totalVolume = useMemo(() => {
    const closedVol = liveClosedTrades.reduce((acc, t) => acc + (t.sizeUsdc || 0), 0);
    const openVol = livePositions.reduce((acc, p) => acc + (p.sizeUsdc || 0), 0);
    return closedVol + openVol;
  }, [liveClosedTrades, livePositions]);

  const winRate = useMemo(() => {
    if (liveClosedTrades.length === 0) return '0.00%';
    const wins = liveClosedTrades.filter(t => (t.pnl || 0) > 0).length;
    return ((wins / liveClosedTrades.length) * 100).toFixed(2) + '%';
  }, [liveClosedTrades]);

  // Dynamic Timeframe Performance Label
  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case '1D': return t('last24Hours');
      case '7D': return t('last7Days');
      case '1M': return t('last30Days');
      case '90D': return t('last90Days');
      case '1Y': return t('last1Year');
      case 'ALL': return t('allTime');
    }
  }, [timeframe, t]);

  // Percentage return over timeframe
  const timeframeChangePct = useMemo(() => {
    if (livePortfolioValue <= 0) return 0.0;
    switch (timeframe) {
      case '1D': return 0.42;
      case '7D': return 3.82;
      case '1M': return 8.14;
      case '90D': return 19.50;
      case '1Y': return 42.10;
      case 'ALL': return 42.10;
    }
  }, [livePortfolioValue, timeframe]);

  const timeframeChangeUsd = useMemo(() => {
    return (livePortfolioValue * (timeframeChangePct / 100));
  }, [livePortfolioValue, timeframeChangePct]);

  // Responsive Chart Points Generation
  const chartPoints = useMemo(() => {
    const count = 28;
    const base = livePortfolioValue > 0 ? livePortfolioValue : 0;
    const pts: { x: number; y: number; val: number; label: string }[] = [];

    // Trend factor based on timeframe
    const volatility = base > 0 ? base * 0.015 : 0;

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      // Generate realistic smooth trajectory
      const wave = Math.sin(progress * Math.PI * 1.5) * volatility;
      const upwardDrift = progress * (timeframeChangeUsd * 0.8);
      const val = Math.max(0, base - (timeframeChangeUsd * (1 - progress)) + wave);

      // SVG coordinate mapping: Width 1000, Height 260
      const x = (i / (count - 1)) * 980 + 10;
      // Normalized Y: range between 20 (top) and 240 (bottom)
      const minVal = base - timeframeChangeUsd * 1.2;
      const maxVal = base + timeframeChangeUsd * 0.5 + 1;
      const normalized = maxVal === minVal ? 0.5 : (val - minVal) / (maxVal - minVal);
      const y = 230 - (normalized * 180);

      const d = new Date();
      d.setDate(d.getDate() - Math.round((1 - progress) * (timeframe === '1D' ? 1 : timeframe === '7D' ? 7 : 30)));
      const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      pts.push({ x, y, val, label: dateLabel });
    }
    return pts;
  }, [livePortfolioValue, timeframe, timeframeChangeUsd]);

  const pathD = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x},${pt.y}`;
      // Smooth cubic bezier curves
      const prev = chartPoints[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }, '');
  }, [chartPoints]);

  const areaD = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return `${pathD} L ${last.x},260 L ${first.x},260 Z`;
  }, [pathD, chartPoints]);

  // Spot Assets Breakdown & Crypto List
  const spotAssetItems = useMemo(() => {
    return PORTFOLIO_CRYPTO_LIST.map((meta: CryptoAssetMeta) => {
      const bal = tokenBalances[meta.symbol] ?? 0;
      const marketMatch = markets.find(m => m.baseAsset === meta.symbol || m.symbol === `${meta.symbol}-USDC`);
      const price = marketMatch?.price || meta.defaultPrice;
      const usdVal = bal * price;
      const change24h = marketMatch ? marketMatch.change24h : (meta.symbol === 'USDC' || meta.symbol === 'USDT' ? 0.0 : 3.15);
      const allocationPct = livePortfolioValue > 0 ? (usdVal / livePortfolioValue) * 100 : 0;
      return {
        ...meta,
        balance: bal,
        price,
        usdVal,
        change24h,
        allocationPct,
        marketId: marketMatch?.id,
      };
    })
    .filter(a => {
      if (hideZeroBalances && a.balance <= 0 && a.usdVal < 0.5) return false;
      if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
      if (!spotSearch.trim()) return true;
      const q = spotSearch.toLowerCase();
      return a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    })
    .sort((a, b) => b.usdVal - a.usdVal);
  }, [tokenBalances, markets, spotSearch, hideZeroBalances, selectedCategory, livePortfolioValue]);

  // Form Handlers
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositErrorMsg('');
    setDepositSuccessMsg('');
    const amt = parseFloat(depositAmount) || 0;
    if (amt <= 0) {
      setDepositErrorMsg('Please enter a valid deposit amount.');
      return;
    }

    setIsDepositing(true);

    // Simulate on-chain verification check (takes 1.2s then returns failed deposit as requested)
    setTimeout(() => {
      setIsDepositing(false);
      const res = depositTokens(depositAsset, amt, depositNetwork, true);
      if (!res.success) {
        setDepositErrorMsg(
          res.error || `Deposit Failed: No incoming on-chain transfer of ${amt} ${depositAsset} detected on ${depositNetwork} for address ${currentDepositAddress.slice(0, 8)}... Please send transaction first.`
        );
      }
    }, 1200);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }
    const res = withdrawTokens(withdrawAsset, amt, withdrawAddress, withdrawNetwork);
    if (!res.success) {
      setWithdrawError(res.error || 'Withdrawal failed.');
    } else {
      setWithdrawSuccessMsg(`Transferred $${amt} ${withdrawAsset} to ${withdrawAddress.slice(0, 8)}...`);
      setTimeout(() => {
        setWithdrawSuccessMsg('');
        setActiveModal(null);
      }, 1400);
    }
  };

  // Asset price lookup for swap calculations
  const getAssetPrice = (sym: string): number => {
    if (sym === 'USDC' || sym === 'USDT') return 1.0;
    const found = markets.find(m => m.baseAsset === sym || m.symbol === `${sym}-USDC` || m.symbol === `${sym}-USDT`);
    if (found) return found.price;
    const meta = PORTFOLIO_CRYPTO_LIST.find(c => c.symbol === sym);
    return meta ? meta.defaultPrice : 1.0;
  };

  // Calculate swap output
  const calculatedSwapOutput = useMemo(() => {
    const amt = parseFloat(swapAmount) || 0;
    if (amt <= 0) return 0;
    const fromP = getAssetPrice(swapFromAsset);
    const toP = getAssetPrice(swapToAsset);
    if (toP <= 0) return 0;
    return (amt * fromP) / toP;
  }, [swapAmount, swapFromAsset, swapToAsset, markets]);

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSwapError('');
    const amt = parseFloat(swapAmount);
    if (!amt || amt <= 0) {
      setSwapError('Please enter a valid swap amount.');
      return;
    }
    const res = swapTokens(swapFromAsset, swapToAsset, amt);
    if (!res.success) {
      setSwapError(res.error || 'Swap failed.');
    } else {
      setSwapSuccessMsg(`Swapped ${amt} ${swapFromAsset} to ${res.toAmount?.toFixed(4)} ${swapToAsset}!`);
      setTimeout(() => {
        setSwapSuccessMsg('');
        setActiveModal(null);
      }, 1500);
    }
  };

  return (
    <div className="w-full text-white font-sans selection:bg-[#00d2ff]/20">
      {/* ================= 1. TOP HORIZONTAL NAVIGATION TABS ================= */}
      {/* Exactly as seen in screenshot: Overview (active white underline) | Perps | Spot */}
      <div className="border-b border-[#1b1f2b] mb-6 flex items-center justify-between">
        <div className="flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'overview' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('overview')}</span>
            {activeTab === 'overview' && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('perps')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'perps' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('perps')}</span>
            {activeTab === 'perps' && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('spot')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'spot' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('spot')}</span>
            {activeTab === 'spot' && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
        </div>

        {/* Live Mode Indicator */}
        <div className="pb-3 flex items-center gap-2">
          <div className="text-xs font-mono text-white bg-blue-600/20 border border-blue-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-bold text-blue-400">{t('liveTrading')}</span>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW (EXACT SCREENSHOT LAYOUT) ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Row: Balances on Left, Action Buttons & Timeframe Pills on Right */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left Column: Estimated Balance & 7-Day Change */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
                <span>{t('estimatedBalance')}</span>
                <button
                  type="button"
                  onClick={() => setHideBalances(!hideBalances)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title={hideBalances ? t('showBalancesLabel') : t('hideBalancesLabel')}
                >
                  {hideBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Giant Balance Header: "$0.00" or dynamic real portfolio total */}
              <div className="text-4xl sm:text-5xl font-normal text-white tracking-tight font-sans">
                {hideBalances ? (
                  '••••••'
                ) : (
                  `$${livePortfolioValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                )}
              </div>

              {/* Subtext: "+$0.00 (+0.00%) Last 7 Days" */}
              <div className="text-xs font-sans pt-1 flex items-center gap-1.5">
                <span className={`font-medium ${isGreenChart ? 'text-emerald-400' : 'text-[#00d2ff]'}`}>
                  {hideBalances
                    ? '••••••'
                    : livePortfolioValue === 0
                    ? '+$0.00 (+0.00%)'
                    : `+${timeframeChangeUsd >= 0 ? '$' : '-$'}${Math.abs(timeframeChangeUsd).toFixed(2)} (+${timeframeChangePct.toFixed(2)}%)`}
                </span>
                <span className="text-slate-400">{timeframeLabel}</span>
              </div>
            </div>

            {/* Right Column: Action Buttons & Timeframe Pill Selector */}
            <div className="flex flex-col items-start md:items-end gap-4">
              {/* Top Row: White Pill Action Buttons (Swap, Withdraw, Deposit) */}
              <div className="flex items-center gap-2.5">
                {/* 1. Swap */}
                <button
                  type="button"
                  onClick={() => setActiveModal('swap')}
                  className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{t('swap')}</span>
                </button>

                {/* 2. Withdraw */}
                <button
                  type="button"
                  onClick={() => setActiveModal('withdraw')}
                  className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center">
                    <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                  <span>{t('withdraw')}</span>
                </button>

                {/* 3. Deposit */}
                <button
                  type="button"
                  onClick={() => setActiveModal('deposit')}
                  className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center">
                    <ArrowDown className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                  <span>{t('deposit')}</span>
                </button>

                <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:block" />
              </div>

              {/* Bottom Row: Timeframe Pill Selector (1 Day | 7 Days | 1 Month | 90 Days | 1 Year | All Time) */}
              <div className="flex items-center bg-[#0e1118] p-1 rounded-full border border-[#1b1f2b]">
                {[
                  { id: '1D', label: '1D' },
                  { id: '7D', label: '7D' },
                  { id: '1M', label: '1M' },
                  { id: '90D', label: '90D' },
                  { id: '1Y', label: '1Y' },
                  { id: 'ALL', label: t('allTime') },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id as Timeframe)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      timeframe === tf.id
                        ? 'bg-[#222733] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= 2. MAIN INTERACTIVE EQUITY CHART ================= */}
          {/* Matches the spacious cinematic dark area with left axis border */}
          <div className="w-full h-64 sm:h-72 relative rounded-2xl bg-[#06070a]/60 border-l border-[#1b1f2b] overflow-hidden flex flex-col justify-end p-2 group">
            {/* Subtle atmospheric backdrop glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#00d2ff]/5 via-transparent to-transparent pointer-events-none" />

            {/* SVG Chart Engine */}
            <svg
              className="w-full h-full relative z-10 overflow-visible"
              viewBox="0 0 1000 260"
              preserveAspectRatio="none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
                const idx = Math.round(ratio * (chartPoints.length - 1));
                const pt = chartPoints[idx];
                if (pt) setHoveredPoint(pt);
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="hlqAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={chartStrokeColor} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={chartStrokeColor} stopOpacity="0.0" />
                </linearGradient>
                <filter id="hlqLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Area Gradient Fill */}
              {areaD && <path d={areaD} fill="url(#hlqAreaGrad)" />}

              {/* Luminous Neon Curve */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={chartStrokeColor}
                  strokeWidth="2"
                  filter="url(#hlqLineGlow)"
                />
              )}

              {/* Interactive Scrubber Cursor Line */}
              {hoveredPoint && (
                <g>
                  <line
                    x1={hoveredPoint.x}
                    y1="10"
                    x2={hoveredPoint.x}
                    y2="260"
                    stroke={chartStrokeColor}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.7"
                  />
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="4"
                    fill={chartStrokeColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-[#0e1118] border border-[#1e2536] px-2.5 py-1.5 rounded-lg shadow-xl text-xs font-mono"
                style={{
                  left: `${(hoveredPoint.x / 1000) * 100}%`,
                  top: '15px',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="text-slate-400 text-[10px]">{hoveredPoint.label}</div>
                <div className="text-white font-bold">${hoveredPoint.val.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* ================= 3. BOTTOM METRICS GRID (PnL, Funding, Trading) ================= */}
          {/* Exactly matching the 3 columns from the user's screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-[#1b1f2b]/80">
            {/* Column 1: PnL */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">{t('pnlLabel')}</h3>
              <div className="space-y-3 text-xs">
                {/* Total PnL */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-400 border-b border-dotted border-slate-600 pb-0.5 cursor-help"
                    title={t('totalPnlLabel')}
                  >
                    {t('totalPnlLabel')}
                  </span>
                  <span className="font-mono font-medium text-[#00d2ff]">
                    {hideBalances
                      ? '••••••'
                      : totalPnl >= 0
                      ? `$${totalPnl.toFixed(2)}`
                      : `-$${Math.abs(totalPnl).toFixed(2)}`}
                  </span>
                </div>

                {/* Realized profit */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-400 border-b border-dotted border-slate-600 pb-0.5 cursor-help"
                    title={t('realizedProfit')}
                  >
                    {t('realizedProfit')}
                  </span>
                  <span className="font-mono font-medium text-[#00d2ff]">
                    {hideBalances
                      ? '••••••'
                      : realizedProfit >= 0
                      ? `$${realizedProfit.toFixed(2)}`
                      : `-$${Math.abs(realizedProfit).toFixed(2)}`}
                  </span>
                </div>

                {/* Funding PnL */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-400 border-b border-dotted border-slate-600 pb-0.5 cursor-help"
                    title={t('fundingPnl')}
                  >
                    {t('fundingPnl')}
                  </span>
                  <span className="font-mono font-medium text-[#00d2ff]">
                    {hideBalances ? '••••••' : `$${fundingPnl.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Funding */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">{t('fundingLabel')}</h3>
              <div className="space-y-3 text-xs">
                {/* Total deposits */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('totalDeposits')}</span>
                  <span className="font-mono font-medium text-white">
                    {hideBalances ? '••••••' : `$${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>

                {/* Total withdrawals */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('totalWithdrawals')}</span>
                  <span className="font-mono font-medium text-white">
                    {hideBalances ? '••••••' : `$${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>

                {/* Net funding */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-400 border-b border-dotted border-slate-600 pb-0.5 cursor-help"
                    title={t('netFunding')}
                  >
                    {t('netFunding')}
                  </span>
                  <span className="font-mono font-medium text-white">
                    {hideBalances ? '••••••' : `$${netFunding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Trading */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">{t('trading')}</h3>
              <div className="space-y-3 text-xs">
                {/* Trades executed */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('tradesExecuted')}</span>
                  <span className="font-mono font-medium text-white">{tradesExecuted}</span>
                </div>

                {/* Total volume */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('totalVolume')}</span>
                  <span className="font-mono font-medium text-white">
                    ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Win rate */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-400 border-b border-dotted border-slate-600 pb-0.5 cursor-help"
                    title={t('winRate')}
                  >
                    {t('winRate')}
                  </span>
                  <span className="font-mono font-medium text-white">{winRate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 4. CRYPTOCURRENCY ASSETS LIST ================= */}
          <div className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{t('cryptoAssets')}</span>
                  <span className="text-xs font-mono text-slate-400 font-normal">
                    ({spotAssetItems.length} {t('tokensCount')})
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t('cryptoAssetsSubtitle')}
                </p>
              </div>

              {/* Filters & Search Row */}
              <div className="flex items-center flex-wrap gap-2.5">
                {/* Search Bar */}
                <div className="relative w-44 sm:w-52">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={spotSearch}
                    onChange={(e) => setSpotSearch(e.target.value)}
                    placeholder={t('searchCrypto')}
                    className="w-full bg-[#0e1118] border border-[#1b1f2b] focus:border-[#00d2ff] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center bg-[#0e1118] p-0.5 rounded-xl border border-[#1b1f2b] text-xs">
                  {(['all', 'layer1', 'defi', 'stablecoin'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${
                        selectedCategory === cat
                          ? 'bg-[#222733] text-white shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'all' ? t('all') : cat === 'layer1' ? 'L1' : cat}
                    </button>
                  ))}
                </div>

                {/* Hide 0 Balances Toggle */}
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideZeroBalances}
                    onChange={(e) => setHideZeroBalances(e.target.checked)}
                    className="rounded border-[#1b1f2b] bg-[#0e1118] text-[#00d2ff] focus:ring-0"
                  />
                  <span>{t('hideZero')}</span>
                </label>
              </div>
            </div>

            {/* Cryptos Table Card */}
            <div className="bg-[#090b10] border border-[#1b1f2b] rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#1b1f2b] text-[11px] text-slate-400 font-mono">
                      <th className="py-3 px-4 font-normal">{t('asset')}</th>
                      <th className="py-3 px-4 font-normal text-right">{t('price')}</th>
                      <th className="py-3 px-4 font-normal text-right">{t('change24h')}</th>
                      <th className="py-3 px-4 font-normal text-right">{t('balance')}</th>
                      <th className="py-3 px-4 font-normal text-right">{t('valueUsd')}</th>
                      <th className="py-3 px-4 font-normal text-right">{t('allocation')}</th>
                      <th className="py-3 px-4 font-normal text-right">{t('quickActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14161e]">
                    {spotAssetItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                          {t('noCryptoMatching')}
                        </td>
                      </tr>
                    ) : (
                      spotAssetItems.map((asset) => (
                        <tr
                          key={asset.symbol}
                          className="hover:bg-[#11131a] transition-colors group"
                        >
                          {/* Asset (Logo, Symbol, Name, Category) */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <CryptoLogo symbol={asset.symbol} size="sm" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white font-mono text-sm group-hover:text-[#00d2ff] transition-colors">
                                    {asset.symbol}
                                  </span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#181c26] text-slate-400 border border-[#232733] uppercase">
                                    {asset.category}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {asset.name}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 text-right font-mono text-white">
                            ${asset.price < 0.0001
                              ? asset.price.toFixed(8)
                              : asset.price.toLocaleString('en-US', {
                                  minimumFractionDigits: asset.price < 1 ? 4 : 2,
                                  maximumFractionDigits: asset.price < 1 ? 4 : 2,
                                })}
                          </td>

                          {/* 24h Change */}
                          <td className="py-3 px-4 text-right font-mono font-medium">
                            <span className={asset.change24h >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}>
                              {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                            </span>
                          </td>

                          {/* Balance */}
                          <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                            {hideBalances
                              ? '••••••'
                              : asset.balance === 0
                              ? '0.00'
                              : asset.balance.toLocaleString('en-US', {
                                  minimumFractionDigits: asset.symbol === 'BTC' ? 4 : 2,
                                  maximumFractionDigits: asset.symbol === 'BTC' ? 4 : 2,
                                })}
                          </td>

                          {/* Value USD */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {hideBalances
                              ? '••••••'
                              : '$' + asset.usdVal.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                          </td>

                          {/* Allocation */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-mono text-[11px] text-slate-300">
                                {hideBalances ? '—' : `${asset.allocationPct.toFixed(1)}%`}
                              </span>
                              <div className="w-16 h-1.5 bg-[#1a1f2b] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#00d2ff] rounded-full transition-all"
                                  style={{ width: `${Math.min(100, Math.max(0, asset.allocationPct))}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Swap */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSwapFromAsset(asset.symbol);
                                  setActiveModal('swap');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#181d28] hover:bg-[#232a3a] border border-[#242b3b] text-slate-200 hover:text-white text-[11px] font-medium transition-all"
                              >
                                {t('swap')}
                              </button>

                              {/* Deposit */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDepositAsset(asset.symbol);
                                  const nets = getAvailableDepositNetworks(asset.symbol);
                                  if (nets.length > 0) setDepositNetwork(nets[0].networkId);
                                  setActiveModal('deposit');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#181d28] hover:bg-[#232a3a] border border-[#242b3b] text-slate-200 hover:text-white text-[11px] font-medium transition-all"
                              >
                                {t('deposit')}
                              </button>

                              {/* Trade */}
                              {asset.marketId && (
                                <button
                                  type="button"
                                  onClick={() => onTradeMarket?.(asset.marketId!)}
                                  className="px-2.5 py-1 rounded-lg bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/30 text-[11px] font-bold transition-all"
                                >
                                  {t('trade')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PERPS (PERPETUAL FUTURES) ================= */}
      {activeTab === 'perps' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Perps Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#090b10] border border-[#1b1f2b]">
            <div>
              <div className="text-xs text-slate-400">{t('crossMarginBalance')}</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ${liveAvailableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">{t('unrealizedPnl')}</div>
              <div className={`text-2xl font-bold font-mono mt-1 ${unrealizedProfit >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}`}>
                {unrealizedProfit >= 0 ? '+' : ''}${unrealizedProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">{t('activePositions')}</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {livePositions.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">{t('executionEngine')}</div>
              <div className="text-xs font-mono text-emerald-400 mt-2 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hyperliquid L1</span>
              </div>
            </div>
          </div>

          {/* Open Positions Table */}
          <div className="bg-[#090b10] border border-[#1b1f2b] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#1b1f2b] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{t('activePerpPositions')}</h3>
              <span className="text-xs text-slate-400 font-mono">{livePositions.length} {t('openCount')}</span>
            </div>

            {livePositions.length === 0 ? (
              <div className="py-14 text-center text-slate-500 text-xs space-y-2">
                <p>{t('noActivePerpPositions')}</p>
                <button
                  onClick={() => onTradeMarket?.('BTC-PERP')}
                  className="px-4 py-1.5 rounded-full bg-[#00d2ff] text-black font-bold text-xs"
                >
                  {t('openBtcPerpTrade')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#1b1f2b] text-[11px] text-slate-500 font-mono">
                      <th className="py-2.5 px-4 font-normal">{t('market')}</th>
                      <th className="py-2.5 px-4 font-normal">{t('size')}</th>
                      <th className="py-2.5 px-4 font-normal">{t('entryPrice')}</th>
                      <th className="py-2.5 px-4 font-normal">{t('markPrice')}</th>
                      <th className="py-2.5 px-4 font-normal">{t('liqPrice')}</th>
                      <th className="py-2.5 px-4 font-normal text-right">{t('unrealizedPnl')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14161e]">
                    {livePositions.map((pos) => (
                      <tr key={pos.id} className="hover:bg-[#11131a] transition-colors">
                        <td className="py-3 px-4 font-bold text-white font-mono flex items-center gap-2">
                          <span>{pos.symbol}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${pos.side === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {pos.leverage}x {pos.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-200">
                          {pos.size.toFixed(4)} {pos.baseAsset}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          ${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 font-mono text-white">
                          ${pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-400">
                          ${pos.liqPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '—'}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${pos.unrealizedPnl >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}`}>
                          {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)} ({pos.unrealizedPnlPercent >= 0 ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SPOT (SPOT HOLDINGS & CRYPTOCURRENCIES) ================= */}
      {activeTab === 'spot' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Spot Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">{t('spotBalancesAssets')}</h2>
              <p className="text-xs text-slate-400">
                {t('selfCustodialAssetsDesc')}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={spotSearch}
                onChange={(e) => setSpotSearch(e.target.value)}
                placeholder={t('searchToken')}
                className="w-full bg-[#0d1017] border border-[#1b1f2b] focus:border-[#00d2ff] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Spot Assets Table */}
          <div className="bg-[#090b10] border border-[#1b1f2b] rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#1b1f2b] text-[11px] text-slate-500 font-mono">
                  <th className="py-3 px-4 font-normal">{t('token')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('availableBalanceLabel')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('price')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('valueUsd')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14161e]">
                {spotAssetItems.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-[#11131a] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <CryptoLogo symbol={asset.symbol} size="sm" />
                        <div>
                          <div className="font-bold text-white font-mono">{asset.symbol}</div>
                          <div className="text-[10px] text-slate-400">{asset.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium text-white">
                      {hideBalances
                        ? '••••••'
                        : asset.balance.toLocaleString(undefined, {
                            minimumFractionDigits: asset.symbol === 'BTC' ? 4 : 2,
                            maximumFractionDigits: asset.symbol === 'BTC' ? 4 : 2,
                          })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {hideBalances
                        ? '••••••'
                        : '$' + asset.usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setDepositAsset(asset.symbol);
                            const nets = getAvailableDepositNetworks(asset.symbol);
                            if (nets.length > 0) setDepositNetwork(nets[0].networkId);
                            setActiveModal('deposit');
                          }}
                          className="px-2 py-1 rounded bg-[#161a24] hover:bg-[#202735] text-slate-300 hover:text-white text-[11px] font-semibold"
                        >
                          {t('deposit')}
                        </button>
                        <button
                          onClick={() => asset.marketId && onTradeMarket?.(asset.marketId)}
                          className="px-2 py-1 rounded bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 text-[#00d2ff] text-[11px] font-bold"
                        >
                          {t('trade')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: SWAP ================= */}
      {activeModal === 'swap' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0a0c12] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden p-6 font-sans">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1e2b]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">{t('instantDexSwap')}</h3>
            <p className="text-xs text-slate-400 mb-4">
              {t('swapZeroSlippageDesc')}
            </p>

            {swapError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{swapError}</span>
              </div>
            )}

            {swapSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{swapSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSwapSubmit} className="space-y-3.5">
              {/* You Pay Section */}
              <div className="p-3.5 bg-[#12151e] border border-[#222838] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{t('youPay')}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <span>{t('balance')}:</span>
                    <span className="text-white font-bold">
                      {(tokenBalances[swapFromAsset] ?? (swapFromAsset === 'USDC' ? liveBalance : 0)).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSwapAmount(String(tokenBalances[swapFromAsset] ?? (swapFromAsset === 'USDC' ? liveBalance : 1000)))}
                      className="text-[#00d2ff] hover:underline ml-1 font-bold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-transparent text-xl font-mono font-bold text-white placeholder-slate-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTokenPickerTarget('swapFrom')}
                    className="flex items-center gap-2 bg-[#1b202d] hover:bg-[#252b3d] border border-[#2c3345] hover:border-[#00d2ff] rounded-2xl px-3 py-2 text-xs font-bold text-white transition-all shadow-sm shrink-0"
                  >
                    <CryptoLogo symbol={swapFromAsset} size="xs" />
                    <span>{swapFromAsset}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Flip Button */}
              <div className="flex justify-center -my-1 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    const temp = swapFromAsset;
                    setSwapFromAsset(swapToAsset);
                    setSwapToAsset(temp);
                  }}
                  className="w-8 h-8 rounded-full bg-[#1b202d] border border-[#2c3345] hover:border-[#00d2ff] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md group"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
                </button>
              </div>

              {/* You Receive Section */}
              <div className="p-3.5 bg-[#12151e] border border-[#222838] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{t('youReceiveEst')}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{t('zeroSlippage')}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xl font-mono font-bold text-emerald-400">
                    {calculatedSwapOutput.toFixed(4)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setTokenPickerTarget('swapTo')}
                    className="flex items-center gap-2 bg-[#1b202d] hover:bg-[#252b3d] border border-[#2c3345] hover:border-[#00d2ff] rounded-2xl px-3 py-2 text-xs font-bold text-white transition-all shadow-sm shrink-0"
                  >
                    <CryptoLogo symbol={swapToAsset} size="xs" />
                    <span>{swapToAsset}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Rate & Fee Info */}
              <div className="p-2.5 bg-[#0d1017] border border-[#1b1f2b] rounded-xl space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex items-center justify-between">
                  <span>{t('exchangeRate')}</span>
                  <span className="text-white font-bold">
                    1 {swapFromAsset} ≈ {(getAssetPrice(swapFromAsset) / getAssetPrice(swapToAsset)).toFixed(6)} {swapToAsset}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('networkGasFee')}</span>
                  <span className="text-emerald-400 font-bold">$0.00 ({t('zeroGasLabel')})</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs shadow-lg transition-all mt-2"
              >
                {t('confirmSwap')} ({swapFromAsset} → {swapToAsset})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: WITHDRAW ================= */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0a0c12] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden p-6 font-sans">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1e2b]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">{t('withdraw')}</h3>
            <p className="text-xs text-slate-400 mb-4">
              {t('withdrawSubtitle')}
            </p>

            {withdrawError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{withdrawSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">{t('selectAsset')}</label>
                <button
                  type="button"
                  onClick={() => setTokenPickerTarget('withdraw')}
                  className="w-full mt-1 flex items-center justify-between bg-[#121622] hover:bg-[#1a202d] border border-[#222838] hover:border-[#00d2ff] rounded-xl px-3 py-2 text-xs font-bold text-white transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CryptoLogo symbol={withdrawAsset} size="xs" />
                    <span>{withdrawAsset}</span>
                    <span className="text-slate-400 font-normal text-[11px]">
                      ({PORTFOLIO_CRYPTO_LIST.find(c => c.symbol === withdrawAsset)?.name || withdrawAsset})
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">{t('destinationAddress')}</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full mt-1 bg-[#121622] border border-[#222838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2ff] font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">{t('withdrawAmount')}</label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount('1000')}
                    className="text-[#00d2ff] hover:underline font-mono"
                  >
                    MAX
                  </button>
                </div>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full mt-1 bg-[#121622] border border-[#222838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2ff] font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs shadow-lg transition-all mt-2"
              >
                {t('confirmWithdrawal')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DEPOSIT ================= */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0a0c12] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden p-6 font-sans">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1e2b]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">{t('deposit')}</h3>
            <p className="text-xs text-slate-400 mb-4">
              {t('depositSubtitle')}
            </p>

            {depositSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{depositSuccessMsg}</span>
              </div>
            )}

            {depositErrorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1 leading-relaxed">{depositErrorMsg}</div>
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">{t('selectAsset')}</label>
                <button
                  type="button"
                  onClick={() => setTokenPickerTarget('deposit')}
                  className="w-full mt-1 flex items-center justify-between bg-[#121622] hover:bg-[#1a202d] border border-[#222838] hover:border-[#00d2ff] rounded-xl px-3 py-2 text-xs font-bold text-white transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CryptoLogo symbol={depositAsset} size="xs" />
                    <span>{depositAsset}</span>
                    <span className="text-slate-400 font-normal text-[11px]">
                      ({PORTFOLIO_CRYPTO_LIST.find(c => c.symbol === depositAsset)?.name || depositAsset})
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">{t('depositNetwork')}</label>
                <div className="mt-1 space-y-1.5">
                  <select
                    value={depositNetwork}
                    onChange={(e) => setDepositNetwork(e.target.value)}
                    className="w-full bg-[#121622] border border-[#222838] focus:border-[#00d2ff] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {availableDepositNetworks.map((net) => (
                      <option key={net.networkId} value={net.networkId}>
                        {net.networkName} ({net.networkId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deposit Address Box with QR code and Copy */}
              <div className="p-3.5 bg-[#11141e] border border-[#222838] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span className="text-[10px] text-slate-300 uppercase font-mono tracking-wider font-semibold">
                      {depositAsset} {t('depositAddress')} ({depositNetwork})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {t('activeVerified')}
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-[#080a0f] border border-[#1b212f]">
                  {depositQrDataUrl ? (
                    <div className="relative group shrink-0">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 p-2 bg-white rounded-xl shadow-lg flex items-center justify-center">
                        <img
                          src={depositQrDataUrl}
                          alt={`${depositAsset} (${depositNetwork}) Deposit QR Code`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-mono pointer-events-none">
                        {t('scanToPay')}
                      </div>
                    </div>
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-[#121622] rounded-xl flex items-center justify-center text-slate-500 font-mono text-[11px] animate-pulse">
                      {t('generating')}
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">{t('scanQrOrCopy')}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentDepositAddress);
                          setCopiedDepositAddr(true);
                          setTimeout(() => setCopiedDepositAddr(false), 2000);
                        }}
                        className="text-[10px] text-[#00d2ff] hover:underline font-mono flex items-center gap-1"
                      >
                        {copiedDepositAddr ? t('addressCopied') : t('copyString')}
                      </button>
                    </div>

                    <div className="p-2 rounded-lg bg-[#0d1017] border border-[#1f2636] font-mono text-[11px] text-white break-all select-all leading-relaxed">
                      {currentDepositAddress}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentDepositAddress);
                          setCopiedDepositAddr(true);
                          setTimeout(() => setCopiedDepositAddr(false), 2000);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#181d28] hover:bg-[#222938] border border-[#242c3d] hover:border-[#00d2ff]/40 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedDepositAddr ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">{t('copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#00d2ff]" />
                            <span>{t('copyAddress')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 leading-normal flex items-center justify-between pt-0.5">
                  <span>{depositAsset} · {depositNetwork}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">{t('amountToCredit')}</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full mt-1 bg-[#121622] border border-[#222838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2ff] font-mono"
                  placeholder="1000"
                />
              </div>

              <button
                type="submit"
                disabled={isDepositing}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 text-black font-extrabold text-xs shadow-lg transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {isDepositing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('verifyingOnChainTransfer')}</span>
                  </>
                ) : (
                  <span>{t('completeDeposit')} (+${depositAmount} {depositAsset})</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global Token Selector Modal */}
      <TokenSelectorModal
        isOpen={tokenPickerTarget !== null}
        onClose={() => setTokenPickerTarget(null)}
        selectedToken={
          tokenPickerTarget === 'swapFrom'
            ? swapFromAsset
            : tokenPickerTarget === 'swapTo'
            ? swapToAsset
            : tokenPickerTarget === 'deposit'
            ? depositAsset
            : withdrawAsset
        }
        excludeToken={
          tokenPickerTarget === 'swapFrom'
            ? swapToAsset
            : tokenPickerTarget === 'swapTo'
            ? swapFromAsset
            : undefined
        }
        onSelectToken={(sym) => {
          if (tokenPickerTarget === 'swapFrom') setSwapFromAsset(sym);
          else if (tokenPickerTarget === 'swapTo') setSwapToAsset(sym);
          else if (tokenPickerTarget === 'deposit') {
            setDepositAsset(sym);
            const nets = getAvailableDepositNetworks(sym);
            if (nets.length > 0) {
              setDepositNetwork(nets[0].networkId);
            }
          }
          else if (tokenPickerTarget === 'withdraw') setWithdrawAsset(sym);
          setTokenPickerTarget(null);
        }}
      />
    </div>
  );
};
