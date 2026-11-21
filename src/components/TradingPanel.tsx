import React, { useState, useMemo } from 'react';
import { Market, PositionSide, MarginMode, OrderType } from '../types/market';
import { useTrading } from '../context/TradingContext';
import { formatPrice, calculateLiquidationPrice } from '../utils/tradingMath';
import { Sliders, ShieldAlert, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { CryptoLogo } from './CryptoLogo';

interface TradingPanelProps {
  market: Market;
  initialPrice?: number;
}
export const TradingPanel: React.FC<TradingPanelProps> = ({ market, initialPrice }) => {
  const { t, availableBalance, openPosition, isDemoMode, tradingMode, resetDemoBalance, buyButtonColor, candleColors, defaultMarginMode } = useTrading();

  const isBuyGreen = buyButtonColor === 'green' || (candleColors === 'emerald-ruby' && buyButtonColor !== 'cyan');

  const [side, setSide] = useState<PositionSide>('long');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [marginMode, setMarginMode] = useState<MarginMode>(defaultMarginMode || 'cross');
  const [leverage, setLeverage] = useState<number>(isDemoMode ? 50 : Math.min(20, market.leverageMax));
  
  // Size inputs
  const [inputUnit, setInputUnit] = useState<'USDC' | 'ASSET'>('USDC');
  const [amountStr, setAmountStr] = useState<string>('500');
  
  // Limit / Trigger price
  const [limitPriceStr, setLimitPriceStr] = useState<string>(
    initialPrice ? initialPrice.toString() : market.price.toString()
  );

  // TP / SL
  const [enableTpSl, setEnableTpSl] = useState<boolean>(false);
  const [tpPriceStr, setTpPriceStr] = useState<string>('');
  const [slPriceStr, setSlPriceStr] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ensure leverage stays within bounds of this market
  const maxLeverage = market.leverageMax || 20;
  const currentLeverage = Math.min(leverage, maxLeverage);

  // Calculations
  const numericAmount = parseFloat(amountStr) || 0;
  const executionPrice = orderType === 'market' ? market.price : (parseFloat(limitPriceStr) || market.price);

  // Margin required and Notional position size
  const marginRequired = inputUnit === 'USDC' ? numericAmount : (numericAmount * executionPrice) / currentLeverage;
  const notionalSize = marginRequired * currentLeverage;
  const sizeInAsset = executionPrice > 0 ? notionalSize / executionPrice : 0;

  // Estimated Liquidation Price
  const estimatedLiqPrice = useMemo(() => {
    return calculateLiquidationPrice(executionPrice, side, currentLeverage);
  }, [executionPrice, side, currentLeverage]);

  // Quick % allocator
  const handlePercentClick = (pct: number) => {
    const margin = (availableBalance * pct) / 100;
    if (inputUnit === 'USDC') {
      setAmountStr(margin.toFixed(2));
    } else {
      const assetSize = ((margin * currentLeverage) / market.price);
      setAmountStr(assetSize.toFixed(market.sizePrecision));
    }
  };

  // Handle position submit
  const handleOpenPosition = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (marginRequired <= 0) {
      setErrorMsg('Please enter a valid order size');
      return;
    }
    if (marginRequired > availableBalance) {
      setErrorMsg(`Insufficient margin. Max available: $${availableBalance.toFixed(2)}`);
      return;
    }

    const tp = enableTpSl && parseFloat(tpPriceStr) ? parseFloat(tpPriceStr) : undefined;
    const sl = enableTpSl && parseFloat(slPriceStr) ? parseFloat(slPriceStr) : undefined;

    const res = openPosition({
      market,
      side,
      leverage: currentLeverage,
      marginMode,
      marginAmount: marginRequired,
      tpPrice: tp,
      slPrice: sl,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to open position');
    } else {
      setErrorMsg(null);
      setSuccessMsg(`✓ ${side.toUpperCase()} ${currentLeverage}x position opened at ${formatPrice(executionPrice, market.precision)}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="flex flex-col bg-[#08090d] border border-[#1e293b]/70 rounded-xl overflow-hidden shadow-2xl p-3.5 text-xs font-sans">
      {/* Trading Environment Indicator (Demo vs Live) */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#1e293b]/70">
        {isDemoMode ? (
          <div className="flex items-center gap-1.5">
            <CryptoLogo symbol={market.baseAsset} size="xs" />
            <span className="text-[11px] font-extrabold text-[#00d2ff] font-mono tracking-tight uppercase">
              {t('demoTrading')} ({market.baseAsset} 50x)
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 font-mono font-bold">
              {t('virtual')}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <CryptoLogo symbol={market.baseAsset} size="xs" />
            <span className="text-[11px] font-extrabold text-blue-400 font-mono tracking-tight uppercase">
              {t('liveTrading')} ({market.baseAsset})
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold">
              {t('realExec')}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <button
              type="button"
              onClick={() => resetDemoBalance()}
              className="text-[10px] font-mono text-[#00d2ff] hover:underline cursor-pointer"
              title={t('resetDemoBalance')}
            >
              {t('resetDemoBalance')}
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-400">
            {isDemoMode ? t('paperFunds') : 'Hyperliquid L1'}
          </span>
        </div>
      </div>

      {/* Side Selector Tabs (Long vs Short) */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#0f1118] rounded-xl border border-[#1e293b]/60 mb-3">
        <button
          onClick={() => setSide('long')}
          className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            side === 'long'
              ? isBuyGreen
                ? 'bg-[#10b981] hover:bg-[#059669] text-black shadow-lg shadow-emerald-500/25'
                : 'bg-[#00d2ff] text-black shadow-lg shadow-[#00d2ff]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('buyLong')}
        </button>
        <button
          onClick={() => setSide('short')}
          className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            side === 'short'
              ? 'bg-[#ff4d4d] text-white shadow-lg shadow-[#ff4d4d]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('sellShort')}
        </button>
      </div>

      {/* Margin Mode & Leverage Controls */}
      <div className="flex items-center justify-between mb-3 bg-[#0f1118] p-2 rounded-lg border border-[#1e293b]/50">
        <div className="flex items-center gap-1 bg-[#161822] p-0.5 rounded-md border border-[#1e293b]/70">
          <button
            onClick={() => setMarginMode('cross')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              marginMode === 'cross' ? 'bg-[#1e293b] text-white' : 'text-slate-400'
            }`}
          >
            {t('cross')}
          </button>
          <button
            onClick={() => setMarginMode('isolated')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              marginMode === 'isolated' ? 'bg-[#1e293b] text-white' : 'text-slate-400'
            }`}
          >
            {t('isolated')}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">{t('leverage')}:</span>
          <span className="text-xs font-bold text-[#00d2ff] font-mono px-2 py-0.5 bg-[#00d2ff]/10 rounded border border-[#00d2ff]/30">
            {currentLeverage}x
          </span>
        </div>
      </div>

      {/* Interactive Leverage Slider */}
      <div className="mb-3 px-1">
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
          <span>1x</span>
          <span>5x</span>
          <span>10x</span>
          <span>25x</span>
          <span>{maxLeverage}x</span>
        </div>
        <input
          type="range"
          min="1"
          max={maxLeverage}
          step="1"
          value={currentLeverage}
          onChange={(e) => setLeverage(parseInt(e.target.value) || 1)}
          className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#00d2ff]"
        />
      </div>

      {/* Order Type Tabs */}
      <div className="flex items-center gap-1 mb-3 border-b border-[#1e293b]/60 pb-2">
        {(['market', 'limit', 'stop_market', 'tp_sl'] as OrderType[]).map((type) => {
          const label =
            type === 'market'
              ? t('marketOrder')
              : type === 'limit'
              ? t('limitOrder')
              : type === 'stop_market'
              ? t('stopMarket')
              : 'TP / SL';
          return (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                orderType === type
                  ? 'bg-[#1a1f2c] text-white border border-[#334155]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Limit Price Input if not market order */}
      {orderType !== 'market' && (
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{t('price')} ({market.quoteAsset})</span>
            <button
              onClick={() => setLimitPriceStr(market.price.toString())}
              className="text-[#00d2ff] hover:underline text-[10px]"
            >
              {t('mid')}
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={limitPriceStr}
              onChange={(e) => setLimitPriceStr(e.target.value)}
              className="w-full bg-[#0f1118] border border-[#1e293b] rounded-lg py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-[#00d2ff]"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
              {market.quoteAsset}
            </span>
          </div>
        </div>
      )}

      {/* Order Size Input with Unit Toggle */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>{t('orderSize')}</span>
          <div className="flex items-center gap-1 text-[10px]">
            <button
              onClick={() => setInputUnit('USDC')}
              className={`px-1.5 py-0.5 rounded ${inputUnit === 'USDC' ? 'bg-[#1e293b] text-[#00d2ff] font-bold' : 'text-slate-500'}`}
            >
              {t('marginUsdc')}
            </button>
            <span>·</span>
            <button
              onClick={() => setInputUnit('ASSET')}
              className={`px-1.5 py-0.5 rounded ${inputUnit === 'ASSET' ? 'bg-[#1e293b] text-[#00d2ff] font-bold' : 'text-slate-500'}`}
            >
              {market.baseAsset}
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="number"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="w-full bg-[#0f1118] border border-[#1e293b] rounded-lg py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-[#00d2ff]"
            placeholder="0.00"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
            {inputUnit === 'USDC' ? 'USDC' : market.baseAsset}
          </span>
        </div>

        {/* Quick Percent Allocation Pills */}
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {[25, 50, 75, 100].map(pct => (
            <button
              key={pct}
              onClick={() => handlePercentClick(pct)}
              className="py-1 px-1 bg-[#141620] hover:bg-[#1e293b] border border-[#1e293b]/60 rounded text-[10px] font-mono text-slate-300 font-medium transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Take Profit & Stop Loss Optional Inputs */}
      <div className="mb-3 bg-[#0f1118] p-2 rounded-lg border border-[#1e293b]/50">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
            <input
              type="checkbox"
              checked={enableTpSl}
              onChange={(e) => setEnableTpSl(e.target.checked)}
              className="rounded bg-[#1e293b] border-slate-700 text-[#00d2ff] focus:ring-0"
            />
            <span>{t('tpSlProtection')}</span>
          </label>
        </div>

        {enableTpSl && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#1e293b]/40">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">{t('takeProfit')}</span>
              <input
                type="number"
                value={tpPriceStr}
                onChange={(e) => setTpPriceStr(e.target.value)}
                placeholder={formatPrice(executionPrice * (side === 'long' ? 1.05 : 0.95), market.precision).replace('$', '')}
                className="w-full bg-[#161822] border border-[#1e293b] rounded py-1 px-2 text-white font-mono text-xs focus:outline-none focus:border-[#00d2ff]"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">{t('stopLoss')}</span>
              <input
                type="number"
                value={slPriceStr}
                onChange={(e) => setSlPriceStr(e.target.value)}
                placeholder={formatPrice(executionPrice * (side === 'long' ? 0.95 : 1.05), market.precision).replace('$', '')}
                className="w-full bg-[#161822] border border-[#1e293b] rounded py-1 px-2 text-white font-mono text-xs focus:outline-none focus:border-[#ff4d4d]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Order Metrics Breakdown */}
      <div className="space-y-1.5 bg-[#0b0c10] p-2.5 rounded-lg border border-[#1e293b]/50 mb-3 font-mono text-[11px]">
        <div className="flex justify-between text-slate-400">
          <span>{t('availableMargin')}</span>
          <span className="text-white tabular-nums">${availableBalance.toFixed(2)} USDC</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>{t('marginRequired')}</span>
          <span className="text-slate-200 tabular-nums">${marginRequired.toFixed(2)} USDC</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>{t('notionalSize')}</span>
          <span className="text-slate-200 tabular-nums">
            ${notionalSize.toFixed(2)} ({sizeInAsset.toFixed(market.sizePrecision)} {market.baseAsset})
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>{t('estLiqPrice')}</span>
          <span className="text-[#ff4d4d] font-bold tabular-nums">
            {estimatedLiqPrice > 0 ? formatPrice(estimatedLiqPrice, market.precision) : t('none')}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>{t('estSlippageFee')}</span>
          <span className="text-slate-300">0.02% (-0.01% / 0.035%)</span>
        </div>
        {market.fundingRate !== undefined && (
          <div className="flex justify-between text-slate-400">
            <span>{t('fundingRate')}</span>
            <span className={market.fundingRate >= 0 ? 'text-[#00d2ff]' : 'text-red-400'}>
              {(market.fundingRate * 100).toFixed(4)}% · 00:38:14
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 p-2 mb-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-1.5 p-2.5 mb-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}


      {/* Big Action Execution Button */}
      <button
        onClick={handleOpenPosition}
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
          side === 'long'
            ? isBuyGreen
              ? 'bg-[#10b981] hover:bg-[#059669] text-black shadow-emerald-500/25'
              : 'bg-[#00d2ff] hover:bg-[#00bfe8] text-black shadow-[#00d2ff]/25'
            : 'bg-[#ff4d4d] hover:bg-[#e03d3d] text-white shadow-[#ff4d4d]/25'
        }`}
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>
              {side === 'long'
                ? `${t('openPositionLong')} (${currentLeverage}x)${isDemoMode ? ` · ${t('demoUpper')}` : ''}`
                : `${t('openPositionShort')} (${currentLeverage}x)${isDemoMode ? ` · ${t('demoUpper')}` : ''}`}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
