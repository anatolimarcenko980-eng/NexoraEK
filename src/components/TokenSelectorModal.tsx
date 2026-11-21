import React, { useState, useMemo } from 'react';
import { CryptoLogo } from './CryptoLogo';
import { PORTFOLIO_CRYPTO_LIST, CryptoAssetMeta } from '../data/portfolioData';
import { useTrading } from '../context/TradingContext';
import { Search, X, Check, Sparkles } from 'lucide-react';

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (symbol: string) => void;
  selectedToken?: string;
  title?: string;
  excludeToken?: string;
}

const POPULAR_TOKENS = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'HYPE', 'SUI', 'PEPE', 'BNB', 'AVAX'];

export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
  selectedToken,
  title,
  excludeToken,
}) => {
  const { tokenBalances, markets, liveBalance, t } = useTrading();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'layer1' | 'layer2' | 'defi' | 'meme' | 'stablecoin'>('all');

  const getAssetPrice = (sym: string): number => {
    if (sym === 'USDC' || sym === 'USDT') return 1.0;
    const found = markets.find(m => m.baseAsset === sym || m.symbol === `${sym}-USDC` || m.symbol === `${sym}-USDT`);
    if (found) return found.price;
    const meta = PORTFOLIO_CRYPTO_LIST.find(c => c.symbol === sym);
    return meta ? meta.defaultPrice : 1.0;
  };

  const filteredTokens = useMemo(() => {
    return PORTFOLIO_CRYPTO_LIST.filter((token) => {
      if (excludeToken && token.symbol === excludeToken) return false;
      if (activeCategory !== 'all' && token.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          token.symbol.toLowerCase().includes(q) ||
          token.name.toLowerCase().includes(q) ||
          token.network.toLowerCase().includes(q)
        );
      }
      return true;
    }).map(token => {
      const bal = tokenBalances[token.symbol] ?? (token.symbol === 'USDC' ? liveBalance : 0);
      const price = getAssetPrice(token.symbol);
      const usdVal = bal * price;
      return {
        ...token,
        balance: bal,
        price,
        usdVal,
      };
    }).sort((a, b) => b.usdVal - a.usdVal);
  }, [searchQuery, activeCategory, excludeToken, tokenBalances, markets, liveBalance]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0a0c12] border border-[#1e293b] rounded-3xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1b1f2b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">{title || t('selectAToken')}</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#161a26] text-[#00d2ff] border border-[#00d2ff]/20">
              {PORTFOLIO_CRYPTO_LIST.length} {t('tokensCount')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161a26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 pb-2 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchByTokenName')}
              className="w-full bg-[#12151f] border border-[#222838] focus:border-[#00d2ff] rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Popular Tokens Quick-Select Badges with Logos */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00d2ff]" />
              <span>{t('popularCryptos')}</span>
            </span>
            <div className="flex items-center flex-wrap gap-1.5">
              {POPULAR_TOKENS.map((sym) => {
                const isSelected = selectedToken === sym;
                return (
                  <button
                    key={sym}
                    onClick={() => {
                      onSelectToken(sym);
                      onClose();
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#00d2ff] text-black shadow-md shadow-[#00d2ff]/20'
                        : 'bg-[#121622] hover:bg-[#1a202d] border border-[#222838] text-slate-200 hover:text-white'
                    }`}
                  >
                    <CryptoLogo symbol={sym} size="xs" />
                    <span>{sym}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] pt-1">
            {(['all', 'layer1', 'layer2', 'defi', 'meme', 'stablecoin'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-[#222735] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? t('all') : cat === 'layer1' ? 'L1' : cat === 'layer2' ? 'L2' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable List of Cryptocurrencies */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#161a25] px-2 py-1">
          {filteredTokens.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {t('noCryptoMatching')}
            </div>
          ) : (
            filteredTokens.map((token) => {
              const isSelected = selectedToken === token.symbol;
              return (
                <button
                  key={token.symbol}
                  onClick={() => {
                    onSelectToken(token.symbol);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group text-left ${
                    isSelected ? 'bg-[#00d2ff]/10 border border-[#00d2ff]/30' : 'hover:bg-[#121622]'
                  }`}
                >
                  {/* Left: Logo + Symbol + Name */}
                  <div className="flex items-center gap-3">
                    <CryptoLogo symbol={token.symbol} size="md" glow={isSelected} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white font-mono text-sm group-hover:text-[#00d2ff] transition-colors">
                          {token.symbol}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#181d28] text-slate-400 border border-[#232a3a] uppercase">
                          {token.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-[180px]">
                        {token.name}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & User Balance */}
                  <div className="text-right font-mono flex items-center gap-2.5">
                    <div>
                      <div className="font-bold text-white text-xs sm:text-sm">
                        {token.balance.toLocaleString(undefined, {
                          maximumFractionDigits: token.symbol === 'BTC' ? 4 : token.price < 0.01 ? 0 : 2,
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ${token.usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#00d2ff] text-black flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#1b1f2b] bg-[#080a0f] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Hyperliquid L1 & Arbitrum</span>
          <span className="text-emerald-400 font-bold">0 Gas Fees</span>
        </div>
      </div>
    </div>
  );
};
