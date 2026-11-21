import React, { useState, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import { RegisteredUser, SUPERADMIN_EMAIL, SUPERADMIN_EMAILS } from '../types/user';
import { ClosedTrade } from '../types/market';
import { MasterTrader, MasterTraderDeal, MasterTraderClosedDeal } from '../data/copytradingData';
import { formatPrice } from '../utils/tradingMath';
import { CryptoLogo } from './CryptoLogo';
import { Identicon } from './Identicon';
import { GmailSenderConnectionCard } from './GmailVerificationModal';
import { ProfitCalendar } from './ProfitCalendar';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  DollarSign,
  TrendingUp,
  History,
  UserCheck,
  UserPlus,
  Edit3,
  Trash2,
  PlusCircle,
  Check,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ExternalLink,
  Calendar as CalendarIcon,
  Sparkles,
  Zap,
  Lock,
  ArrowUpDown,
  RefreshCw,
  Award,
  Flame,
  ChevronRight,
  ChevronDown,
  X,
  Sliders,
  Wallet,
} from 'lucide-react';

interface AdminPanelProps {
  onBackToTerminal?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToCopytrading?: () => void;
}

type AdminTab = 'balances' | 'trades' | 'copytrading' | 'overview';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToTerminal,
  onNavigateToCalendar,
  onNavigateToCopytrading,
}) => {
  const {
    currentUser,
    registeredUsers,
    updateUserBalance,
    updateUserTrades,
    adminAddTrade,
    adminEditTrade,
    adminDeleteTrade,
    adminPromoteToMasterTrader,
    adminRemoveMasterTrader,
    adminUpdateMasterTrader,
    adminCreateUser,
    adminDeleteUser,
    switchUser,
    masterTraders,
    closedTrades,
    markets,
    liveBalance,
    isAdmin,
    loginUser,
    t,
  } = useTrading();

  const [activeTab, setActiveTab] = useState<AdminTab>('balances');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Authorization Check: Strictly restricted to anatolimarcenko980@gmail.com
  const isAuthorizedAdmin = Boolean(
    isAdmin &&
    currentUser &&
    currentUser.email?.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
  );

  // Selected User for details / edit
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentUser?.id || registeredUsers[0]?.id || 'NX-94718'
  );
  const selectedUser = useMemo(() => {
    return registeredUsers.find((u) => u.id === selectedUserId) || registeredUsers[0];
  }, [registeredUsers, selectedUserId]);

  // Balance Editing Modal / Form
  const [editingBalanceUser, setEditingBalanceUser] = useState<RegisteredUser | null>(null);
  const [newUsdcBalance, setNewUsdcBalance] = useState<string>('0');
  const [tokenAdjustments, setTokenAdjustments] = useState<Record<string, string>>({
    BTC: '0.25',
    ETH: '3.5',
    SOL: '25.0',
    HYPE: '150.0',
  });

  // Trades Management State
  const [tradeSearchUser, setTradeSearchUser] = useState<string>('');
  const [isAddingTradeModal, setIsAddingTradeModal] = useState<boolean>(false);
  const [editingTrade, setEditingTrade] = useState<ClosedTrade | null>(null);
  const [showUserCalendarPreview, setShowUserCalendarPreview] = useState<boolean>(true);

  // New Trade Form Fields
  const [tradeMarketId, setTradeMarketId] = useState<string>('BTC-USDC');
  const [tradeSide, setTradeSide] = useState<'long' | 'short'>('long');
  const [tradeLeverage, setTradeLeverage] = useState<number>(50);
  const [tradeEntryPrice, setTradeEntryPrice] = useState<string>('86420.00');
  const [tradeExitPrice, setTradeExitPrice] = useState<string>('87150.00');
  const [tradeSizeUsdc, setTradeSizeUsdc] = useState<string>('4925.94');
  const [tradePnl, setTradePnl] = useState<string>('56.00');
  const [tradePnlPercent, setTradePnlPercent] = useState<string>('42.24');
  const [tradeDate, setTradeDate] = useState<string>('2026-09-23');

  // Copytrading Promotion Modal
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState<boolean>(false);
  const [promoteUserId, setPromoteUserId] = useState<string>('');
  const [promoteName, setPromoteName] = useState<string>('');
  const [promoteHandle, setPromoteHandle] = useState<string>('');
  const [promoteBio, setPromoteBio] = useState<string>('');
  const [promoteRank, setPromoteRank] = useState<number>(1);
  const [promote30dPnlPct, setPromote30dPnlPct] = useState<string>('92.40');
  const [promote30dPnlAmt, setPromote30dPnlAmt] = useState<string>('68450');
  const [promoteWinRate, setPromoteWinRate] = useState<string>('96.80');
  const [promoteAum, setPromoteAum] = useState<string>('245000');
  const [promoteCopiers, setPromoteCopiers] = useState<string>('3920');
  const [promoteDrawdown, setPromoteDrawdown] = useState<string>('0.00');
  const [promoteProfitShare, setPromoteProfitShare] = useState<number>(10);
  const [promoteBias, setPromoteBias] = useState<string>('Bullish');
  const [promoteVerified, setPromoteVerified] = useState<boolean>(true);
  const [promoteStyleTags, setPromoteStyleTags] = useState<string>('Perps, HFT, Alpha, Hyperliquid L1');

  // Search in user list
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return registeredUsers;
    const q = userSearchQuery.toLowerCase();
    return registeredUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.fullName && u.fullName.toLowerCase().includes(q))
    );
  }, [registeredUsers, userSearchQuery]);

  // Trades associated with currently selected user (Real/Live trades only)
  const userTrades = useMemo(() => {
    if (!selectedUser) return [];
    return closedTrades.filter(
      (tradeItem) =>
        !tradeItem.isDemo &&
        (tradeItem.userId === selectedUser.id ||
          tradeItem.userEmail?.toLowerCase() === selectedUser.email.toLowerCase() ||
          (!tradeItem.userId && selectedUser.id === 'NX-94718'))
    );
  }, [closedTrades, selectedUser]);

  // Show Toast
  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // If NOT authorized admin
  if (!isAuthorizedAdmin) {
    return (
      <div className="w-full max-w-3xl mx-auto py-16 px-4 font-sans text-center">
        <div className="bg-[#0b0e14] border border-red-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{t('accessDenied', 'Access Denied')}</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
            The SuperAdmin Management Panel is strictly restricted to{' '}
            <strong className="text-white font-mono">{SUPERADMIN_EMAIL}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onBackToTerminal && (
              <button
                onClick={onBackToTerminal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#141a27] hover:bg-[#1d2538] border border-[#222a3d] text-slate-300 text-xs font-semibold transition-colors"
              >
                {t('backToTradingTerminal', 'Back to Trading Terminal')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle Quick Balance Set
  const handleQuickAddBalance = (user: RegisteredUser, delta: number) => {
    const isCurrent =
      user.id === currentUser?.id ||
      Boolean(currentUser && user.email.toLowerCase() === currentUser.email.toLowerCase());
    const current = isCurrent ? liveBalance : (user.balance ?? 0.0);
    const updated = Math.max(0, current + delta);
    updateUserBalance(user.id, updated, undefined, isCurrent);
    triggerFeedback(
      'success',
      `Updated ${user.username}'s USDC balance: $${current.toLocaleString()} → $${updated.toLocaleString()}${
        isCurrent ? ' (Reflected in Header & Terminal)' : ''
      }`
    );
  };

  // Handle Custom Balance Save
  const handleSaveCustomBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBalanceUser) return;
    const num = parseFloat(newUsdcBalance);
    if (isNaN(num) || num < 0) {
      triggerFeedback('error', 'Please enter a valid positive number for balance.');
      return;
    }
    const tokenParsed: Record<string, number> = {};
    Object.entries(tokenAdjustments).forEach(([k, v]) => {
      const parsed = parseFloat(v);
      if (!isNaN(parsed) && parsed >= 0) {
        tokenParsed[k] = parsed;
      }
    });

    const isCurrent =
      editingBalanceUser.id === currentUser?.id ||
      Boolean(currentUser && editingBalanceUser.email.toLowerCase() === currentUser.email.toLowerCase());

    updateUserBalance(editingBalanceUser.id, num, tokenParsed, isCurrent);
    triggerFeedback(
      'success',
      `Saved ${editingBalanceUser.username}'s balance: $${num.toLocaleString()} USDC${
        isCurrent ? ' (Reflected in Header & Terminal)' : ''
      }`
    );
    setEditingBalanceUser(null);
  };

  // Open Trade Add Modal with sensible defaults
  const handleOpenAddTrade = () => {
    setTradeMarketId('BTC-USDC');
    setTradeSide('long');
    setTradeLeverage(50);
    const currentPrice = markets.find((m) => m.id === 'BTC-USDC')?.price || 87850;
    setTradeEntryPrice((currentPrice * 0.99).toFixed(2));
    setTradeExitPrice((currentPrice * 1.01).toFixed(2));
    setTradeSizeUsdc('5000.00');
    setTradePnl('56.00');
    setTradePnlPercent('42.24');
    setTradeDate(new Date().toISOString().split('T')[0]);
    setEditingTrade(null);
    setIsAddingTradeModal(true);
  };

  // Open Trade Edit Modal
  const handleOpenEditTrade = (trade: ClosedTrade) => {
    setEditingTrade(trade);
    setTradeMarketId(trade.marketId);
    setTradeSide(trade.side);
    setTradeLeverage(trade.leverage);
    setTradeEntryPrice(trade.entryPrice.toString());
    setTradeExitPrice(trade.exitPrice.toString());
    setTradeSizeUsdc(trade.sizeUsdc.toString());
    setTradePnl(trade.pnl.toString());
    setTradePnlPercent(trade.pnlPercent.toString());
    setTradeDate(trade.dateString);
    setIsAddingTradeModal(true);
  };

  // Submit Trade (Add or Edit)
  const handleSaveTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = parseFloat(tradeEntryPrice);
    const exit = parseFloat(tradeExitPrice);
    const notional = parseFloat(tradeSizeUsdc);
    const pnlVal = parseFloat(tradePnl);
    const pnlPct = parseFloat(tradePnlPercent);

    if (isNaN(entry) || isNaN(exit) || isNaN(pnlVal)) {
      triggerFeedback('error', 'Please fill all numeric fields correctly.');
      return;
    }

    if (editingTrade) {
      adminEditTrade(editingTrade.id, {
        marketId: tradeMarketId,
        symbol: tradeMarketId,
        side: tradeSide,
        leverage: tradeLeverage,
        entryPrice: entry,
        exitPrice: exit,
        sizeUsdc: notional,
        pnl: pnlVal,
        pnlPercent: pnlPct,
        dateString: tradeDate,
      });
      triggerFeedback('success', `Trade ${editingTrade.id} successfully updated!`);
    } else {
      const targetUser = selectedUser;
      adminAddTrade(targetUser.id, {
        userId: targetUser.id,
        userEmail: targetUser.email,
        marketId: tradeMarketId,
        symbol: tradeMarketId,
        side: tradeSide,
        leverage: tradeLeverage,
        entryPrice: entry,
        exitPrice: exit,
        size: entry > 0 ? notional / entry : 0.1,
        sizeUsdc: notional,
        pnl: pnlVal,
        pnlPercent: pnlPct,
        closedAt: new Date(tradeDate).getTime() || Date.now(),
        dateString: tradeDate,
        isDemo: false,
      });
      triggerFeedback(
        'success',
        `New trade added for ${targetUser.username}: ${pnlVal >= 0 ? '+' : ''}$${pnlVal} on ${tradeDate}!`
      );
    }
    setIsAddingTradeModal(false);
    setEditingTrade(null);
  };

  // Open Promotion Modal for a specific user
  const handleOpenPromote = (user: RegisteredUser) => {
    setPromoteUserId(user.id);
    setPromoteName(user.fullName || user.username);
    setPromoteHandle(`@${user.username}`);
    setPromoteBio(
      `Hyperliquid L1 algorithmic HFT scalper & perpetuals specialist. Powered by ${user.username}'s quant engine.`
    );
    setPromoteRank(masterTraders.length + 1);
    setPromote30dPnlPct('94.50');
    setPromote30dPnlAmt('84200');
    setPromoteWinRate('97.30');
    setPromoteAum('245000');
    setPromoteCopiers('3840');
    setPromoteDrawdown('0.00');
    setPromoteProfitShare(10);
    setPromoteBias('Bullish');
    setPromoteVerified(true);
    setPromoteStyleTags('Perps, HFT, Alpha, Low Drawdown');
    setIsPromoteModalOpen(true);
  };

  // Confirm Promotion to Copytrading
  const handleConfirmPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    const userToPromote = registeredUsers.find((u) => u.id === promoteUserId);
    if (!userToPromote) return;

    const tagsArray = promoteStyleTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const activeDeals: MasterTraderDeal[] = [
      {
        id: 'deal-adm-1',
        marketSymbol: 'BTC-USDC',
        marketName: 'Bitcoin Perpetual',
        side: 'long',
        leverage: 20,
        entryPrice: 87400.0,
        currentPrice: 88250.0,
        size: 2.5,
        unrealizedPnl: 2125.0,
        unrealizedPnlPercent: 19.45,
        openTime: '1 hour ago',
        tpPrice: 91500.0,
        slPrice: 86000.0,
      },
      {
        id: 'deal-adm-2',
        marketSymbol: 'SOL-USDC',
        marketName: 'Solana Perpetual',
        side: 'long',
        leverage: 15,
        entryPrice: 182.5,
        currentPrice: 186.2,
        size: 50,
        unrealizedPnl: 185.0,
        unrealizedPnlPercent: 30.41,
        openTime: '3 hours ago',
        tpPrice: 198.0,
        slPrice: 177.0,
      },
    ];

    const closedDeals: MasterTraderClosedDeal[] = [
      {
        id: 'closed-adm-1',
        marketSymbol: 'ETH-USDC',
        side: 'long',
        leverage: 25,
        entryPrice: 2620.0,
        exitPrice: 2695.0,
        realizedPnl: 4687.5,
        realizedPnlPercent: 71.56,
        closedTime: 'Oct 24, 2026',
        duration: '18 hours',
      },
    ];

    const res = adminPromoteToMasterTrader(userToPromote.id, {
      id: userToPromote.walletAddress || userToPromote.id,
      name: promoteName.trim() || userToPromote.username,
      handle: promoteHandle.trim().startsWith('@')
        ? promoteHandle.trim()
        : `@${promoteHandle.trim()}`,
      address: userToPromote.walletAddress || '0x7F41...b92E',
      shortAddress: userToPromote.walletAddress
        ? `${userToPromote.walletAddress.slice(0, 6)}...${userToPromote.walletAddress.slice(-4)}`
        : userToPromote.id,
      verified: promoteVerified,
      avatarColor: 'from-amber-400 to-rose-600',
      avatarInitials: (promoteName || userToPromote.username).slice(0, 2).toUpperCase(),
      rank: promoteRank,
      bio: promoteBio,
      isTopProfitable: parseFloat(promote30dPnlPct) > 50,
      totalPnl: parseFloat(promote30dPnlAmt) || 68450,
      totalPnlPercent: parseFloat(promote30dPnlPct) || 94.5,
      winRate: parseFloat(promoteWinRate) || 97.3,
      copiersCount: parseInt(promoteCopiers) || 3840,
      aum: parseFloat(promoteAum) || 245000,
      maxDrawdown: parseFloat(promoteDrawdown) || 0.0,
      profitSharePercent: promoteProfitShare || 10,
      sharpeRatio: 4.52,
      bias: promoteBias,
      volume30d: `$${((parseFloat(promoteAum) || 245000) * 0.45).toFixed(1)}M`,
      aumFormatted: `$${((parseFloat(promoteAum) || 245000) / 1000).toFixed(1)}K`,
      avgTradesPerDay: 48.5,
      winRate30d: parseFloat(promoteWinRate) || 97.3,
      maxDrawdown30d: parseFloat(promoteDrawdown) || 0.0,
      lead30dPnlPercent: parseFloat(promote30dPnlPct) || 94.5,
      lead30dPnlAmount: parseFloat(promote30dPnlAmt) || 68450,
      sparkline: [20, 24, 30, 38, 45, 52, 60, 68, 74, 82, 88, 94.5],
      perpsTotalValue: parseFloat(promoteAum) || 245000,
      unrealizedPnl: 2310.0,
      unrealizedPnlPercent: 1.15,
      marginUsed: 45000.0,
      availableMargin: 200000.0,
      tradingStylePills: tagsArray.length > 0 ? tagsArray : ['Perps', 'HFT', 'Alpha'],
      favToken: 'BTC-PERP',
      avgHoldingTime: '2h 45m',
      leverageRange: '5x - 50x',
      tags: ['Verified Master', '#1 30D PnL', 'Zero Drawdown', 'Hyperliquid Native'],
      activeDeals,
      closedDeals,
    });

    if (res.success) {
      triggerFeedback(
        'success',
        `Successfully promoted ${userToPromote.username} to Copytrading Master Leaders!`
      );
      setIsPromoteModalOpen(false);
    } else {
      triggerFeedback('error', res.error || 'Failed to promote to copytrading.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-white animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-16 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-mono font-bold animate-in slide-in-from-top-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500 text-black shadow-emerald-500/25'
              : 'bg-red-500 text-white shadow-red-500/25'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top SuperAdmin Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#141208] via-[#10131d] to-[#080d19] border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#0a0d14] rounded-[14px] flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('superAdminControlTerminal', 'SuperAdmin Control Terminal')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {t('masterRootAccess', 'MASTER ROOT ACCESS')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {t('authorizedAuthority', 'Authorized Authority')}:{' '}
              <strong className="text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                {SUPERADMIN_EMAIL}
              </strong>{' '}
              • {t('adminSubtitle', 'Manage balances, inject trade history, and promote to copytrading.')}
            </p>
          </div>
        </div>

        {/* Quick Return & Fast Links */}
        <div className="flex items-center gap-2.5 relative z-10 self-start md:self-auto shrink-0">
          {onNavigateToCalendar && (
            <button
              onClick={onNavigateToCalendar}
              className="px-3.5 py-1.5 rounded-xl bg-[#141a27] hover:bg-[#1f283d] border border-[#232c40] text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>{t('profitCalendar', 'Profit Calendar')}</span>
            </button>
          )}
          {onNavigateToCopytrading && (
            <button
              onClick={onNavigateToCopytrading}
              className="px-3.5 py-1.5 rounded-xl bg-[#141a27] hover:bg-[#1f283d] border border-[#232c40] text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('copytrading', 'Copy Trading')}</span>
            </button>
          )}
          {onBackToTerminal && (
            <button
              onClick={onBackToTerminal}
              className="px-4 py-1.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <span>{t('backToTrade', 'Back to Trade')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Gmail Verification Sender Setup */}
      <GmailSenderConnectionCard />

      {/* Admin KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#090b10] border border-[#1b2130] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>{t('registeredUsers', 'Registered Users')}</span>
            <Users className="w-4 h-4 text-[#00d2ff]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {registeredUsers.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{t('accountProfile', 'Account & Security')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b10] border border-[#1b2130] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>{t('totalLoggedTrades', 'Total Logged Trades')}</span>
            <History className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {closedTrades.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{t('tradeHistoryCalendar', 'Trade History & Calendar')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b10] border border-[#1b2130] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>{t('masterTraders', 'Master Traders')}</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {masterTraders.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{t('copytradingLeaders', 'Copytrading Leaders')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090b10] border border-[#1b2130] shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>{t('superAdminAccount', 'SuperAdmin Account')}</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-300 font-mono truncate">
            {SUPERADMIN_EMAIL.split('@')[0]}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono font-semibold">
            {t('allPermissionsActive', 'All Permissions Active')}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0b0e14] border border-[#1b2130] rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('balances')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'balances'
              ? 'bg-[#00d2ff] text-black shadow-lg shadow-[#00d2ff]/20'
              : 'text-slate-400 hover:text-white hover:bg-[#121622]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t('userBalances', 'User Balances')}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-current">
            {registeredUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'trades'
              ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20'
              : 'text-slate-400 hover:text-white hover:bg-[#121622]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t('tradingHistoryPnl', 'Trading History & PnL')}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-current">
            {closedTrades.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('copytrading')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'copytrading'
              ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-black shadow-lg shadow-amber-400/20'
              : 'text-slate-400 hover:text-white hover:bg-[#121622]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t('addToCopytrading', 'Add to Copytrading')}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-current">
            {masterTraders.length}
          </span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: USER BALANCES & ACCOUNT MANAGEMENT
          ======================================================== */}
      {activeTab === 'balances' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Active Session Wallet Card (Controls the balance displayed in Header & Terminal) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#0e1627] to-[#0a101d] border border-[#00d2ff]/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#00d2ff]/15 border border-[#00d2ff]/40 flex items-center justify-center text-[#00d2ff] shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-white">
                      {t('activeSessionBalance', 'Active Session Balance (Header & Terminal)')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {t('liveSync', 'LIVE SYNC')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {currentUser?.fullName || currentUser?.username} ({currentUser?.email}) • ID: <span className="text-[#00d2ff]">{currentUser?.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-left md:text-right">
                  <div className="text-[11px] text-slate-400 font-mono">{t('currentLiveBalance', 'Current Live Balance')}</div>
                  <div className="text-2xl font-black text-[#00d2ff] font-mono tracking-tight">
                    ${liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                  </div>
                </div>
              </div>
            </div>

            {/* Fast 1-Click Balance Adjusters for Active Session */}
            <div className="mt-4 pt-3.5 border-t border-[#1a2538] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-mono">{t('quickSet', 'Quick Set:')}</span>
                {[
                  { label: '+$1,000', delta: 1000 },
                  { label: '+$5,000', delta: 5000 },
                  { label: '+$10,000', delta: 10000 },
                  { label: '$25,000', exact: 25000 },
                  { label: '$50,000', exact: 50000 },
                  { label: '$100,000', exact: 100000 },
                  { label: '$10,000', exact: 10000 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const targetAmt = preset.exact !== undefined ? preset.exact : liveBalance + (preset.delta || 0);
                      const targetId = currentUser?.id || 'current';
                      updateUserBalance(targetId, targetAmt, undefined, true);
                      triggerFeedback('success', `Active wallet balance updated to $${targetAmt.toLocaleString()} USDC!`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#151f33] hover:bg-[#1e2d4a] border border-[#233555] text-xs font-mono font-bold text-slate-200 hover:text-white transition-all active:scale-95 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (currentUser) {
                    setEditingBalanceUser(currentUser);
                    setNewUsdcBalance(liveBalance.toString());
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#00d2ff] hover:bg-[#38bdf8] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('customBalance', 'Custom Balance')}</span>
              </button>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b0e14] border border-[#1b2130] p-4 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder={t('searchUsersPlaceholder', 'Search user by name, email, or ID...')}
                className="w-full bg-[#11151f] border border-[#1e2536] focus:border-[#00d2ff] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
            <div className="text-xs font-mono text-slate-400">
              <span className="text-white font-bold">{filteredUsers.length}</span> {t('registeredAccounts', 'registered accounts')}
            </div>
          </div>

          {/* Users Balance Table */}
          <div className="bg-[#0b0e14] border border-[#1b2130] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#1b2130] text-[11px] text-slate-400 font-mono bg-[#0e121b]">
                    <th className="py-3 px-4 font-semibold">{t('userCol', 'User')}</th>
                    <th className="py-3 px-4 font-semibold">{t('roleVip', 'Role & VIP')}</th>
                    <th className="py-3 px-4 font-semibold text-right">{t('liveUsdcBalance', 'Live USDC Balance')}</th>
                    <th className="py-3 px-4 font-semibold">{t('walletAddress', 'Wallet Address')}</th>
                    <th className="py-3 px-4 font-semibold text-center">{t('quickAdjust', 'Quick Adjust')}</th>
                    <th className="py-3 px-4 font-semibold text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151a26]">
                  {filteredUsers.map((user) => {
                    const isSuper = SUPERADMIN_EMAILS.some(e => e.toLowerCase() === user.email.toLowerCase());
                    const isCurrent =
                      user.id === currentUser?.id ||
                      Boolean(currentUser && user.email.toLowerCase() === currentUser.email.toLowerCase());
                    const curBal =
                      isCurrent ? liveBalance : (user.balance ?? 0.0);

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-[#121622] transition-colors ${
                          isCurrent ? 'bg-[#0e1726] border-l-2 border-l-[#00d2ff]' : selectedUserId === user.id ? 'bg-[#101522]' : ''
                        }`}
                      >
                        {/* User Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Identicon seed={user.walletAddress || user.id} size={36} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {user.fullName || user.username}
                                </span>
                                {isSuper && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    SUPERADMIN
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40">
                                    ACTIVE WALLET
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {user.email} • ID: <strong className="text-slate-300">{user.id}</strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & VIP */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30">
                              {user.vipTier}
                            </span>
                            {user.isMasterTrader && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                MASTER
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Live Balance */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          <div className="text-base font-extrabold text-white">
                            ${curBal.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold">USDC Collateral</span>
                        </td>

                        {/* Wallet Address */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {user.walletAddress}
                        </td>

                        {/* Quick Adjust Buttons */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                            <button
                              onClick={() => handleQuickAddBalance(user, 1000)}
                              className="px-2 py-1 rounded bg-[#161d2a] hover:bg-[#20293a] text-emerald-400 border border-[#232c3d] font-bold transition-all"
                              title="Add +$1,000 USDC"
                            >
                              +$1K
                            </button>
                            <button
                              onClick={() => handleQuickAddBalance(user, 5000)}
                              className="px-2 py-1 rounded bg-[#161d2a] hover:bg-[#20293a] text-emerald-400 border border-[#232c3d] font-bold transition-all"
                              title="Add +$5,000 USDC"
                            >
                              +$5K
                            </button>
                            <button
                              onClick={() => handleQuickAddBalance(user, 10000)}
                              className="px-2 py-1 rounded bg-[#161d2a] hover:bg-[#20293a] text-emerald-400 border border-[#232c3d] font-bold transition-all"
                              title="Add +$10,000 USDC"
                            >
                              +$10K
                            </button>
                            <button
                              onClick={() => handleQuickAddBalance(user, -1000)}
                              className="px-2 py-1 rounded bg-[#161d2a] hover:bg-[#20293a] text-red-400 border border-[#232c3d] font-bold transition-all"
                              title="Subtract -$1,000 USDC"
                            >
                              -$1K
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Custom Edit Balance Modal Trigger */}
                            <button
                              onClick={() => {
                                setEditingBalanceUser(user);
                                setNewUsdcBalance(curBal.toString());
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#00d2ff]/15 hover:bg-[#00d2ff]/25 text-[#00d2ff] border border-[#00d2ff]/30 text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{t('editBalance', 'Edit Balance')}</span>
                            </button>

                            {/* Select User to view trades */}
                            <button
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setActiveTab('trades');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#182030] hover:bg-[#222c42] text-slate-300 hover:text-white border border-[#273550] text-xs font-semibold transition-all flex items-center gap-1"
                              title={t('tradesBtn', 'Trades')}
                            >
                              <History className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{t('tradesBtn', 'Trades')}</span>
                            </button>

                            {/* Switch to User button */}
                            {!isCurrent && (
                              <button
                                onClick={() => {
                                  switchUser(user.id);
                                  triggerFeedback('success', `Switched active wallet to ${user.username} (${user.id})`);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-[#141a27] hover:bg-[#1d2638] text-slate-300 hover:text-white border border-[#232c3f] text-xs font-semibold transition-all flex items-center gap-1"
                                title={t('switchBtn', 'Switch')}
                              >
                                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                                <span>{t('switchBtn', 'Switch')}</span>
                              </button>
                            )}

                            {/* Promote to copytrading */}
                            {!user.isMasterTrader && (
                              <button
                                onClick={() => handleOpenPromote(user)}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1"
                                title={t('addToCopy', 'Add to Copy')}
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{t('addToCopy', 'Add to Copy')}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: TRADING HISTORY & PNL INJECTION
          ======================================================== */}
      {activeTab === 'trades' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Target User Switcher Strip */}
          <div className="p-4 bg-[#0b0e14] border border-[#1b2130] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400 font-mono">{t('editingHistoryFor', 'Editing History for:')}</div>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="bg-[#121622] text-white font-mono text-xs font-bold border border-[#222b3d] rounded-xl px-3 py-2 focus:outline-none focus:border-[#00d2ff]"
              >
                {registeredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.username} ({u.email}) — ID: {u.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Toggle User Profit Calendar Preview */}
              <button
                onClick={() => setShowUserCalendarPreview(prev => !prev)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showUserCalendarPreview
                    ? 'bg-[#00d2ff]/20 border-[#00d2ff]/50 text-[#00d2ff]'
                    : 'bg-[#141a27] hover:bg-[#1f283d] border-[#232c40] text-slate-300'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{showUserCalendarPreview ? t('hideCalendar', 'Hide Profit Calendar') : t('viewProfitCalendar', 'View Profit Calendar')}</span>
              </button>

              {/* Inject New Trade Button */}
              <button
                onClick={handleOpenAddTrade}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-black" />
                <span>{t('injectNewTrade', 'Inject New Trade')}</span>
              </button>

              {/* Quick Preset: Add Requested Sep 23 +$56 & Sep 24 -$12 */}
              <button
                onClick={() => {
                  adminAddTrade(selectedUser.id, {
                    userId: selectedUser.id,
                    userEmail: selectedUser.email,
                    marketId: 'BTC-USDC',
                    symbol: 'BTC-USDC',
                    side: 'long',
                    leverage: 50,
                    entryPrice: 86420.0,
                    exitPrice: 87150.0,
                    size: 0.057,
                    sizeUsdc: 4925.94,
                    pnl: 56.0,
                    pnlPercent: 42.24,
                    closedAt: new Date(2026, 8, 23, 14, 20).getTime(),
                    dateString: '2026-09-23',
                    isDemo: false,
                  });
                  adminAddTrade(selectedUser.id, {
                    userId: selectedUser.id,
                    userEmail: selectedUser.email,
                    marketId: 'ETH-USDC',
                    symbol: 'ETH-USDC',
                    side: 'short',
                    leverage: 25,
                    entryPrice: 2640.0,
                    exitPrice: 2652.0,
                    size: 1.0,
                    sizeUsdc: 2640.0,
                    pnl: -12.0,
                    pnlPercent: -11.36,
                    closedAt: new Date(2026, 8, 24, 11, 15).getTime(),
                    dateString: '2026-09-24',
                    isDemo: false,
                  });
                  triggerFeedback(
                    'success',
                    `Injected Sep 23 (+$56.00) & Sep 24 (-$12.00) into ${selectedUser.username}'s calendar!`
                  );
                }}
                className="px-3.5 py-2 rounded-xl bg-[#141a27] hover:bg-[#1f283d] border border-[#232c40] text-xs font-mono text-[#00d2ff] hover:text-white transition-all flex items-center gap-1"
                title="Quickly inject the user's requested September 23 (+$56) and September 24 (-$12) closed deals"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>Preset: Sep 23 (+$56) & Sep 24 (-$12)</span>
              </button>
            </div>
          </div>

          {/* Per-Account Profit Calendar Preview */}
          {showUserCalendarPreview && selectedUser && (
            <div className="bg-[#090b10] border border-[#1b2130] rounded-2xl p-4 shadow-xl">
              <ProfitCalendar targetUser={selectedUser} />
            </div>
          )}

          {/* User History Stats Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#090b10] border border-[#1b2130] p-4 rounded-2xl">
            <div>
              <span className="text-[11px] text-slate-500 font-mono block">{t('totalClosedTrades', 'Total Closed Trades')}</span>
              <span className="text-xl font-bold font-mono text-white">{userTrades.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-mono block">{t('netRealizedPnl', 'Net Realized PnL')}</span>
              <span
                className={`text-xl font-bold font-mono ${
                  userTrades.reduce((s, tradeItem) => s + tradeItem.pnl, 0) >= 0 ? 'text-[#00d2ff]' : 'text-red-400'
                }`}
              >
                {userTrades.reduce((s, tradeItem) => s + tradeItem.pnl, 0) >= 0 ? '+' : ''}$
                {userTrades.reduce((s, tradeItem) => s + tradeItem.pnl, 0).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-mono block">{t('winRate', 'Win Rate')}</span>
              <span className="text-xl font-bold font-mono text-white">
                {userTrades.length > 0
                  ? (
                      (userTrades.filter((tradeItem) => tradeItem.pnl >= 0).length / userTrades.length) *
                      100
                    ).toFixed(1) + '%'
                  : '0%'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-mono block">{t('volumeTraded', 'Volume Traded')}</span>
              <span className="text-xl font-bold font-mono text-white">
                ${userTrades.reduce((s, tradeItem) => s + tradeItem.sizeUsdc, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Trades List Table */}
          <div className="bg-[#0b0e14] border border-[#1b2130] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1b2130] text-[11px] text-slate-400 bg-[#0e121b]">
                    <th className="py-3 px-4 font-semibold">{t('date', 'Date')}</th>
                    <th className="py-3 px-4 font-semibold">{t('market', 'Market / Symbol')}</th>
                    <th className="py-3 px-4 font-semibold">{t('side', 'Side')} &amp; {t('leverage', 'Leverage')}</th>
                    <th className="py-3 px-4 font-semibold text-right">{t('entryPrice', 'Entry Price')}</th>
                    <th className="py-3 px-4 font-semibold text-right">{t('exitPrice', 'Exit Price')}</th>
                    <th className="py-3 px-4 font-semibold text-right">{t('notional', 'Notional')} ($)</th>
                    <th className="py-3 px-4 font-semibold text-right">{t('realizedPnl', 'Realized PnL')} ($)</th>
                    <th className="py-3 px-4 font-semibold text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151a26]">
                  {userTrades.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                        {t('noTradesForUser', 'No closed trades found for this user. Click "Inject New Trade" to add records.')}
                      </td>
                    </tr>
                  ) : (
                    userTrades.map((tradeItem) => {
                      const isProfit = tradeItem.pnl >= 0;
                      return (
                        <tr key={tradeItem.id} className="hover:bg-[#121622] transition-colors">
                          <td className="py-3 px-4 text-slate-300 font-bold">{tradeItem.dateString}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white">{tradeItem.symbol}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tradeItem.side === 'long'
                                  ? 'bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30'
                                  : 'bg-red-500/15 text-[#ff4d4d] border border-red-500/30'
                              }`}
                            >
                              {tradeItem.leverage}x {tradeItem.side}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            {formatPrice(tradeItem.entryPrice)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            {formatPrice(tradeItem.exitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            ${tradeItem.sizeUsdc.toFixed(2)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold tabular-nums ${
                              isProfit ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'
                            }`}
                          >
                            {isProfit ? '+' : ''}${tradeItem.pnl.toFixed(2)} ({isProfit ? '+' : ''}
                            {tradeItem.pnlPercent.toFixed(2)}%)
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditTrade(tradeItem)}
                                className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#222c42] text-slate-300 hover:text-white transition-colors"
                                title={t('editTradeRecord', 'Edit Trade')}
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#00d2ff]" />
                              </button>
                              <button
                                onClick={() => {
                                  adminDeleteTrade(tradeItem.id);
                                  triggerFeedback('success', `Deleted trade record ${tradeItem.id}.`);
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title={t('remove', 'Delete')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
      )}

      {/* ========================================================
          TAB 3: COPYTRADING PROMOTION & MASTER LEADERS
          ======================================================== */}
      {activeTab === 'copytrading' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-4 bg-[#0b0e14] border border-[#1b2130] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">
                {t('masterLeadersRegistry', 'Copytrading Master Leaders Registry')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('copyTradingSubtitle', 'Follow verified top-performing traders on Hyperliquid L1 automatically')}
              </p>
            </div>

            <button
              onClick={() => handleOpenPromote(selectedUser)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>{t('promoteToMasterLeader', 'Promote User to Master Leader')}</span>
            </button>
          </div>

          {/* Master Leaders Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masterTraders.map((trader) => (
              <div
                key={trader.id}
                className="bg-[#0b0e14] border border-[#1b2130] hover:border-[#273248] rounded-3xl p-5 flex flex-col justify-between transition-all shadow-lg"
              >
                <div>
                  {/* Top: Avatar, Name, Handle, Rank */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Identicon seed={trader.address || trader.name} size={42} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm font-mono truncate max-w-[130px]">
                            {trader.name}
                          </span>
                          {trader.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 fill-[#00d2ff] text-black shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {trader.handle}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1e293b] text-amber-300 border border-amber-500/30">
                      #{trader.rank}
                    </span>
                  </div>

                  {/* 30D Performance PnL */}
                  <div className="p-3 bg-[#11141e] border border-[#1e2536] rounded-xl mb-3 font-mono">
                    <span className="text-[10px] text-slate-400 block mb-0.5">{t('roi30d', '30D ROI')} &amp; {t('pnlLabel', 'PnL')}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-[#00d2ff]">
                        +{trader.lead30dPnlPercent.toFixed(2)}%
                      </span>
                      <span className="text-xs text-slate-300 font-bold">
                        +${trader.lead30dPnlAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 mt-2 border-t border-[#1e2536]">
                      <span>{t('winRate', 'Win Rate')}: <strong className="text-white">{trader.winRate30d.toFixed(1)}%</strong></span>
                      <span>{t('copiers', 'Copiers')}: <strong className="text-white">{trader.copiersCount.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {trader.bio}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#181d2a] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {t('aum', 'AUM')}: {trader.aumFormatted}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        adminRemoveMasterTrader(trader.id);
                        triggerFeedback('success', `Removed ${trader.name} from Master Traders.`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold transition-colors"
                    >
                      {t('remove', 'Remove')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT USER BALANCE
          ======================================================== */}
      {editingBalanceUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#090b10] border border-[#212631] rounded-3xl p-6 shadow-2xl font-sans">
            <button
              onClick={() => setEditingBalanceUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161a24]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {t('adjustBalance', 'Adjust Balance')}: {editingBalanceUser.fullName || editingBalanceUser.username}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {editingBalanceUser.email} • ID: {editingBalanceUser.id}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveCustomBalance} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Live USDC Margin Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono text-slate-400">$</span>
                  <input
                    type="number"
                    step="any"
                    value={newUsdcBalance}
                    onChange={(e) => setNewUsdcBalance(e.target.value)}
                    placeholder="10000.00"
                    required
                    className="w-full bg-[#121622] border border-[#21283b] focus:border-[#00d2ff] rounded-xl pl-8 pr-3 py-2 text-white font-mono text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1000, 5000, 10000, 25000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewUsdcBalance(preset.toString())}
                    className="px-2.5 py-1 rounded-lg bg-[#141a27] hover:bg-[#1e2638] border border-[#222b3d] text-[11px] font-mono text-slate-300 hover:text-white"
                  >
                    ${preset >= 1000 ? `${preset / 1000}K` : preset}
                  </button>
                ))}
              </div>

              {/* Individual Token Balance Adjustments */}
              <div className="p-3 bg-[#11141e] border border-[#1e2536] rounded-xl space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 block">
                  Spot Cryptocurrency Holdings
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {['BTC', 'ETH', 'SOL', 'HYPE'].map((sym) => (
                    <div key={sym} className="space-y-1">
                      <label className="text-[11px] text-slate-400 flex items-center gap-1">
                        <CryptoLogo symbol={sym} size="xs" />
                        <span>{sym} Balance</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={tokenAdjustments[sym] || ''}
                        onChange={(e) =>
                          setTokenAdjustments((prev) => ({ ...prev, [sym]: e.target.value }))
                        }
                        className="w-full bg-[#0a0d14] border border-[#1e2536] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#00d2ff]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBalanceUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#141a27] text-slate-300 hover:text-white text-xs font-semibold"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00d2ff] hover:bg-[#38bdf8] text-black font-extrabold text-xs shadow-lg transition-all"
                >
                  {t('saveBalances', 'Save Balances')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT TRADING HISTORY RECORD
          ======================================================== */}
      {isAddingTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#090b10] border border-[#212631] rounded-3xl p-6 shadow-2xl font-sans max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddingTradeModal(false);
                setEditingTrade(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161a24]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingTrade ? t('editTradeRecord', 'Edit Trade Record') : t('injectTradeRecord', 'Inject Trade Record')}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedUser.fullName || selectedUser.username} ({selectedUser.email})
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveTrade} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{t('market', 'Market')}</label>
                  <select
                    value={tradeMarketId}
                    onChange={(e) => setTradeMarketId(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  >
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.symbol} ({m.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{t('side', 'Side')}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTradeSide('long')}
                      className={`py-2 rounded-xl font-bold uppercase transition-all ${
                        tradeSide === 'long'
                          ? 'bg-[#00d2ff] text-black font-extrabold shadow-md'
                          : 'bg-[#121622] text-slate-400 border border-[#21283b]'
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeSide('short')}
                      className={`py-2 rounded-xl font-bold uppercase transition-all ${
                        tradeSide === 'short'
                          ? 'bg-[#ff4d4d] text-white font-extrabold shadow-md'
                          : 'bg-[#121622] text-slate-400 border border-[#21283b]'
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{t('leverage', 'Leverage')}</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tradeLeverage}
                    onChange={(e) => setTradeLeverage(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('entryPrice', 'Entry Price')} ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={tradeEntryPrice}
                    onChange={(e) => setTradeEntryPrice(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('exitPrice', 'Exit Price')} ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={tradeExitPrice}
                    onChange={(e) => setTradeExitPrice(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{t('notionalSize', 'Position Size')} ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={tradeSizeUsdc}
                    onChange={(e) => setTradeSizeUsdc(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('realizedPnl', 'Realized PnL')} ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={tradePnl}
                    onChange={(e) => setTradePnl(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff] font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('pnlLabel', 'PnL')} (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={tradePnlPercent}
                    onChange={(e) => setTradePnlPercent(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  {t('date', 'Date')} ({t('profitCalendar', 'Profit Calendar')})
                </label>
                <input
                  type="date"
                  value={tradeDate}
                  onChange={(e) => setTradeDate(e.target.value)}
                  className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1b2130]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTradeModal(false);
                    setEditingTrade(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#141a27] text-slate-300 hover:text-white font-semibold"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold shadow-lg transition-all"
                >
                  {editingTrade ? t('updateTrade', 'Update Trade') : t('injectTrade', 'Inject Trade')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PROMOTE USER TO COPYTRADING MASTER TRADER
          ======================================================== */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#090b10] border border-[#212631] rounded-3xl p-6 shadow-2xl font-sans max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsPromoteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161a24]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 p-0.5 flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {t('promoteToMasterLeader', 'Add User to Copytrading Master Leaders')}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Hyperliquid L1
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmPromotion} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{t('fullName', 'Display Name')}</label>
                  <input
                    type="text"
                    value={promoteName}
                    onChange={(e) => setPromoteName(e.target.value)}
                    required
                    placeholder="e.g. Anatoli Marchenko"
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('username', 'Handle / Tag')}</label>
                  <input
                    type="text"
                    value={promoteHandle}
                    onChange={(e) => setPromoteHandle(e.target.value)}
                    required
                    placeholder="@Anatoli_Alpha"
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{t('tradingStyle', 'Strategy & Bio')}</label>
                <textarea
                  rows={2}
                  value={promoteBio}
                  onChange={(e) => setPromoteBio(e.target.value)}
                  placeholder="Describe trading methodology..."
                  className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff] font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{t('roi30d', '30D ROI')} (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={promote30dPnlPct}
                    onChange={(e) => setPromote30dPnlPct(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('pnl30d', '30D PnL')} ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={promote30dPnlAmt}
                    onChange={(e) => setPromote30dPnlAmt(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('winRate', 'Win Rate')} (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={promoteWinRate}
                    onChange={(e) => setPromoteWinRate(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{t('aum', 'Pool AUM')} ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={promoteAum}
                    onChange={(e) => setPromoteAum(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('copiers', 'Copiers')}</label>
                  <input
                    type="number"
                    value={promoteCopiers}
                    onChange={(e) => setPromoteCopiers(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('maxDrawdown30d', 'Max Drawdown')} (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={promoteDrawdown}
                    onChange={(e) => setPromoteDrawdown(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{t('style', 'Bias')}</label>
                  <select
                    value={promoteBias}
                    onChange={(e) => setPromoteBias(e.target.value)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  >
                    <option value="Bullish">Bullish</option>
                    <option value="Bearish">Bearish</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Delta Neutral">Delta Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('profitFactor', 'Profit Share')} (%)</label>
                  <input
                    type="number"
                    value={promoteProfitShare}
                    onChange={(e) => setPromoteProfitShare(parseInt(e.target.value) || 10)}
                    className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{t('tradingStyle', 'Tags')}</label>
                <input
                  type="text"
                  value={promoteStyleTags}
                  onChange={(e) => setPromoteStyleTags(e.target.value)}
                  placeholder="Perps, HFT, Alpha, Hyperliquid"
                  className="w-full bg-[#121622] border border-[#21283b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d2ff]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promoteVerified"
                  checked={promoteVerified}
                  onChange={(e) => setPromoteVerified(e.target.checked)}
                  className="rounded border-[#21283b] bg-[#121622] text-[#00d2ff]"
                />
                <label htmlFor="promoteVerified" className="text-slate-300 font-sans text-xs cursor-pointer">
                  {t('activeVerified', 'Active & Verified')}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1b2130]">
                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141a27] text-slate-300 hover:text-white font-semibold"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:brightness-110 text-black font-extrabold shadow-lg transition-all"
                >
                  {t('publishMasterLeader', 'Publish Master Leader')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
