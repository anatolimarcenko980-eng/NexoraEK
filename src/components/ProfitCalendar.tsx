import React, { useState, useMemo, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { ClosedTrade } from '../types/market';
import { RegisteredUser } from '../types/user';
import { formatPrice } from '../utils/tradingMath';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  CheckCircle,
  XCircle,
  X,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';

interface ProfitCalendarProps {
  onTradeMarket?: (marketId: string) => void;
  targetUser?: RegisteredUser | null;
}

export const ProfitCalendar: React.FC<ProfitCalendarProps> = ({ onTradeMarket, targetUser }) => {
  const { closedTrades, currentUser, t } = useTrading();
  const activeAccount = targetUser || currentUser;

  // Profit Calendar is strictly for Real/Live trades — Demo balance trades never go to Profit Calendar
  const modeClosedTrades = useMemo(() => {
    if (!activeAccount) return [];
    const curId = activeAccount.id;
    const curEmail = activeAccount.email?.trim().toLowerCase();
    const isPrimaryAdmin = curId === 'NX-94718' || curEmail === 'anatolimarcenko980@gmail.com';

    return closedTrades.filter(tr => {
      if (tr.isDemo) return false;
      if (tr.userId && tr.userId === curId) return true;
      if (tr.userEmail && curEmail && tr.userEmail.trim().toLowerCase() === curEmail) return true;
      if (!tr.userId && !tr.userEmail && isPrimaryAdmin) return true;
      return false;
    });
  }, [closedTrades, activeAccount]);

  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{
    dateStr: string;
    dayNum: number;
    monthName: string;
    year: number;
    pnl: number;
    trades: ClosedTrade[];
  } | null>(null);

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Auto-focus calendar month when switching accounts:
  // - If the account has closed real trades, jump to its latest trade month (or Sep 2026 for primary admin historical trades)
  // - If the account has no trades, show the current real month
  useEffect(() => {
    setSelectedDayTrades(null);
    if (!activeAccount) return;

    const isPrimaryAdmin =
      activeAccount.id === 'NX-94718' ||
      activeAccount.email?.trim().toLowerCase() === 'anatolimarcenko980@gmail.com';

    if (modeClosedTrades.length > 0) {
      if (isPrimaryAdmin && modeClosedTrades.some(tr => tr.dateString.startsWith('2026-09'))) {
        setCurrentYear(2026);
        setCurrentMonth(8);
        return;
      }
      const latest = [...modeClosedTrades].sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0))[0];
      if (latest?.dateString) {
        const parts = latest.dateString.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
            setCurrentYear(y);
            setCurrentMonth(m);
            return;
          }
        }
      }
    }

    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  }, [activeAccount?.id]);

  const monthNames = [
    t('monthJanuary'), t('monthFebruary'), t('monthMarch'), t('monthApril'), t('monthMay'), t('monthJune'),
    t('monthJuly'), t('monthAugust'), t('monthSeptember'), t('monthOctober'), t('monthNovember'), t('monthDecember')
  ];

  // Group trades by date 'YYYY-MM-DD'
  const tradesByDate = useMemo(() => {
    const map = new Map<string, ClosedTrade[]>();
    modeClosedTrades.forEach(trade => {
      const list = map.get(trade.dateString) || [];
      list.push(trade);
      map.set(trade.dateString, list);
    });
    return map;
  }, [modeClosedTrades]);

  // Aggregate stats for the currently viewed month
  const monthStats = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthTrades = modeClosedTrades.filter(t => t.dateString.startsWith(monthPrefix));

    let netPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalVolume = 0;
    let totalGains = 0;
    let totalLosses = 0;

    // Daily totals map for best/worst day
    const dailyPnlMap = new Map<string, number>();

    monthTrades.forEach(t => {
      netPnl += t.pnl;
      totalVolume += t.sizeUsdc;
      if (t.pnl >= 0) {
        winCount++;
        totalGains += t.pnl;
      } else {
        lossCount++;
        totalLosses += Math.abs(t.pnl);
      }

      const dayCurrent = dailyPnlMap.get(t.dateString) || 0;
      dailyPnlMap.set(t.dateString, dayCurrent + t.pnl);
    });

    let bestDay = { date: '', pnl: 0 };
    let worstDay = { date: '', pnl: 0 };
    let greenDays = 0;
    let redDays = 0;

    dailyPnlMap.forEach((pnl, date) => {
      if (pnl > 0) greenDays++;
      else if (pnl < 0) redDays++;

      if (pnl > bestDay.pnl) bestDay = { date, pnl };
      if (pnl < worstDay.pnl) worstDay = { date, pnl };
    });

    const totalTrades = winCount + lossCount;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    const profitFactor = totalLosses > 0 ? totalGains / totalLosses : (totalGains > 0 ? 99 : 0);

    return {
      netPnl,
      totalTrades,
      winRate,
      greenDays,
      redDays,
      profitFactor,
      bestDay,
      worstDay,
      totalVolume,
      monthTrades,
    };
  }, [modeClosedTrades, currentYear, currentMonth]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const weeks: Array<Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      pnl: number;
      trades: ClosedTrade[];
    }>> = [];

    let currentWeek: Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      pnl: number;
      trades: ClosedTrade[];
    }> = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayTrades = tradesByDate.get(dateString) || [];
      const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);

      currentWeek.push({
        dayNumber: dayNum,
        dateString,
        isCurrentMonth: false,
        pnl: dayPnl,
        trades: dayTrades,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = tradesByDate.get(dateString) || [];
      const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);

      currentWeek.push({
        dayNumber: day,
        dateString,
        isCurrentMonth: true,
        pnl: dayPnl,
        trades: dayTrades,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Next month padding to complete last row
    if (currentWeek.length > 0) {
      let nextDay = 1;
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      while (currentWeek.length < 7) {
        const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
        const dayTrades = tradesByDate.get(dateString) || [];
        const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);

        currentWeek.push({
          dayNumber: nextDay,
          dateString,
          isCurrentMonth: false,
          pnl: dayPnl,
          trades: dayTrades,
        });
        nextDay++;
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [currentYear, currentMonth, tradesByDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Format date readable
  const formatReadableDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return `${monthNames[month]} ${day}, ${year}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#08090d] border border-[#1e293b]/70 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white font-sans flex items-center gap-2 flex-wrap">
              <span>{t('tradingProfitLossCalendar')}</span>
              {activeAccount && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#141926] text-[#00d2ff] border border-[#00d2ff]/30">
                  @{activeAccount.username} · {activeAccount.id}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {t('dailyPerformanceLog')}
            </p>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#10131c] p-1 rounded-xl border border-[#1e293b]">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-bold text-white font-mono whitespace-nowrap">
              {monthNames[currentMonth]} {currentYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-1 bg-[#10131c] p-1 rounded-xl border border-[#1e293b]">
            <button
              onClick={handleGoToToday}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()
                  ? 'bg-[#00d2ff] text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('today', 'Today')}
            </button>
            <button
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonth(8); // September 2026
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                currentMonth === 8 && currentYear === 2026
                  ? 'bg-[#00d2ff] text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sep '26
            </button>
            <button
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonth(9); // October 2026
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                currentMonth === 9 && currentYear === 2026
                  ? 'bg-[#00d2ff] text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Oct '26
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#10131c] p-1 rounded-xl border border-[#1e293b]">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                viewMode === 'calendar' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('calendarView')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                viewMode === 'list' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('tradeLog')} ({monthStats.monthTrades.length})
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Performance KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Net Realized PnL */}
        <div className="bg-[#0a0c10] border border-[#1e293b]/70 rounded-xl p-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('monthlyNetPnl')}</span>
            {monthStats.netPnl >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#00d2ff]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#ff4d4d]" />
            )}
          </div>
          <div
            className={`text-2xl font-extrabold font-mono tabular-nums ${
              monthStats.netPnl >= 0 ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'
            }`}
          >
            {monthStats.netPnl >= 0 ? '+' : ''}${monthStats.netPnl.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-1">
            {monthStats.totalTrades} {t('closedTradesCount')} · {monthNames[currentMonth]}
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#0a0c10] border border-[#1e293b]/70 rounded-xl p-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('winRate')}</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {monthStats.winRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 font-sans mt-1">
            <span className="text-emerald-400 font-semibold">{monthStats.greenDays} {t('greenDays')}</span> ·{' '}
            <span className="text-red-400 font-semibold">{monthStats.redDays} {t('redDays')}</span> {t('days')}
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#0a0c10] border border-[#1e293b]/70 rounded-xl p-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('profitFactor')}</span>
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {monthStats.profitFactor.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-1">
            {t('ratioGrossProfitLoss')}
          </div>
        </div>

        {/* Best Day */}
        <div className="bg-[#0a0c10] border border-[#1e293b]/70 rounded-xl p-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('bestDay')}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#00d2ff]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#00d2ff] tabular-nums">
            {monthStats.bestDay.pnl > 0 ? `+$${monthStats.bestDay.pnl.toFixed(2)}` : '$0.00'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
            {monthStats.bestDay.date ? formatReadableDate(monthStats.bestDay.date) : t('noTrades')}
          </div>
        </div>

        {/* Worst Day */}
        <div className="bg-[#0a0c10] border border-[#1e293b]/70 rounded-xl p-3.5 shadow-lg flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('worstDay')}</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-[#ff4d4d]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#ff4d4d] tabular-nums">
            {monthStats.worstDay.pnl < 0 ? `-$${Math.abs(monthStats.worstDay.pnl).toFixed(2)}` : '$0.00'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
            {monthStats.worstDay.date ? formatReadableDate(monthStats.worstDay.date) : t('noTrades')}
          </div>
        </div>
      </div>

      {/* Main View: Calendar Matrix OR Trade Log Table */}
      {viewMode === 'calendar' ? (
        <div className="bg-[#08090d] border border-[#1e293b]/70 rounded-2xl overflow-hidden shadow-2xl p-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-mono font-semibold text-slate-400 border-b border-[#1e293b]/60 pb-2">
            <span>{t('daySun')}</span>
            <span>{t('dayMon')}</span>
            <span>{t('dayTue')}</span>
            <span>{t('dayWed')}</span>
            <span>{t('dayThu')}</span>
            <span>{t('dayFri')}</span>
            <span>{t('daySat')}</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {calendarDays.map((week, weekIndex) => (
              <div key={'week-' + weekIndex} className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {week.map((dayData, dayIndex) => {
                  const hasTrades = dayData.trades.length > 0;
                  const isProfit = dayData.pnl > 0;
                  const isLoss = dayData.pnl < 0;

                  return (
                    <div
                      key={'day-' + dayIndex}
                      onClick={() => {
                        if (hasTrades) {
                          setSelectedDayTrades({
                            dateStr: dayData.dateString,
                            dayNum: dayData.dayNumber,
                            monthName: monthNames[currentMonth],
                            year: currentYear,
                            pnl: dayData.pnl,
                            trades: dayData.trades,
                          });
                        }
                      }}
                      className={`min-h-[82px] sm:min-h-[96px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                        !dayData.isCurrentMonth
                          ? 'bg-[#06070a]/40 border-[#141620] opacity-35'
                          : hasTrades
                          ? isProfit
                            ? 'bg-[#00d2ff]/[0.04] border-[#00d2ff]/40 hover:border-[#00d2ff] hover:bg-[#00d2ff]/[0.08] cursor-pointer shadow-sm shadow-[#00d2ff]/5'
                            : 'bg-red-500/[0.04] border-red-500/40 hover:border-red-500 hover:bg-red-500/[0.08] cursor-pointer shadow-sm shadow-red-500/5'
                          : 'bg-[#0c0e15] border-[#1e293b]/50 hover:border-slate-700'
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-bold ${
                            !dayData.isCurrentMonth
                              ? 'text-slate-600'
                              : hasTrades
                              ? 'text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {dayData.dayNumber}
                        </span>

                        {hasTrades && (
                          <span className="text-[10px] font-mono text-slate-500">
                            {dayData.trades.length} {dayData.trades.length === 1 ? 'trade' : 'trades'}
                          </span>
                        )}
                      </div>

                      {/* Daily PnL Display */}
                      <div className="my-auto text-center py-1">
                        {hasTrades ? (
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-xs sm:text-sm font-extrabold font-mono tracking-tight tabular-nums px-1.5 py-0.5 rounded ${
                                isProfit
                                  ? 'text-[#00d2ff] bg-[#00d2ff]/10'
                                  : isLoss
                                  ? 'text-[#ff4d4d] bg-red-500/10'
                                  : 'text-slate-300 bg-slate-800/40'
                              }`}
                            >
                              {isProfit ? '+' : ''}${dayData.pnl.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-slate-500 font-sans mt-0.5 hidden sm:block">
                              {t('clickForDetails')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-700 font-mono">—</span>
                        )}
                      </div>

                      {/* Bottom Activity Dot or Volume */}
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        {hasTrades ? (
                          <span className="truncate">
                            Vol: ${dayData.trades.reduce((s, t) => s + t.sizeUsdc, 0).toFixed(0)}
                          </span>
                        ) : (
                          <span />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Quick Legend / Guide */}
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#1e293b]/50 text-xs text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#00d2ff]/20 border border-[#00d2ff]" />
                <span>{t('profitableDayGreen')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500" />
                <span>{t('lossDayRed')}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              {t('calendarAutoUpdateNote')}
            </div>
          </div>
        </div>
      ) : (
        /* Trade Log List View */
        <div className="bg-[#08090d] border border-[#1e293b]/70 rounded-2xl overflow-hidden shadow-2xl p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] text-[11px] font-mono uppercase text-slate-400 tracking-wider bg-[#0c0e15]">
                  <th className="py-2.5 px-3">{t('date')}</th>
                  <th className="py-2.5 px-3">{t('market')}</th>
                  <th className="py-2.5 px-3">{t('side')}</th>
                  <th className="py-2.5 px-3">{t('leverage')}</th>
                  <th className="py-2.5 px-3">{t('entryPrice')}</th>
                  <th className="py-2.5 px-3">{t('exitPrice')}</th>
                  <th className="py-2.5 px-3">{t('size')} (USDC)</th>
                  <th className="py-2.5 px-3 text-right">{t('realizedPnl')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/40 font-mono text-xs">
                {monthStats.monthTrades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                      {t('noTradesRecordedFor')} {monthNames[currentMonth]} {currentYear}.
                    </td>
                  </tr>
                ) : (
                  monthStats.monthTrades.map(trade => {
                    const isProfit = trade.pnl >= 0;
                    return (
                      <tr key={trade.id} className="hover:bg-[#0f121b] transition-colors">
                        <td className="py-2.5 px-3 text-slate-300">{trade.dateString}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{trade.symbol}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              trade.side === 'long'
                                ? 'bg-[#00d2ff]/15 text-[#00d2ff]'
                                : 'bg-red-500/15 text-[#ff4d4d]'
                            }`}
                          >
                            {trade.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{trade.leverage}x</td>
                        <td className="py-2.5 px-3 text-slate-300">{formatPrice(trade.entryPrice)}</td>
                        <td className="py-2.5 px-3 text-slate-300">{formatPrice(trade.exitPrice)}</td>
                        <td className="py-2.5 px-3 text-slate-300">${trade.sizeUsdc.toFixed(2)}</td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                            isProfit ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'
                          }`}
                        >
                          {isProfit ? '+' : ''}${trade.pnl.toFixed(2)} ({isProfit ? '+' : ''}
                          {trade.pnlPercent.toFixed(2)}%)
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Day Details Modal (Opens when user clicks on any day in the calendar) */}
      {selectedDayTrades && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0a0c10] border border-[#1e293b] rounded-2xl p-5 shadow-2xl overflow-hidden font-sans">
            <button
              onClick={() => setSelectedDayTrades(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                {t('dailyPerformanceLog')}
              </span>
              <h3 className="text-lg font-bold text-white">
                {formatReadableDate(selectedDayTrades.dateStr)}
              </h3>
            </div>

            {/* Net PnL Card */}
            <div
              className={`p-4 rounded-xl border mb-4 font-mono flex items-center justify-between ${
                selectedDayTrades.pnl >= 0
                  ? 'bg-[#00d2ff]/10 border-[#00d2ff]/40 text-[#00d2ff]'
                  : 'bg-red-500/10 border-red-500/40 text-[#ff4d4d]'
              }`}
            >
              <div>
                <span className="text-[11px] uppercase tracking-wider block opacity-80">
                  {t('totalDayNetPnl')}
                </span>
                <span className="text-2xl font-black">
                  {selectedDayTrades.pnl >= 0 ? '+' : ''}${selectedDayTrades.pnl.toFixed(2)} USD
                </span>
              </div>
              <div className="text-right text-xs">
                <span>{selectedDayTrades.trades.length} {t('tradesExecutedLabel')}</span>
              </div>
            </div>

            {/* List of Trades for this day */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-slate-400 block mb-1">
                {t('executionBreakdown')}
              </span>
              {selectedDayTrades.trades.map((tItem, idx) => {
                const isWin = tItem.pnl >= 0;
                return (
                  <div
                    key={tItem.id || idx}
                    className="p-3 bg-[#11141e] border border-[#1e293b]/70 rounded-xl flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{tItem.symbol}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            tItem.side === 'long' ? 'bg-[#00d2ff]/20 text-[#00d2ff]' : 'bg-red-500/20 text-[#ff4d4d]'
                          }`}
                        >
                          {tItem.leverage}x {tItem.side}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        {formatPrice(tItem.entryPrice)} → {formatPrice(tItem.exitPrice)}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold text-sm ${isWin ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                        {isWin ? '+' : ''}${tItem.pnl.toFixed(2)}
                      </div>
                      <div className={`text-[10px] ${isWin ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                        {isWin ? '+' : ''}{tItem.pnlPercent.toFixed(2)}% ROI
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close button */}
            <div className="mt-5 pt-3 border-t border-[#1e293b]/60 flex justify-end">
              <button
                onClick={() => setSelectedDayTrades(null)}
                className="py-2 px-5 rounded-xl bg-[#00d2ff] hover:bg-[#00bfe8] text-black font-bold text-xs transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
