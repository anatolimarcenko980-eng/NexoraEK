import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { X, Wallet, Check, Copy, RefreshCw, ArrowUpRight, LogOut, ShieldCheck, Briefcase } from 'lucide-react';

interface PrivyWalletModalProps {
  onClose: () => void;
  onOpenPortfolio?: () => void;
}

export const PrivyWalletModal: React.FC<PrivyWalletModalProps> = ({ onClose, onOpenPortfolio }) => {
  const { walletBalance, totalPortfolioValue, availableBalance, isConnected, walletAddress, connectWallet, disconnectWallet, t } = useTrading();
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'balance' | 'connect'>('balance');

  const equityDelta = Math.round((totalPortfolioValue - walletBalance) * 100) / 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0a0c10] border border-[#1e293b] rounded-2xl p-5 shadow-2xl overflow-hidden font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#00d2ff]/20 border border-[#00d2ff]/40 flex items-center justify-center text-[#00d2ff]">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('privyEmbeddedWallet')}</h3>
            <span className="text-[10px] text-slate-400">Hyperliquid L1</span>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            {/* Address Banner */}
            <div className="flex items-center justify-between p-2.5 bg-[#121520] border border-[#1e293b] rounded-xl font-mono text-xs">
              <span className="text-slate-300">{walletAddress}</span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-[#00d2ff] transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Balances Card */}
            <div className="p-4 bg-gradient-to-br from-[#10141f] to-[#0a0c10] border border-[#1e293b] rounded-xl font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-sans flex items-center justify-between">
                <span>{t('totalWalletEquity')}</span>
                {equityDelta !== 0 && (
                  <span className={`text-[10px] font-mono font-semibold ${equityDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {equityDelta >= 0 ? '+' : ''}${equityDelta.toFixed(2)} ({((equityDelta / (walletBalance || 1)) * 100).toFixed(2)}%)
                  </span>
                )}
              </div>
              <div className="text-2xl font-extrabold text-white mb-2 flex items-baseline gap-1.5 tabular-nums">
                <span>${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-sm text-[#00d2ff]">USDC</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-[#1e293b]/50 text-slate-400">
                <span>{t('availableMargin')}:</span>
                <span className="text-white font-semibold">${availableBalance.toFixed(2)} USDC</span>
              </div>
            </div>

            {/* Action Buttons */}
            {onOpenPortfolio && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenPortfolio();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>{t('openPortfolioHub')}</span>
                </button>
              </div>
            )}

            {/* Disconnect */}
            <div className="pt-2 border-t border-[#1e293b]/50">
              <button
                onClick={() => {
                  disconnectWallet();
                  onClose();
                }}
                className="w-full py-2 text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('disconnectWallet')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              {t('connectWalletPrompt')}
            </p>
            <button
              onClick={() => {
                connectWallet();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#00d2ff] hover:bg-[#00bfe8] text-black font-bold text-xs transition-colors shadow-lg shadow-[#00d2ff]/20"
            >
              {t('connectWithPrivy')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
