import React, { useState } from 'react';
import { Position } from '../types/market';
import { formatPrice } from '../utils/tradingMath';
import { useTrading } from '../context/TradingContext';
import { X, Check, Copy, Download, Share2, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface SharePnlModalProps {
  position: Position;
  onClose: () => void;
}

export const SharePnlModal: React.FC<SharePnlModalProps> = ({ position, onClose }) => {
  const { t } = useTrading();
  const [copied, setCopied] = useState<boolean>(false);
  const isProfit = position.unrealizedPnl >= 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Trading on Nexora DEX: ${position.side.toUpperCase()} ${position.symbol} ${position.leverage}x | PnL: ${isProfit ? '+' : ''}${position.unrealizedPnlPercent.toFixed(2)}% ($${position.unrealizedPnl.toFixed(2)})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0c10] border border-[#1e293b] rounded-2xl p-5 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#00d2ff]" />
          <span>{t('sharePositionPnl')}</span>
        </h3>

        {/* The Card to Share */}
        <div className="relative overflow-hidden rounded-xl border border-[#1e293b] bg-gradient-to-br from-[#0c0f17] via-[#090b10] to-[#050608] p-5 shadow-2xl">
          {/* Subtle background glow */}
          <div
            className="absolute -right-16 -top-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: isProfit ? '#00d2ff' : '#ff4d4d' }}
          />

          {/* Card Header */}
          <div className="flex items-center justify-between mb-4 border-b border-[#1e293b]/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md overflow-hidden bg-[#05080f] border border-[#38bdf8]/40 shrink-0">
                <img
                  src="/assets/aistudio/signal-2026-11-19-06-44-03-203_d369e7fa.jpg"
                  alt="Nexora DEX"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <span className="font-bold tracking-tight text-white font-sans text-sm">NEXORA DEX</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Hyperliquid L1</span>
          </div>

          {/* Market & Side */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-extrabold text-white font-mono">{position.symbol}</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                position.side === 'long'
                  ? 'bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40'
                  : 'bg-[#ff4d4d]/20 text-[#ff4d4d] border border-[#ff4d4d]/40'
              }`}
            >
              {position.leverage}x {position.side.toUpperCase()}
            </span>
          </div>

          {/* Huge ROI Display */}
          <div className="my-4">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
              {t('returnOnEquity')}
            </div>
            <div
              className={`text-4xl font-extrabold font-mono tracking-tight flex items-baseline gap-2 ${
                isProfit ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'
              }`}
            >
              <span>{isProfit ? '+' : ''}{position.unrealizedPnlPercent.toFixed(2)}%</span>
              {isProfit ? (
                <TrendingUp className="w-6 h-6 self-center text-[#00d2ff]" />
              ) : (
                <TrendingDown className="w-6 h-6 self-center text-[#ff4d4d]" />
              )}
            </div>
            <div className="text-sm font-mono text-slate-300 mt-1">
              {isProfit ? '+' : ''}${position.unrealizedPnl.toFixed(2)} USD
            </div>
          </div>

          {/* Pricing Details */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1e293b]/60 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">{t('entryPrice')}</span>
              <span className="text-white font-medium">{formatPrice(position.entryPrice)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[10px] block">{t('markPrice')}</span>
              <span className="text-white font-medium">{formatPrice(position.markPrice)}</span>
            </div>
          </div>

          {/* Card Footer watermark */}
          <div className="mt-4 pt-2.5 border-t border-[#1e293b]/40 flex items-center justify-between text-[10px] text-slate-500 font-sans">
            <span>app.nexoradex.io</span>
            <span>Mobile-First High-Perf DEX</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-[#141620] hover:bg-[#1e293b] border border-[#1e293b] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? t('copiedDetails') : t('copyText')}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-[#00d2ff] hover:bg-[#00bfe8] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </div>
  );
};
