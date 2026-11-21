export interface MasterTraderDeal {
  id: string;
  marketSymbol: string;
  marketName: string;
  side: 'long' | 'short';
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  size: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  openTime: string;
  tpPrice?: number;
  slPrice?: number;
}

export interface MasterTraderClosedDeal {
  id: string;
  marketSymbol: string;
  side: 'long' | 'short';
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  realizedPnl: number;
  realizedPnlPercent: number;
  closedTime: string;
  duration: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface MasterTrader {
  id: string;
  name: string;
  handle: string;
  address: string;
  shortAddress: string;
  verified?: boolean;
  avatarColor: string;
  avatarInitials: string;
  rank: number;
  bio: string;
  isTopProfitable: boolean;
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  copiersCount: number;
  aum: number;
  maxDrawdown: number;
  profitSharePercent: number;
  sharpeRatio: number;
  bias: string;
  volume30d: string;
  aumFormatted: string;
  avgTradesPerDay: number;
  winRate30d: number;
  maxDrawdown30d: number;
  lead30dPnlPercent: number;
  lead30dPnlAmount: number;
  sparkline: number[];
  perpsTotalValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  marginUsed: number;
  availableMargin: number;
  tradingStylePills: string[];
  favToken: string;
  avgHoldingTime: string;
  leverageRange: string;
  timeframeChartData?: Record<string, ChartDataPoint[]>;
  activeDeals: MasterTraderDeal[];
  closedDeals: MasterTraderClosedDeal[];
  tags: string[];
}

export interface CopiedTraderRecord {
  traderId: string;
  traderName: string;
  traderHandle: string;
  allocatedMargin: number;
  stopLossPercent: number;
  copiedAt: number;
  status: 'active' | 'paused';
  copiedPnl: number;
  activeCopiedTradesCount: number;
}

export const MASTER_TRADERS: MasterTrader[] = [
  {
    id: '0xd839...7255',
    name: '0xd839...7255',
    handle: '@0xd839_hft',
    address: '0xd8394e50338ab3818e69317589574ef9a1e07255',
    shortAddress: '0xd839...7255',
    verified: true,
    avatarColor: 'from-cyan-400 to-blue-600',
    avatarInitials: '0x',
    rank: 1,
    isTopProfitable: true,
    bio: 'Algorithmic perpetual market maker on Hyperliquid L1. Specializes in short delta-neutral hedging and high-frequency orderbook spread extraction.',
    totalPnl: 63754.00,
    totalPnlPercent: 90.88,
    winRate: 97.30,
    copiersCount: 3840,
    aum: 214570.00,
    maxDrawdown: 0.00,
    profitSharePercent: 10,
    sharpeRatio: 4.82,
    bias: 'Bearish',
    volume30d: '$102.66M',
    aumFormatted: '$214.57K',
    avgTradesPerDay: 66.7,
    winRate30d: 97.30,
    maxDrawdown30d: 0.00,
    lead30dPnlPercent: 90.88,
    lead30dPnlAmount: 63754,
    sparkline: [10, 14, 18, 22, 21, 26, 30, 34, 38, 42, 45, 48, 55, 62, 68, 74, 82, 88, 91],
    perpsTotalValue: 214570.00,
    unrealizedPnl: 1840.50,
    unrealizedPnlPercent: 0.86,
    marginUsed: 42100.00,
    availableMargin: 172470.00,
    tradingStylePills: ['Perps', 'Active', 'HFT Spread', 'Delta Neutral'],
    favToken: 'BTC-PERP',
    avgHoldingTime: '2h 14m',
    leverageRange: '5x - 20x',
    tags: ['👑 #1 30D PnL', 'Zero Drawdown', '97.3% Win Rate', 'Hyperliquid Native'],
    activeDeals: [
      {
        id: 'deal-0xd8-1',
        marketSymbol: 'BTC-USDC',
        marketName: 'Bitcoin Perpetual',
        side: 'short',
        leverage: 20,
        entryPrice: 68450.00,
        currentPrice: 67210.00,
        size: 3.5,
        unrealizedPnl: 4340.00,
        unrealizedPnlPercent: 63.4,
        openTime: '1 hour ago',
        tpPrice: 65800.00,
        slPrice: 69200.00,
      },
      {
        id: 'deal-0xd8-2',
        marketSymbol: 'ETH-USDC',
        marketName: 'Ethereum Perpetual',
        side: 'short',
        leverage: 15,
        entryPrice: 2680.00,
        currentPrice: 2615.00,
        size: 40,
        unrealizedPnl: 2600.00,
        unrealizedPnlPercent: 37.1,
        openTime: '3 hours ago',
        tpPrice: 2540.00,
        slPrice: 2720.00,
      },
    ],
    closedDeals: [
      {
        id: 'closed-0xd8-1',
        marketSymbol: 'SOL-USDC',
        side: 'short',
        leverage: 10,
        entryPrice: 158.40,
        exitPrice: 147.20,
        realizedPnl: 11200.00,
        realizedPnlPercent: 70.7,
        closedTime: 'Oct 21, 2026',
        duration: '14 hours',
      },
      {
        id: 'closed-0xd8-2',
        marketSymbol: 'BTC-USDC',
        side: 'short',
        leverage: 25,
        entryPrice: 69120.00,
        exitPrice: 67400.00,
        realizedPnl: 24500.00,
        realizedPnlPercent: 62.2,
        closedTime: 'Oct 19, 2026',
        duration: '22 hours',
      },
    ],
  },
  {
    id: 'Liquid_Baron',
    name: 'Liquid_Baron',
    handle: '@liquid_baron',
    address: '0xc794b15099042b3329b332',
    shortAddress: '0xc794...b332',
    verified: false,
    avatarColor: 'from-amber-400 to-rose-600',
    avatarInitials: 'LB',
    rank: 2,
    isTopProfitable: false,
    bio: 'Micro-cap perpetual sniper and liquidation liquidity hunter. Extreme asymmetric payoff seeker with dynamic leverage.',
    totalPnl: 313.00,
    totalPnlPercent: 64.49,
    winRate: 0.00,
    copiersCount: 412,
    aum: 83.69,
    maxDrawdown: 543.05,
    profitSharePercent: 10,
    sharpeRatio: 1.15,
    bias: 'Bearish',
    volume30d: '$715.66',
    aumFormatted: '$83.69',
    avgTradesPerDay: 0.3,
    winRate30d: 0.00,
    maxDrawdown30d: 543.05,
    lead30dPnlPercent: 64.49,
    lead30dPnlAmount: 313,
    sparkline: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 48, 52, 54, 55, 55, 55],
    perpsTotalValue: 83.69,
    unrealizedPnl: 24.50,
    unrealizedPnlPercent: 29.3,
    marginUsed: 35.00,
    availableMargin: 48.69,
    tradingStylePills: ['Perps', 'Sniper', 'High Vol'],
    favToken: 'DOGE-PERP',
    avgHoldingTime: '1d 18m',
    leverageRange: '10x - 50x',
    tags: ['Asymmetric', 'Liquidation Hunter'],
    activeDeals: [
      {
        id: 'deal-lb-1',
        marketSymbol: 'DOGE-USDC',
        marketName: 'Dogecoin Perpetual',
        side: 'short',
        leverage: 15,
        entryPrice: 0.142,
        currentPrice: 0.134,
        size: 5000,
        unrealizedPnl: 40.00,
        unrealizedPnlPercent: 56.3,
        openTime: '12 hours ago',
      },
    ],
    closedDeals: [
      {
        id: 'closed-lb-1',
        marketSymbol: 'WIF-USDC',
        side: 'short',
        leverage: 20,
        entryPrice: 2.84,
        exitPrice: 2.45,
        realizedPnl: 290.00,
        realizedPnlPercent: 274.6,
        closedTime: 'Oct 18, 2026',
        duration: '2 days',
      },
    ],
  },
  {
    id: '0x6859...7e1e',
    name: '0x6859...7e1e',
    handle: '@whales_perps',
    address: '0x6859341aa50bf9828e18471e1e',
    shortAddress: '0x6859...7e1e',
    verified: true,
    avatarColor: 'from-emerald-400 to-teal-600',
    avatarInitials: '0x',
    rank: 3,
    isTopProfitable: true,
    bio: 'Multi-million AUM perpetual desk. Macro institutional execution across BTC, ETH, and top L1 assets. Low turnover, heavy position sizing.',
    totalPnl: 2180713.00,
    totalPnlPercent: 49.08,
    winRate: 45.90,
    copiersCount: 5120,
    aum: 7910000.00,
    maxDrawdown: 0.01,
    profitSharePercent: 10,
    sharpeRatio: 3.91,
    bias: 'Bearish 3.18x',
    volume30d: '$17.44M',
    aumFormatted: '$7.91M',
    avgTradesPerDay: 66.7,
    winRate30d: 45.90,
    maxDrawdown30d: 0.01,
    lead30dPnlPercent: 49.08,
    lead30dPnlAmount: 2180713,
    sparkline: [35, 30, 24, 20, 28, 22, 26, 38, 45, 42, 50, 48, 54, 52, 60, 58, 65],
    perpsTotalValue: 7910000.00,
    unrealizedPnl: 142800.00,
    unrealizedPnlPercent: 1.80,
    marginUsed: 2450000.00,
    availableMargin: 5460000.00,
    tradingStylePills: ['Perps', 'Institutional', 'Macro', 'Hedging'],
    favToken: 'BTC-PERP',
    avgHoldingTime: '3d 8h',
    leverageRange: '3x - 5x',
    tags: ['Institutional AUM', '$7.91M Pool', 'Low Drawdown', 'Verified Master'],
    activeDeals: [
      {
        id: 'deal-0x68-1',
        marketSymbol: 'BTC-USDC',
        marketName: 'Bitcoin Perpetual',
        side: 'short',
        leverage: 3,
        entryPrice: 68900.00,
        currentPrice: 67180.00,
        size: 50.0,
        unrealizedPnl: 86000.00,
        unrealizedPnlPercent: 7.5,
        openTime: '2 days ago',
      },
    ],
    closedDeals: [
      {
        id: 'closed-0x68-1',
        marketSymbol: 'ETH-USDC',
        side: 'short',
        leverage: 3.5,
        entryPrice: 2750.00,
        exitPrice: 2580.00,
        realizedPnl: 450000.00,
        realizedPnlPercent: 21.6,
        closedTime: 'Oct 15, 2026',
        duration: '5 days',
      },
    ],
  },
  {
    id: 'thank_you_JEFF',
    name: 'thank you JEFF',
    handle: '@jeff_enjoyer',
    address: '0x2d238b14e924a1b02925e00',
    shortAddress: '0x2d23...5e00',
    verified: false,
    avatarColor: 'from-purple-400 to-indigo-600',
    avatarInitials: 'TJ',
    rank: 4,
    isTopProfitable: false,
    bio: 'Dedicated hyperliquid perp scalper. Systematic risk parity model running on 1-minute orderbook flow.',
    totalPnl: 651885.00,
    totalPnlPercent: 48.35,
    winRate: 82.10,
    copiersCount: 2280,
    aum: 4520000.00,
    maxDrawdown: 2.41,
    profitSharePercent: 10,
    sharpeRatio: 3.48,
    bias: 'Neutral',
    volume30d: '$315.27M',
    aumFormatted: '$4.52M',
    avgTradesPerDay: 12.4,
    winRate30d: 82.10,
    maxDrawdown30d: 2.41,
    lead30dPnlPercent: 48.35,
    lead30dPnlAmount: 651885,
    sparkline: [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
    perpsTotalValue: 4520000.00,
    unrealizedPnl: 18240.00,
    unrealizedPnlPercent: 0.40,
    marginUsed: 980000.00,
    availableMargin: 3540000.00,
    tradingStylePills: ['Perps', 'Parity', 'Neutral Bias'],
    favToken: 'SOL-PERP',
    avgHoldingTime: '5h 30m',
    leverageRange: '5x - 15x',
    tags: ['High Volume', '$315M Vol', 'Systematic'],
    activeDeals: [
      {
        id: 'deal-tj-1',
        marketSymbol: 'SOL-USDC',
        marketName: 'Solana Perpetual',
        side: 'long',
        leverage: 10,
        entryPrice: 152.00,
        currentPrice: 155.60,
        size: 500,
        unrealizedPnl: 1800.00,
        unrealizedPnlPercent: 23.7,
        openTime: '5 hours ago',
      },
    ],
    closedDeals: [
      {
        id: 'closed-tj-1',
        marketSymbol: 'AVAX-USDC',
        side: 'short',
        leverage: 10,
        entryPrice: 28.50,
        exitPrice: 26.10,
        realizedPnl: 48000.00,
        realizedPnlPercent: 84.2,
        closedTime: 'Oct 17, 2026',
        duration: '18 hours',
      },
    ],
  },
  {
    id: '0xd7b8...9f55',
    name: '0xd7b8...9f55',
    handle: '@0xd7b8_scalp',
    address: '0xd7b8f993358043685419f55',
    shortAddress: '0xd7b8...9f55',
    verified: false,
    avatarColor: 'from-pink-500 to-rose-600',
    avatarInitials: '0x',
    rank: 5,
    isTopProfitable: false,
    bio: 'High leverage breakout momentum. Ultra-tight stop losses with 10x leverage allocation on macro pullbacks.',
    totalPnl: 579396.00,
    totalPnlPercent: 29.91,
    winRate: 64.20,
    copiersCount: 1680,
    aum: 1180000.00,
    maxDrawdown: 5.12,
    profitSharePercent: 10,
    sharpeRatio: 2.88,
    bias: 'Bearish 10.06x',
    volume30d: '$980.41M',
    aumFormatted: '$1.18M',
    avgTradesPerDay: 45.2,
    winRate30d: 64.20,
    maxDrawdown30d: 5.12,
    lead30dPnlPercent: 29.91,
    lead30dPnlAmount: 579396,
    sparkline: [30, 25, 18, 14, 12, 18, 35, 48, 52, 54, 53, 55, 54, 56, 55, 55],
    perpsTotalValue: 1180000.00,
    unrealizedPnl: 32400.00,
    unrealizedPnlPercent: 2.75,
    marginUsed: 350000.00,
    availableMargin: 830000.00,
    tradingStylePills: ['Perps', 'High Leverage', 'Momentum'],
    favToken: 'ETH-PERP',
    avgHoldingTime: '1h 45m',
    leverageRange: '10x - 25x',
    tags: ['Ultra High Volume', '$980M Vol', 'Momentum'],
    activeDeals: [
      {
        id: 'deal-0xd7-1',
        marketSymbol: 'ETH-USDC',
        marketName: 'Ethereum Perpetual',
        side: 'short',
        leverage: 10,
        entryPrice: 2650.00,
        currentPrice: 2610.00,
        size: 50,
        unrealizedPnl: 20000.00,
        unrealizedPnlPercent: 15.1,
        openTime: '2 hours ago',
      },
    ],
    closedDeals: [
      {
        id: 'closed-0xd7-1',
        marketSymbol: 'BTC-USDC',
        side: 'short',
        leverage: 12,
        entryPrice: 68400.00,
        exitPrice: 67100.00,
        realizedPnl: 156000.00,
        realizedPnlPercent: 22.8,
        closedTime: 'Oct 20, 2026',
        duration: '1 day',
      },
    ],
  },
  {
    id: '0x3d89...eb14',
    name: '0x3d89...eb14',
    handle: '@quant_eb14',
    address: '0x3d898ba27481977724a1eb14',
    shortAddress: '0x3d89...eb14',
    verified: false,
    avatarColor: 'from-blue-400 to-indigo-600',
    avatarInitials: '0x',
    rank: 6,
    isTopProfitable: false,
    bio: 'Statistical arbitrage and mean reversion trading on altcoin perpetuals against BTC/ETH benchmarks.',
    totalPnl: 549788.00,
    totalPnlPercent: 28.78,
    winRate: 71.50,
    copiersCount: 1450,
    aum: 890120.00,
    maxDrawdown: 3.08,
    profitSharePercent: 10,
    sharpeRatio: 2.72,
    bias: 'Bearish 4.21x',
    volume30d: '$45.93M',
    aumFormatted: '$890.12K',
    avgTradesPerDay: 31.8,
    winRate30d: 71.50,
    maxDrawdown30d: 3.08,
    lead30dPnlPercent: 28.78,
    lead30dPnlAmount: 549788,
    sparkline: [25, 20, 16, 22, 19, 28, 32, 30, 36, 42, 40, 48, 52, 58, 56, 62],
    perpsTotalValue: 890120.00,
    unrealizedPnl: 14200.00,
    unrealizedPnlPercent: 1.60,
    marginUsed: 210000.00,
    availableMargin: 680120.00,
    tradingStylePills: ['Perps', 'Stat-Arb', 'Mean Revert'],
    favToken: 'NEAR-PERP',
    avgHoldingTime: '4h 20m',
    leverageRange: '4x - 10x',
    tags: ['Stat Arb', 'Alt Perps', 'Consistent'],
    activeDeals: [
      {
        id: 'deal-0x3d-1',
        marketSymbol: 'NEAR-USDC',
        marketName: 'Near Protocol Perpetual',
        side: 'short',
        leverage: 5,
        entryPrice: 5.12,
        currentPrice: 4.88,
        size: 5000,
        unrealizedPnl: 1200.00,
        unrealizedPnlPercent: 23.4,
        openTime: '4 hours ago',
      },
    ],
    closedDeals: [
      {
        id: 'closed-0x3d-1',
        marketSymbol: 'SUI-USDC',
        side: 'short',
        leverage: 4,
        entryPrice: 2.24,
        exitPrice: 2.01,
        realizedPnl: 34500.00,
        realizedPnlPercent: 41.1,
        closedTime: 'Oct 19, 2026',
        duration: '16 hours',
      },
    ],
  },
  {
    // The exact featured leader from the Leader Details screenshot!
    id: '0x7271...1e2c',
    name: '0x7271...1e2c',
    handle: '@0x7271_master',
    address: '0x72718b839a4eb8ee4034d24c1c1a1b1f1ce41e2c',
    shortAddress: '0x7271...1e2c',
    verified: true,
    avatarColor: 'from-slate-400 to-slate-700',
    avatarInitials: '0x',
    rank: 7,
    isTopProfitable: false,
    bio: 'Primary Hyperliquid L1 test validator and perp liquidity leader. Executes high-precision cross-margin perpetual pairs.',
    totalPnl: 0.00,
    totalPnlPercent: 0.00,
    winRate: 97.30,
    copiersCount: 1820,
    aum: 214570.00,
    maxDrawdown: 0.00,
    profitSharePercent: 10,
    sharpeRatio: 3.45,
    bias: 'Neutral',
    volume30d: '$102.66M',
    aumFormatted: '$214.57K',
    avgTradesPerDay: 66.7,
    winRate30d: 97.30,
    maxDrawdown30d: 0.00,
    lead30dPnlPercent: 0.00,
    lead30dPnlAmount: 0.00,
    sparkline: [50, 48, 52, 58, 55, 48, 44, 40, 36, 42, 38, 35, 32, 28, 25, 22, 26, 20],
    perpsTotalValue: 0.00,
    unrealizedPnl: 0.00,
    unrealizedPnlPercent: 0.00,
    marginUsed: 0.00,
    availableMargin: 0.00,
    tradingStylePills: ['Perps', 'Active'],
    favToken: 'BTC-PERP',
    avgHoldingTime: '2h 30m',
    leverageRange: '3x - 10x',
    tags: ['Verified Leader', 'Perps Active', 'Hyperliquid Node'],
    activeDeals: [
      {
        id: 'deal-0x72-1',
        marketSymbol: 'BTC-USDC',
        marketName: 'Bitcoin Perpetual',
        side: 'long',
        leverage: 10,
        entryPrice: 67200.00,
        currentPrice: 67450.00,
        size: 1.5,
        unrealizedPnl: 375.00,
        unrealizedPnlPercent: 3.7,
        openTime: '30 mins ago',
      },
    ],
    closedDeals: [
      {
        id: 'closed-0x72-1',
        marketSymbol: 'ETH-USDC',
        side: 'long',
        leverage: 10,
        entryPrice: 2590.00,
        exitPrice: 2640.00,
        realizedPnl: 2500.00,
        realizedPnlPercent: 19.3,
        closedTime: 'Oct 21, 2026',
        duration: '6 hours',
      },
    ],
  },
];

export const DEFAULT_USER_TRADER_PROFILE = {
  id: 'NX-90421',
  name: 'Anatoli Marchenko',
  handle: '@Anatoli_M',
  totalCopiers: 142,
  profitShareEarned: 1840.50,
  winRate: 88.5,
  totalPnl: 18450.00,
  totalPnlPercent: 124.8,
  activeFollowersCount: 28,
  aum: 145000.00,
  status: 'active',
  isMasterTraderEnabled: false,
};
