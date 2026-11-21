import React, { useState } from 'react';
import { Position } from '../types/market';
import { useTrading } from '../context/TradingContext';
import { formatPrice } from '../utils/tradingMath';
import { SharePnlModal } from './SharePnlModal';
import { EditTpSlModal } from './EditTpSlModal';
import { Share2, SlidersHorizontal, XCircle, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { CryptoLogo } from './CryptoLogo';

interface PositionsTrackerProps {
  onSelectMarket?: (marketId: string) => void;
  onOpenCalendar?: () => void;
}

export const PositionsTracker: React.FC<PositionsTrackerProps> = ({ onSelectMarket, onOpenCalendar }) => {
  const { positions, orders, closedTrades, demoClosedTrades, closePosition, updateTpSl, cancelOrder, isDemoMode, currentUser, t } = useTrading();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [sharePosition, setSharePosition] = useState<Position | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const modePositions = positions.filter(p => (isDemoMode ? Boolean(p.isDemo) : !p.isDemo));
  const sourceHistory = isDemoMode ? demoClosedTrades : closedTrades;
  const modeClosedTrades = sourceHistory.filter(tr => {
    if (!currentUser) return false;
    const curId = currentUser.id;
    const curEmail = currentUser.email?.trim().toLowerCase();
    const isPrimaryAdmin = curId === 'NX-94718' || curEmail === 'anatolimarcenko980@gmail.com';
    if (tr.userId && tr.userId === curId) return true;
    if (tr.userEmail && curEmail && tr.userEmail.trim().toLowerCase() === curEmail) return true;
    if (!tr.userId && !tr.userEmail && isPrimaryAdmin) return true;
    return false;
  });

  return (
    <div className="flex flex-col bg-[#08090d] border border-[#1e293b]/70 rounded-xl overflow-hidden shadow-2xl text-xs font-sans">
      {/* Tracker Header & Tabs */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1e293b] bg-[#0c0d12] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#14161f] p-0.5 rounded-lg border border-[#1e293b]/60">
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'positions'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t('positions')}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${modePositions.length > 0 ? 'bg-[#00d2ff]/20 text-[#00d2ff]' : 'bg-slate-800 text-slate-500'}`}>
                {modePositions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t('openOrders')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-500">
                {orders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t('tradeHistory')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
                {modeClosedTrades.length}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenCalendar && !isDemoMode && (
            <button
              onClick={onOpenCalendar}
              className="text-[11px] font-mono text-[#00d2ff] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>{t('profitCalendar')} →</span>
            </button>
          )}

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {t('netUnrlPnl')}:{' '}
            <span
              className={`font-bold ${
                modePositions.reduce((s, p) => s + p.unrealizedPnl, 0) >= 0 ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'
              }`}
            >
              ${modePositions.reduce((s, p) => s + p.unrealizedPnl, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="overflow-x-auto">
        {activeTab === 'positions' ? (
          modePositions.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#141620] border border-[#1e293b] flex items-center justify-center mx-auto mb-2 text-slate-500">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-slate-300 font-medium text-xs mb-1">{t('noOpenPositions')}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1e293b]/40">
              {/* Desktop Table Header */}
              <div className="hidden lg:grid grid-cols-8 px-4 py-2 bg-[#0c0d12] text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                <span className="col-span-2">{t('marketSide')}</span>
                <span>{t('size')}</span>
                <span>{t('entryPrice')}</span>
                <span>{t('markPrice')}</span>
                <span>{t('liqPrice')}</span>
                <span className="text-right">{t('unrealizedPnl')}</span>
                <span className="text-right">{t('actions')}</span>
              </div>

              {modePositions.map((pos) => {
                const isLong = pos.side === 'long';
                const isProfit = pos.unrealizedPnl >= 0;

                return (
                  <div
                    key={pos.id}
                    className="p-3.5 lg:px-4 lg:py-2.5 hover:bg-[#0c0e15] transition-colors flex flex-col lg:grid lg:grid-cols-8 lg:items-center gap-2 lg:gap-0"
                  >
                    {/* Market & Side */}
                    <div className="lg:col-span-2 flex items-center justify-between lg:justify-start gap-2.5">
                      <div className="flex items-center gap-2">
                        <CryptoLogo symbol={pos.baseAsset || pos.symbol.split('-')[0]} size="xs" />
                        <button
                          onClick={() => onSelectMarket?.(pos.marketId)}
                          className="font-bold text-white hover:text-[#00d2ff] transition-colors font-mono text-sm"
                        >
                          {pos.symbol}
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            isLong
                              ? 'bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30'
                              : 'bg-[#ff4d4d]/15 text-[#ff4d4d] border border-[#ff4d4d]/30'
                          }`}
                        >
                          {pos.leverage}x {pos.side}
                        </span>
                        {pos.isDemo && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40">
                            {t('demoUpper')}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono capitalize">
                          {pos.marginMode === 'cross' ? t('cross') : t('isolated')}
                        </span>
                      </div>

                      {/* Mobile PnL badge */}
                      <div className="lg:hidden text-right font-mono">
                        <div className={`font-bold ${isProfit ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                          {isProfit ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${isProfit ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                          ({isProfit ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>

                    {/* Size */}
                    <div className="flex justify-between lg:block text-slate-300 font-mono">
                      <span className="lg:hidden text-slate-500">{t('size')}:</span>
                      <div>
                        <div>{pos.size.toFixed(4)} {pos.baseAsset}</div>
                        <div className="text-[10px] text-slate-500">${pos.sizeUsdc.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Entry Price */}
                    <div className="flex justify-between lg:block text-slate-300 font-mono">
                      <span className="lg:hidden text-slate-500">{t('entryPrice')}:</span>
                      <span>{formatPrice(pos.entryPrice)}</span>
                    </div>

                    {/* Mark Price */}
                    <div className="flex justify-between lg:block text-slate-300 font-mono">
                      <span className="lg:hidden text-slate-500">{t('markPrice')}:</span>
                      <span className="text-white font-medium">{formatPrice(pos.markPrice)}</span>
                    </div>

                    {/* Liquidation Price */}
                    <div className="flex justify-between lg:block font-mono">
                      <span className="lg:hidden text-slate-500">{t('liqPrice')}:</span>
                      <span className="text-[#ff4d4d] font-semibold">
                        {pos.liqPrice > 0 ? formatPrice(pos.liqPrice) : t('none')}
                      </span>
                    </div>

                    {/* Unrealized PnL (Desktop) */}
                    <div className="hidden lg:block text-right font-mono">
                      <div className={`font-bold text-sm ${isProfit ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                        {isProfit ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                      </div>
                      <div className={`text-[10px] ${isProfit ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                        ({isProfit ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5 pt-2 lg:pt-0 border-t border-[#1e293b]/40 lg:border-none">
                      {/* TP / SL button */}
                      <button
                        onClick={() => setEditingPosition(pos)}
                        title={t('editTpSl')}
                        className="px-2 py-1 rounded bg-[#141620] hover:bg-[#1e293b] text-slate-300 border border-[#1e293b] text-[10px] font-mono flex items-center gap-1 transition-colors"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                        <span>TP/SL</span>
                      </button>

                      {/* Share PnL button */}
                      <button
                        onClick={() => setSharePosition(pos)}
                        title={t('sharePnl')}
                        className="p-1 rounded bg-[#141620] hover:bg-[#1e293b] text-slate-300 border border-[#1e293b] transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#00d2ff]" />
                      </button>

                      {/* Close Position button */}
                      <button
                        onClick={() => closePosition(pos.id)}
                        className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-[10px] font-mono transition-colors"
                      >
                        {t('marketClose')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === 'orders' ? (
          /* Open Orders Tab */
          orders.length === 0 ? (
            <div className="py-8 px-4 text-center text-slate-500 text-xs">
              {t('noOpenOrders')}
            </div>
          ) : (
            <div className="divide-y divide-[#1e293b]/40">
              {orders.map(order => (
                <div key={order.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CryptoLogo symbol={order.symbol.split('-')[0]} size="xs" />
                    <span className="font-bold text-white font-mono">{order.symbol}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">
                      {order.side} · {order.type}
                    </span>
                  </div>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{t('cancel')}</span>
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Trade History Tab */
          modeClosedTrades.length === 0 ? (
            <div className="py-8 px-4 text-center text-slate-500 text-xs">
              {t('noClosedTrades')}
            </div>
          ) : (
            <div className="divide-y divide-[#1e293b]/40">
              <div className="hidden lg:grid grid-cols-7 px-4 py-2 bg-[#0c0d12] text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                <span>{t('date')}</span>
                <span className="col-span-2">{t('marketSide')}</span>
                <span>{t('entryPrice')}</span>
                <span>{t('exitPrice')}</span>
                <span>{t('notional')}</span>
                <span className="text-right">{t('realizedPnl')}</span>
              </div>

              {modeClosedTrades.slice(0, 10).map(trade => {
                const isProfit = trade.pnl >= 0;
                return (
                  <div key={trade.id} className="p-3 lg:px-4 lg:py-2.5 hover:bg-[#0c0e15] flex flex-col lg:grid lg:grid-cols-7 items-start lg:items-center gap-1 lg:gap-0 font-mono text-xs">
                    <span className="text-slate-400 text-[11px]">{trade.dateString}</span>
                    <div className="lg:col-span-2 flex items-center gap-2">
                      <CryptoLogo symbol={trade.symbol.split('-')[0]} size="xs" />
                      <span className="font-bold text-white">{trade.symbol}</span>
                      {trade.isDemo && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40">
                          {t('demoUpper')}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                        trade.side === 'long' ? 'bg-[#00d2ff]/15 text-[#00d2ff]' : 'bg-red-500/15 text-[#ff4d4d]'
                      }`}>
                        {trade.leverage}x {trade.side}
                      </span>
                    </div>
                    <span className="text-slate-300">{formatPrice(trade.entryPrice)}</span>
                    <span className="text-slate-300">{formatPrice(trade.exitPrice)}</span>
                    <span className="text-slate-400">${trade.sizeUsdc.toFixed(2)}</span>
                    <div className="text-right w-full lg:w-auto font-bold">
                      <span className={isProfit ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}>
                        {isProfit ? '+' : ''}${trade.pnl.toFixed(2)} ({isProfit ? '+' : ''}{trade.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                );
              })}

              {onOpenCalendar && !isDemoMode && (
                <div className="p-3 bg-[#0c0e15] text-center border-t border-[#1e293b]/40">
                  <button
                    onClick={onOpenCalendar}
                    className="text-xs text-[#00d2ff] hover:underline font-semibold font-mono"
                  >
                    {t('viewAllTradesInCalendar')} ({modeClosedTrades.length}) →
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Share PnL Modal */}
      {sharePosition && (
        <SharePnlModal
          position={sharePosition}
          onClose={() => setSharePosition(null)}
        />
      )}

      {/* Edit TP/SL Modal */}
      {editingPosition && (
        <EditTpSlModal
          position={editingPosition}
          onSave={(tp, sl) => updateTpSl(editingPosition.id, tp, sl)}
          onClose={() => setEditingPosition(null)}
        />
      )}
    </div>
  );
};
