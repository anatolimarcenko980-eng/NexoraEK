import React, { useState, useEffect } from 'react';
import { Market, OrderBookEntry, MarketTrade } from '../types/market';
import { generateOrderBook, generateRecentTrades, formatPrice } from '../utils/tradingMath';
import { useTrading } from '../context/TradingContext';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface OrderBookProps {
  market: Market;
  onSelectPrice?: (price: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({ market, onSelectPrice }) => {
  const { t } = useTrading();
  const [activeTab, setActiveTab] = useState<'book' | 'trades'>('book');
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    spread: number;
    spreadPercent: number;
  }>({ bids: [], asks: [], spread: 0, spreadPercent: 0 });
  const [trades, setTrades] = useState<MarketTrade[]>([]);

  // Regenerate/refresh order book on market price update
  useEffect(() => {
    setOrderBook(generateOrderBook(market.price, 7));
  }, [market.price]);

  // Initial trades & live incoming trade simulator
  useEffect(() => {
    setTrades(generateRecentTrades(market.price, 12));

    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.48;
      const offset = (Math.random() - 0.5) * (market.price * 0.0004);
      const price = market.price + offset;
      const size = market.price > 1000 ? 0.05 + Math.random() * 0.7 : 10 + Math.random() * 200;
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTrades(prev => [
        {
          id: 'trade-' + Date.now(),
          price,
          size,
          side: isBuy ? 'buy' : 'sell',
          time,
        },
        ...prev.slice(0, 19),
      ]);
    }, 2200);

    return () => clearInterval(interval);
  }, [market.id]);

  const maxTotal = Math.max(
    ...orderBook.bids.map(b => b.total),
    ...orderBook.asks.map(a => a.total),
    1
  );

  return (
    <div className="flex flex-col h-full bg-[#08090d] border border-[#1e293b]/70 rounded-xl overflow-hidden shadow-xl text-xs font-mono">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e293b] bg-[#0c0d12]">
        <div className="flex items-center gap-1 bg-[#14161f] p-0.5 rounded-lg border border-[#1e293b]/60">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-3 py-1 rounded text-[11px] font-sans font-medium transition-all ${
              activeTab === 'book'
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('orderBook')}
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-3 py-1 rounded text-[11px] font-sans font-medium transition-all ${
              activeTab === 'trades'
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('recentTrades')}
          </button>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          {t('spread')}: <span className="text-slate-200">${orderBook.spread.toFixed(market.precision)} ({orderBook.spreadPercent.toFixed(2)}%)</span>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'book' ? (
        <div className="flex flex-col flex-1 p-2 justify-between overflow-hidden">
          {/* Column Header */}
          <div className="grid grid-cols-3 text-[10px] text-slate-500 font-sans px-1 pb-1 border-b border-[#1e293b]/50">
            <span>{t('price')} ({market.quoteAsset})</span>
            <span className="text-right">{t('size')} ({market.baseAsset})</span>
            <span className="text-right">{t('total')}</span>
          </div>

          {/* Asks (Sell orders - red) */}
          <div className="flex flex-col gap-0.5 py-1 justify-end flex-1">
            {orderBook.asks.map((ask, i) => {
              const depthPct = Math.min(100, (ask.total / maxTotal) * 100);
              return (
                <div
                  key={'ask-' + i}
                  onClick={() => onSelectPrice?.(ask.price)}
                  className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-red-500/10 cursor-pointer rounded transition-colors group"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-red-500/15 pointer-events-none rounded-sm transition-all"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-[#ff4d4d] font-semibold tabular-nums z-10">
                    {formatPrice(ask.price, market.precision).replace('$', '')}
                  </span>
                  <span className="text-slate-300 text-right tabular-nums z-10">
                    {ask.size.toFixed(market.sizePrecision)}
                  </span>
                  <span className="text-slate-500 text-right tabular-nums z-10">
                    {ask.total.toFixed(market.sizePrecision)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mid Market Price Banner */}
          <div className="flex items-center justify-between px-2 py-1.5 my-1 bg-[#10141f] border-y border-[#1e293b] rounded">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold tabular-nums ${market.change24h >= 0 ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                {formatPrice(market.price, market.precision)}
              </span>
              {market.change24h >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00d2ff]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-[#ff4d4d]" />
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              {t('markPrice')}: <span className="text-slate-200">{formatPrice(market.price, market.precision)}</span>
            </div>
          </div>

          {/* Bids (Buy orders - cyan) */}
          <div className="flex flex-col gap-0.5 py-1 flex-1">
            {orderBook.bids.map((bid, i) => {
              const depthPct = Math.min(100, (bid.total / maxTotal) * 100);
              return (
                <div
                  key={'bid-' + i}
                  onClick={() => onSelectPrice?.(bid.price)}
                  className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-[#00d2ff]/10 cursor-pointer rounded transition-colors group"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#00d2ff]/15 pointer-events-none rounded-sm transition-all"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-[#00d2ff] font-semibold tabular-nums z-10">
                    {formatPrice(bid.price, market.precision).replace('$', '')}
                  </span>
                  <span className="text-slate-300 text-right tabular-nums z-10">
                    {bid.size.toFixed(market.sizePrecision)}
                  </span>
                  <span className="text-slate-500 text-right tabular-nums z-10">
                    {bid.total.toFixed(market.sizePrecision)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Recent Trades Feed */
        <div className="flex flex-col flex-1 p-2 overflow-y-auto">
          <div className="grid grid-cols-3 text-[10px] text-slate-500 font-sans px-1 pb-1 border-b border-[#1e293b]/50">
            <span>{t('price')} ({market.quoteAsset})</span>
            <span className="text-right">{t('size')} ({market.baseAsset})</span>
            <span className="text-right">{t('time')}</span>
          </div>

          <div className="flex flex-col gap-1 py-1 divide-y divide-[#1e293b]/20">
            {trades.map(trade => (
              <div key={trade.id} className="grid grid-cols-3 py-1 px-1 hover:bg-slate-800/30">
                <span className={`font-semibold tabular-nums ${trade.side === 'buy' ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'}`}>
                  {formatPrice(trade.price, market.precision).replace('$', '')}
                </span>
                <span className="text-slate-300 text-right tabular-nums">
                  {trade.size.toFixed(market.sizePrecision)}
                </span>
                <span className="text-slate-500 text-right text-[10px] tabular-nums">
                  {trade.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
