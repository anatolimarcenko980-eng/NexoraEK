import React, { useState } from 'react';
import { Position } from '../types/market';
import { formatPrice } from '../utils/tradingMath';
import { useTrading } from '../context/TradingContext';
import { X, Target, ShieldCheck } from 'lucide-react';

interface EditTpSlModalProps {
  position: Position;
  onSave: (tpPrice?: number, slPrice?: number) => void;
  onClose: () => void;
}

export const EditTpSlModal: React.FC<EditTpSlModalProps> = ({ position, onSave, onClose }) => {
  const { t } = useTrading();
  const [tpPrice, setTpPrice] = useState<string>(position.tpPrice ? position.tpPrice.toString() : '');
  const [slPrice, setSlPrice] = useState<string>(position.slPrice ? position.slPrice.toString() : '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tp = tpPrice ? parseFloat(tpPrice) : undefined;
    const sl = slPrice ? parseFloat(slPrice) : undefined;
    onSave(tp, sl);
    onClose();
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

        <h3 className="text-base font-bold text-white mb-1">
          {t('adjustTpSl')}
        </h3>
        <p className="text-xs text-slate-400 mb-4 font-mono">
          {position.symbol} · {position.leverage}x {position.side.toUpperCase()} @ {formatPrice(position.entryPrice)}
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <Target className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>{t('tpPriceUsdc')}</span>
            </label>
            <input
              type="number"
              step="any"
              value={tpPrice}
              onChange={(e) => setTpPrice(e.target.value)}
              placeholder="e.g. 92500"
              className="w-full bg-[#12151e] border border-[#1e293b] rounded-lg py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-[#00d2ff]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff4d4d]" />
              <span>{t('slPriceUsdc')}</span>
            </label>
            <input
              type="number"
              step="any"
              value={slPrice}
              onChange={(e) => setSlPrice(e.target.value)}
              placeholder="e.g. 84200"
              className="w-full bg-[#12151e] border border-[#1e293b] rounded-lg py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-[#ff4d4d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-[#141620] hover:bg-[#1e293b] border border-[#1e293b] text-slate-300 text-xs font-medium transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="py-2.5 px-3 rounded-xl bg-[#00d2ff] hover:bg-[#00bfe8] text-black text-xs font-bold transition-colors"
            >
              {t('saveTriggers')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
