import React, { useState, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  ChevronDown,
  Search,
  HelpCircle,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Wallet,
} from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  category: 'general' | 'security' | 'l1' | 'trading' | 'copytrading';
  answer: string | React.ReactNode;
  tags?: string[];
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is Nexora?',
    category: 'general',
    tags: ['nexora', 'overview', 'terminal', 'perps'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">Nexora</strong> is a next-generation decentralized exchange (DEX) and institutional-grade trading terminal built natively on the <strong className="text-[#00d2ff]">Hyperliquid Layer 1</strong> blockchain.
        </p>
        <p>
          Nexora bridges the gap between centralized exchange performance and decentralized sovereignty. It enables traders to trade crypto perpetuals (BTC, ETH, SOL, HYPE), tokenized US equities (NVDA, AAPL, TSLA), commodities (Gold, Silver, Oil), and global macro indices 24/7/365 with:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs text-slate-300">
          <li className="flex items-center gap-2 p-2 rounded-lg bg-[#0e121a] border border-[#1e293b]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]" />
            <span>Up to 50x leverage on major pairs</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-[#0e121a] border border-[#1e293b]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Sub-second (12ms) execution latency</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-[#0e121a] border border-[#1e293b]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>0% maker fees & zero gas to place orders</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-[#0e121a] border border-[#1e293b]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>100% non-custodial self-custody</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faq-2',
    question: 'Does Nexora have a mobile app for iOS and Android?',
    category: 'general',
    tags: ['mobile', 'ios', 'android', 'pwa', 'app'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">Yes!</strong> Nexora is architected from the ground up as a mobile-first Progressive Web App (PWA) with native-equivalent performance, as well as native client packages for both iOS and Android.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#0e121a] border border-[#1e293b] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Smartphone className="w-4 h-4 text-[#00d2ff]" />
              <span>iOS (Safari PWA & TestFlight)</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Tap the <strong>Share</strong> button in mobile Safari and select <strong>&quot;Add to Home Screen&quot;</strong>. Enjoy full-screen biometric Face ID sign-in, zero browser chrome, and instant HFT chart interactions.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#0e121a] border border-[#1e293b] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Android (Chrome & APK)</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Tap <strong>&quot;Install App&quot;</strong> when prompted in Chrome or download the verified APK. Supports fingerprint passkeys and real-time push notifications for order fills and margin alerts.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-3',
    question: 'Is Nexora safe to use?',
    category: 'security',
    tags: ['safety', 'security', 'audit', 'non-custodial'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">Yes, Nexora is built on uncompromising non-custodial DeFi principles.</strong> Unlike centralized exchanges (like FTX, Celsius, or Mt. Gox) where management can misappropriate customer funds, Nexora operates strictly on-chain:
        </p>
        <ul className="space-y-2 text-xs text-slate-300 font-sans">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Deterministic On-Chain Engine:</strong> All order matching, position calculations, funding rates, and liquidations execute through immutable smart contracts on Hyperliquid L1.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Independently Audited:</strong> Core settlement contracts and bridge contracts have undergone rigorous third-party formal verification and continuous penetration audits.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>No Fractional Reserves:</strong> Every dollar of collateral is publicly verifiable on-chain 24/7 with zero hidden liabilities.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faq-4',
    question: 'Does Nexora hold or have access to my funds?',
    category: 'security',
    tags: ['custody', 'funds', 'wallet', 'keys'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">No, Nexora never holds, touches, or has access to your funds.</strong>
        </p>
        <p>
          Nexora is 100% self-custodial. When you connect a wallet (such as MetaMask, Rabby, Phantom, or a Privy embedded wallet), you retain full cryptographic ownership of your private keys. Your collateral is held inside decentralized smart contracts on the blockchain, not in a corporate bank account or omnibus company wallet.
        </p>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200">
          <strong>Key Rule of Self-Custody:</strong> No employee, developer, or government can freeze your account, confiscate your tokens, or block you from executing signed transactions.
        </div>
      </div>
    ),
  },
  {
    id: 'faq-5',
    question: 'Can I withdraw my funds whenever I want?',
    category: 'security',
    tags: ['withdraw', 'funds', 'instant', 'unlimited'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">Yes, anytime — 24 hours a day, 7 days a week, 365 days a year.</strong>
        </p>
        <p>
          There are no withdrawal windows, no daily limits imposed by administrators, no manual compliance approvals, and no delays. As long as your available margin is not tied up in active leveraged positions, you can withdraw your USDC directly back to your Arbitrum, Ethereum, or Solana wallet in seconds.
        </p>
        <p className="text-xs text-slate-400">
          Settlement is processed directly by the Hyperliquid L1 bridge validators with sub-minute blockchain finality.
        </p>
      </div>
    ),
  },
  {
    id: 'faq-6',
    question: 'Do I need an account or KYC to use Nexora?',
    category: 'general',
    tags: ['kyc', 'account', 'privacy', 'nexora', 'registration'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">No KYC (Know Your Customer) is ever required.</strong> You never have to upload a passport, driver&apos;s license, utility bill, or selfie.
        </p>
        <p>
          You can interact with Nexora in two frictionless ways:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0e121a] border border-[#1e293b]">
            <h4 className="font-bold text-white mb-1">1. Web3 Wallet (Pure Pseudonymous)</h4>
            <p className="text-slate-400">
              Connect MetaMask, Rabby, Phantom, Coinbase Wallet, or WalletConnect. Zero email or personal information required.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#0e121a] border border-[#1e293b]">
            <h4 className="font-bold text-white mb-1">2. Embedded Privy Wallet (1-Click)</h4>
            <p className="text-slate-400">
              Sign in with Google, Apple, or Email. Privy creates a secure MPC self-custody wallet in the background without seed phrase headaches.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-7',
    question: 'What is Hyperliquid?',
    category: 'l1',
    tags: ['hyperliquid', 'layer1', 'blockchain', 'speed'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">Hyperliquid</strong> is a high-performance Layer 1 blockchain engineered specifically for financial applications, high-frequency order books, and derivatives.
        </p>
        <p>
          Unlike general-purpose blockchains that become slow and expensive during market volatility, Hyperliquid uses a custom consensus mechanism optimized for on-chain trading:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-[#0e121a] border border-[#1e293b] text-center">
            <span className="text-[#00d2ff] font-bold block text-base">200,000</span>
            <span className="text-slate-400 text-[11px]">Orders Per Second</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e121a] border border-[#1e293b] text-center">
            <span className="text-emerald-400 font-bold block text-base">&lt; 0.2s</span>
            <span className="text-slate-400 text-[11px]">Block Finality</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e121a] border border-[#1e293b] text-center">
            <span className="text-purple-400 font-bold block text-base">$0.00</span>
            <span className="text-slate-400 text-[11px]">Gas for Cancels</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-8',
    question: 'Why does Nexora run on Hyperliquid?',
    category: 'l1',
    tags: ['nexora', 'hyperliquid', 'latency', 'mev', 'performance'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          Nexora selected Hyperliquid L1 because traditional chains cannot handle the rigorous performance demands of institutional perpetual trading:
        </p>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-[#00d2ff] font-bold font-mono">01.</span>
            <span><strong>Zero Gas Friction:</strong> Placing, amending, and cancelling limit orders does not cost gas fees, enabling tight market-maker spreads.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00d2ff] font-bold font-mono">02.</span>
            <span><strong>No Front-Running or Toxic MEV:</strong> Hyperliquid&apos;s native L1 matching algorithm eliminates predatory sandwich bots and front-running arbitrageurs.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00d2ff] font-bold font-mono">03.</span>
            <span><strong>Deep Native Liquidity:</strong> Shared liquidity across all perpetual pairs means minimal slippage even on large institutional orders.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faq-9',
    question: 'What can I trade on Nexora?',
    category: 'trading',
    tags: ['markets', 'stocks', 'commodities', 'crypto', 'indices', 'fx'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          Nexora provides a unified multi-asset trading terminal open 24/7 across four major asset classes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0e121a] border border-[#1e293b]">
            <span className="font-bold text-white flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
              Crypto Perpetuals
            </span>
            <span className="text-slate-400">BTC, ETH, SOL, HYPE, XRP, ZEC, PUMP, kBONK, SUI, DOGE, AVAX with up to 50x leverage.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e121a] border border-[#1e293b]">
            <span className="font-bold text-white flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Tokenized US Stocks
            </span>
            <span className="text-slate-400">NVDA, AAPL, TSLA, MSFT, AMZN, GOOGL perpetuals with 24/7 continuous trading.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e121a] border border-[#1e293b]">
            <span className="font-bold text-white flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Commodities
            </span>
            <span className="text-slate-400">Gold (XAU/USD), Silver (XAG/USD), and Crude Oil (WTI) with low funding costs.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e121a] border border-[#1e293b]">
            <span className="font-bold text-white flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Indices &amp; FX
            </span>
            <span className="text-slate-400">S&amp;P 500 (SPX), Nasdaq 100 (NDX), EUR/USD, USD/JPY with institutional leverage.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-10',
    question: 'How do I start trading on Nexora?',
    category: 'trading',
    tags: ['guide', 'deposit', 'start', 'onboarding'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>Starting takes less than 60 seconds with 4 simple steps:</p>
        <ol className="space-y-2 text-xs text-slate-300 list-decimal pl-4">
          <li>
            <strong>Connect your Wallet:</strong> Click <em>&quot;Start Trading&quot;</em> or <em>&quot;Connect Wallet&quot;</em>. Use MetaMask, Phantom, or sign in instantly with Google/Apple.
          </li>
          <li>
            <strong>Deposit Collateral:</strong> Transfer USDC from Arbitrum, Ethereum, or Solana into your Hyperliquid account via the integrated bridge or 1-click fiat on-ramp.
          </li>
          <li>
            <strong>Select Asset &amp; Leverage:</strong> Pick your market (e.g. BTC/USDC) and choose your desired leverage (from 1x up to 50x) and margin mode (Isolated or Cross).
          </li>
          <li>
            <strong>Execute Trade:</strong> Enter your position size, configure Take-Profit / Stop-Loss, and click <em>Long</em> or <em>Short</em>. Execution is instant.
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: 'faq-11',
    question: 'How does copy trading work on Nexora?',
    category: 'copytrading',
    tags: ['copytrading', 'social', 'vaults', 'automated'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">Copy Trading</strong> allows you to mirror the trades of verified, top-performing master traders automatically in real time:
        </p>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
            <span><strong>Transparent On-Chain Track Records:</strong> Every leader&apos;s ROI, win rate, Sharpe ratio, and maximum drawdown are computed directly from on-chain transactions—no fake screenshots.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
            <span><strong>Proportional Smart-Order Execution:</strong> When a leader opens or closes a position, the smart contract immediately replicates the trade in your account sized proportionally to your allocated capital.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
            <span><strong>Stop Copying Anytime:</strong> You can pause, adjust leverage, or reclaim 100% of your capital at any second with a single click.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faq-12',
    question: 'Can a copy-trading leader take my money?',
    category: 'copytrading',
    tags: ['security', 'copytrading', 'custody', 'safety'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-emerald-400 font-bold">Never. It is mathematically impossible.</strong>
        </p>
        <p>
          Strategy leaders never receive custody or withdrawal rights over your funds. Your collateral stays inside your own isolated subaccount. The copy trading contract only grants trading execution permissions to replicate positions. Leaders can never transfer your tokens to their wallet, and can only earn their agreed-upon performance fee on <em>profitable</em> closed trades.
        </p>
      </div>
    ),
  },
  {
    id: 'faq-13',
    question: 'What is liquidation, and how do I avoid it?',
    category: 'trading',
    tags: ['liquidation', 'risk', 'margin', 'stoploss', 'leverage'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          <strong className="text-white">Liquidation</strong> occurs when your position&apos;s unrealized loss reaches your maintenance margin threshold, forcing the automated protocol engine to close your position to prevent account bankruptcy.
        </p>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
          <div className="font-bold text-amber-300">How to Prevent Liquidation:</div>
          <ul className="space-y-1 list-disc pl-4 text-slate-300">
            <li><strong>Use Conservative Leverage:</strong> Stick to 2x–5x leverage instead of maximum 50x. Higher leverage narrows your liquidation distance.</li>
            <li><strong>Always Set Stop-Loss (SL):</strong> Configure an automated SL order right as you enter the trade.</li>
            <li><strong>Monitor Margin Health:</strong> Maintain a healthy collateral buffer and top up margin during sudden volatility.</li>
            <li><strong>Use Isolated Margin:</strong> Confine risk strictly to the allocated margin for that trade, shielding the rest of your portfolio.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-14',
    question: 'Where do the price charts come from?',
    category: 'trading',
    tags: ['charts', 'oracles', 'tradingview', 'pyth', 'hyperliquid'],
    answer: (
      <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
        <p>
          Nexora integrates institutional-grade charting and price oracles:
        </p>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] mt-1.5" />
            <span><strong>Hyperliquid Native L1 Oracle:</strong> Aggregates real-time price feeds across Tier-1 centralized and decentralized liquidity venues with sub-second weighted median sampling.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
            <span><strong>Pyth Network &amp; Chainlink Validation:</strong> Sub-second cryptographic oracle benchmarks that protect against single-exchange wick manipulation and false liquidations.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" />
            <span><strong>TradingView Lightweight Charts:</strong> Professional interactive charts featuring full candle histories (1m, 5m, 15m, 1h, 4h, 1D), moving averages, volume profiles, and drawing tools.</span>
          </li>
        </ul>
      </div>
    ),
  },
];

interface FaqSectionProps {
  onStartTrading?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onStartTrading }) => {
  const { t, language } = useTrading();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true, // Keep first open by default
    'faq-6': true,
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    FAQ_ITEMS.forEach((f) => (all[f.id] = true));
    setOpenIds(all);
  };

  const collapseAll = () => {
    setOpenIds({});
  };

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const numId = item.id.replace('faq-', '');
      const localizedQ = t(`faqQ${numId}`, item.question).toLowerCase();
      const inQuestion = localizedQ.includes(q) || item.question.toLowerCase().includes(q);
      const inTags = item.tags?.some((tag) => tag.toLowerCase().includes(q));
      return inQuestion || inTags;
    });
  }, [searchQuery, selectedCategory, t]);

  return (
    <section id="faq-section" className="w-full pt-16 pb-12 font-sans">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e121a] border border-[#1e293b] text-xs font-mono text-[#00d2ff]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t('faqTitle', 'Frequently Asked Questions')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          {t('everythingYouNeedToKnow', 'Everything You Need to Know')}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {t('faqSubtitle', 'Clear, definitive answers on Nexora, Hyperliquid Layer 1, self-custody security, trading fees, and non-custodial copy trading.')}
        </p>

        {/* Search & Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchQuestionsPlaceholder', 'Search questions (e.g. KYC, safe, mobile app, copy trading)...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0e14] border border-[#1e293b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00d2ff] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                {t('clear', 'Clear')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={expandAll}
              className="px-3.5 py-2 rounded-xl bg-[#0e1522] hover:bg-[#152033] border border-[#23334d] hover:border-[#7dd3fc]/50 text-xs font-semibold text-slate-200 hover:text-[#bae6fd] transition-all whitespace-nowrap cursor-pointer active:scale-[0.98]"
            >
              {t('expandAll', 'Expand All')}
            </button>
            <button
              onClick={collapseAll}
              className="px-3.5 py-2 rounded-xl bg-[#0e1522] hover:bg-[#152033] border border-[#23334d] hover:border-[#7dd3fc]/50 text-xs font-semibold text-slate-200 hover:text-[#bae6fd] transition-all whitespace-nowrap cursor-pointer active:scale-[0.98]"
            >
              {t('collapse', 'Collapse')}
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 pt-2">
          {[
            { id: 'all', label: t('allQuestions14', 'All 14 Questions') },
            { id: 'general', label: t('platformMobile', 'Platform & Mobile') },
            { id: 'security', label: t('securityCustody', 'Security & Custody') },
            { id: 'l1', label: 'Hyperliquid L1' },
            { id: 'trading', label: t('tradingOracles', 'Trading & Oracles') },
            { id: 'copytrading', label: t('copytrading', 'Copy Trading') },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#7dd3fc] text-[#04131d] font-bold border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_12px_rgba(125,211,252,0.3)]'
                  : 'bg-[#0d121c] hover:bg-[#141c2b] text-slate-300 hover:text-white border-[#1e293b] font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="max-w-4xl mx-auto space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-[#0a0c12] border border-[#1e293b] rounded-2xl p-6">
            <p className="text-slate-400 text-sm">{t('noQuestionsMatched', 'No questions matched')} &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs text-[#00d2ff] hover:underline font-bold"
            >
              {t('resetSearchFilter', 'Reset search filter')}
            </button>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isOpen = !!openIds[item.id];
            const numId = item.id.replace('faq-', '');
            const translatedQ = t(`faqQ${numId}`, item.question);
            const translatedA = language === 'en' ? '' : t(`faqA${numId}`, '');
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#0a0d14] border-[#00d2ff]/40 shadow-lg shadow-[#00d2ff]/5'
                    : 'bg-[#080a0f] border-[#181f2c] hover:border-[#273245]'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between text-left p-4 sm:p-5 gap-4 group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 h-7 rounded-lg bg-[#111622] border border-[#1e293b] text-[#00d2ff] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#00d2ff] transition-colors">
                      {translatedQ}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full bg-[#111622] flex items-center justify-center shrink-0 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#00d2ff] bg-[#00d2ff]/10' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-slate-300 border-t border-[#161c28]/80 animate-in fade-in duration-200">
                    <div className="pt-2">
                      {translatedA ? (
                        <p className="text-slate-300 leading-relaxed text-sm">{translatedA}</p>
                      ) : (
                        item.answer
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom CTA Banner */}
      <div className="max-w-4xl mx-auto mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0a0d14] via-[#0f1422] to-[#0a0d14] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-black text-white">
            {t('readyToTradeTitle', 'Ready to trade on Hyperliquid L1?')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {t('readyToTradeSubtitle', 'No KYC, 0% maker fees, and 24/7 self-custodial on-chain execution.')}
          </p>
        </div>

        {onStartTrading && (
          <button
            onClick={onStartTrading}
            className="px-6 py-3 rounded-xl bg-[#7dd3fc] hover:bg-[#bae6fd] text-[#04131d] font-extrabold text-sm border border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_6px_24px_rgba(125,211,252,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_32px_rgba(125,211,252,0.48)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] transition-all whitespace-nowrap flex items-center gap-2 group cursor-pointer"
          >
            <span>{t('startTradingNow', 'Start Trading Now')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </section>
  );
};
