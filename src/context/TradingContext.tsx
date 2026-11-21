import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Market, Position, Order, PositionSide, MarginMode, ClosedTrade } from '../types/market';
import { INITIAL_MARKETS } from '../data/marketsData';
import { INITIAL_HISTORICAL_TRADES } from '../data/historicalTrades';
import { calculateLiquidationPrice } from '../utils/tradingMath';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';
import {
  MasterTrader,
  CopiedTraderRecord,
  MASTER_TRADERS,
  DEFAULT_USER_TRADER_PROFILE,
} from '../data/copytradingData';
import { PortfolioTransaction } from '../types/portfolio';
import { INITIAL_TRANSACTIONS, INITIAL_TOKEN_BALANCES, ZERO_TOKEN_BALANCES, PORTFOLIO_CRYPTO_LIST } from '../data/portfolioData';
import { RegisteredUser, SUPERADMIN_EMAIL, SUPERADMIN_EMAILS } from '../types/user';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

export type AppTheme = 'dark' | 'light' | 'midnight';
export type CandleColorPalette = 'cyan-coral' | 'emerald-ruby';
export type BuyButtonColor = 'green' | 'cyan';
export type LayoutDensity = 'comfortable' | 'compact';
export type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY';
export type RpcNetwork = 'hyperliquid-l1' | 'arbitrum-one' | 'direct-mempool';

interface TradingContextType {
  // Appearance & Platform Settings
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  candleColors: CandleColorPalette;
  setCandleColors: (palette: CandleColorPalette) => void;
  buyButtonColor: BuyButtonColor;
  setBuyButtonColor: (color: BuyButtonColor) => void;
  hideFlag: boolean;
  setHideFlag: (hide: boolean) => void;
  layoutDensity: LayoutDensity;
  setLayoutDensity: (density: LayoutDensity) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playAudioFeedback: (type?: 'click' | 'fill' | 'alert' | 'success') => void;
  oneClickTrading: boolean;
  setOneClickTrading: (enabled: boolean) => void;
  slippageTolerance: number;
  setSlippageTolerance: (val: number) => void;
  defaultMarginMode: MarginMode;
  setDefaultMarginMode: (mode: MarginMode) => void;
  fiatCurrency: FiatCurrency;
  setFiatCurrency: (curr: FiatCurrency) => void;
  priceFlashEnabled: boolean;
  setPriceFlashEnabled: (enabled: boolean) => void;
  autoHideBalances: boolean;
  setAutoHideBalances: (enabled: boolean) => void;
  selectedRpcNetwork: RpcNetwork;
  setSelectedRpcNetwork: (rpc: RpcNetwork) => void;
  defaultOrderLeverage: number;
  setDefaultOrderLeverage: (lev: number) => void;
  markets: Market[];
  selectedMarket: Market;
  setSelectedMarket: (market: Market) => void;
  positions: Position[];
  orders: Order[];
  closedTrades: ClosedTrade[];
  demoClosedTrades: ClosedTrade[];
  walletBalance: number;
  availableBalance: number;
  isConnected: boolean;
  walletAddress: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
  faucetDeposit: (amount?: number) => void;
  resetDemoAccount: () => void;
  openPosition: (params: {
    market: Market;
    side: PositionSide;
    leverage: number;
    marginMode: MarginMode;
    marginAmount: number; // in USDC
    tpPrice?: number;
    slPrice?: number;
  }) => { success: boolean; positionId?: string; error?: string };
  closePosition: (positionId: string) => { success: boolean; realizedPnl: number };
  updateTpSl: (positionId: string, tpPrice?: number, slPrice?: number) => void;
  cancelOrder: (orderId: string) => void;
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  lastPriceFlash: Record<string, 'up' | 'down'>;
  toggleFavorite: (marketId: string) => void;
  favorites: string[];
  // Copytrading
  userTraderId: string;
  masterTraders: MasterTrader[];
  copiedTraders: CopiedTraderRecord[];
  copyTraderById: (traderId: string, margin: number, slPercent?: number) => { success: boolean; error?: string };
  stopCopyingTrader: (traderId: string) => void;
  toggleCopiedTraderStatus: (traderId: string) => void;
  userTraderProfile: typeof DEFAULT_USER_TRADER_PROFILE;
  toggleMasterTraderMode: () => void;
  // Portfolio
  tokenBalances: Record<string, number>;
  portfolioTransactions: PortfolioTransaction[];
  totalPortfolioValue: number;
  livePortfolioValue: number;
  depositTokens: (asset: string, amount: number, network: string, fail?: boolean) => { success: boolean; error?: string };
  withdrawTokens: (asset: string, amount: number, address: string, network: string) => { success: boolean; error?: string };
  swapTokens: (fromAsset: string, toAsset: string, fromAmount: number) => { success: boolean; toAmount?: number; error?: string };
  // Language & User Account
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  userEmail: string;
  updateEmail: (email: string) => { success: boolean; error?: string };
  updatePassword: (oldPass: string, newPass: string, confirmPass: string) => { success: boolean; error?: string };
  // Auth & Registration
  currentUser: RegisteredUser | null;
  isRegistered: boolean;
  isLoggedIn: boolean;
  registeredUsers: RegisteredUser[];
  registerUser: (params: {
    username: string;
    fullName?: string;
    email: string;
    password?: string;
    referralCode?: string;
    authMethod?: 'email' | 'wallet' | 'google' | 'apple' | 'passkey' | 'facebook';
    walletAddress?: string;
  }) => { success: boolean; error?: string; user?: RegisteredUser };
  loginUser: (params: { emailOrUsername: string; password?: string }) => { success: boolean; error?: string; user?: RegisteredUser };
  logoutUser: () => void;
  switchUser: (userId: string) => void;
  // SuperAdmin Capabilities (anatolimarcenko980@gmail.com)
  isAdmin: boolean;
  adminEmail: string;
  updateUserBalance: (userId: string, usdcAmount: number, tokenOverrides?: Record<string, number>, forceApplyToActive?: boolean) => { success: boolean; error?: string };
  updateUserTrades: (userId: string, newTrades: ClosedTrade[]) => void;
  adminAddTrade: (userId: string, tradeData: Omit<ClosedTrade, 'id'>) => { success: boolean; trade: ClosedTrade };
  adminEditTrade: (tradeId: string, updatedFields: Partial<ClosedTrade>) => { success: boolean };
  adminDeleteTrade: (tradeId: string) => { success: boolean };
  adminPromoteToMasterTrader: (userId: string, traderData: Partial<MasterTrader>) => { success: boolean; trader?: MasterTrader; error?: string };
  adminRemoveMasterTrader: (traderId: string) => { success: boolean };
  adminUpdateMasterTrader: (traderId: string, updatedFields: Partial<MasterTrader>) => { success: boolean };
  adminCreateUser: (userParams: Partial<RegisteredUser>) => { success: boolean; user: RegisteredUser; error?: string };
  adminDeleteUser: (userId: string) => { success: boolean; error?: string };
  // Demo Trading Mode
  tradingMode: 'demo' | 'live';
  isDemoMode: boolean;
  setTradingMode: (mode: 'demo' | 'live') => void;
  toggleTradingMode: () => void;
  demoBalance: number;
  liveBalance: number;
  resetDemoBalance: (amount?: number) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [selectedMarketId, setSelectedMarketId] = useState<string>('BTC-USDC');

  // Trading Mode: 'live' or 'demo'
  const [tradingMode, setTradingModeState] = useState<'demo' | 'live'>(() => {
    try {
      const saved = localStorage.getItem('nexora_trading_mode');
      return saved === 'demo' ? 'demo' : 'live';
    } catch {
      return 'live';
    }
  });

  const isDemoMode = tradingMode === 'demo';

  const [liveBalance, setLiveBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexora_live_balance');
      return saved ? parseFloat(saved) : 10000.00;
    } catch {
      return 10000.00;
    }
  });

  const [demoBalance, setDemoBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexora_demo_balance');
      return saved ? parseFloat(saved) : 10000.00;
    } catch {
      return 10000.00;
    }
  });

  // Current active wallet balance in trading terminal:
  const walletBalance = isDemoMode ? demoBalance : liveBalance;

  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('0x7F41...b92E');
  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_active_positions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'pos-init-demo-btc',
        marketId: 'BTC-USDC',
        symbol: 'BTC-USDC',
        baseAsset: 'BTC',
        side: 'long',
        leverage: 50,
        marginMode: 'cross',
        size: 0.2845,
        sizeUsdc: 25000,
        entryPrice: 87850,
        markPrice: 87850,
        liqPrice: 86200,
        margin: 500,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        createdAt: Date.now() - 3600 * 2 * 1000,
        isDemo: true,
      }
    ];
  });
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_active_positions', JSON.stringify(positions));
    } catch {}
  }, [positions]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_closed_trades');
      if (saved) {
        const parsed: ClosedTrade[] = JSON.parse(saved);
        return parsed.filter(t => !t.isDemo);
      }
      return INITIAL_HISTORICAL_TRADES.map(t => ({
        ...t,
        userId: 'NX-94718',
        userEmail: 'anatolimarcenko980@gmail.com',
        isDemo: false,
      }));
    } catch {
      return INITIAL_HISTORICAL_TRADES.map(t => ({
        ...t,
        userId: 'NX-94718',
        userEmail: 'anatolimarcenko980@gmail.com',
        isDemo: false,
      }));
    }
  });
  const [demoClosedTrades, setDemoClosedTrades] = useState<ClosedTrade[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_demo_closed_trades');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'welcome',
      title: 'Welcome to Nexora DEX',
      message: 'Connected to Hyperliquid L1. $10,000.00 test USDC ready for live position opening.',
      type: 'info',
      timestamp: Date.now(),
    }
  ]);
  const [lastPriceFlash, setLastPriceFlash] = useState<Record<string, 'up' | 'down'>>({});
  const [favorites, setFavorites] = useState<string[]>(['BTC-USDC', 'ETH-USDC', 'SOL-USDC', 'XRP-USDC', 'HYPE-USDC']);
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // ================= THEME & DISPLAY SETTINGS =================
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('nexora_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'midnight') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try { localStorage.setItem('nexora_theme', newTheme); } catch {}
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'midnight');
    if (newTheme === 'light') {
      root.classList.add('light');
    } else if (newTheme === 'midnight') {
      root.classList.add('dark', 'midnight');
    } else {
      root.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'midnight');
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'midnight') {
      root.classList.add('dark', 'midnight');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  // Candle colors
  const [candleColors, setCandleColorsState] = useState<CandleColorPalette>(() => {
    try {
      const saved = localStorage.getItem('nexora_candle_colors');
      if (saved === 'emerald-ruby' || saved === 'cyan-coral') return saved;
      return 'cyan-coral';
    } catch {
      return 'cyan-coral';
    }
  });
  const setCandleColors = useCallback((pal: CandleColorPalette) => {
    setCandleColorsState(pal);
    try { localStorage.setItem('nexora_candle_colors', pal); } catch {}
  }, []);

  // Layout density
  const [layoutDensity, setLayoutDensityState] = useState<LayoutDensity>(() => {
    try {
      const saved = localStorage.getItem('nexora_layout_density');
      if (saved === 'compact' || saved === 'comfortable') return saved;
      return 'comfortable';
    } catch {
      return 'comfortable';
    }
  });
  const setLayoutDensity = useCallback((density: LayoutDensity) => {
    setLayoutDensityState(density);
    try { localStorage.setItem('nexora_layout_density', density); } catch {}
  }, []);

  // Audio sound feedback
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexora_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const setSoundEnabled = useCallback((en: boolean) => {
    setSoundEnabledState(en);
    try { localStorage.setItem('nexora_sound_enabled', String(en)); } catch {}
  }, []);

  const playAudioFeedback = useCallback((type: 'click' | 'fill' | 'alert' | 'success' = 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'fill' || type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch {}
  }, [soundEnabled]);

  // One-click trading
  const [oneClickTrading, setOneClickTradingState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexora_one_click_trading') === 'true';
    } catch {
      return false;
    }
  });
  const setOneClickTrading = useCallback((en: boolean) => {
    setOneClickTradingState(en);
    try { localStorage.setItem('nexora_one_click_trading', String(en)); } catch {}
  }, []);

  // Slippage tolerance
  const [slippageTolerance, setSlippageToleranceState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexora_slippage');
      return saved ? parseFloat(saved) : 0.5;
    } catch {
      return 0.5;
    }
  });
  const setSlippageTolerance = useCallback((val: number) => {
    setSlippageToleranceState(val);
    try { localStorage.setItem('nexora_slippage', String(val)); } catch {}
  }, []);

  // Fiat currency
  const [fiatCurrency, setFiatCurrencyState] = useState<FiatCurrency>(() => {
    try {
      const saved = localStorage.getItem('nexora_currency');
      if (saved === 'EUR' || saved === 'GBP' || saved === 'JPY' || saved === 'USD') return saved;
      return 'USD';
    } catch {
      return 'USD';
    }
  });
  const setFiatCurrency = useCallback((curr: FiatCurrency) => {
    setFiatCurrencyState(curr);
    try { localStorage.setItem('nexora_currency', curr); } catch {}
  }, []);

  // Price Flash Enabled
  const [priceFlashEnabled, setPriceFlashEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexora_price_flash') !== 'false';
    } catch {
      return true;
    }
  });
  const setPriceFlashEnabled = useCallback((en: boolean) => {
    setPriceFlashEnabledState(en);
    try { localStorage.setItem('nexora_price_flash', String(en)); } catch {}
  }, []);

  // Auto Hide Balances
  const [autoHideBalances, setAutoHideBalancesState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexora_auto_hide_balances') === 'true';
    } catch {
      return false;
    }
  });
  const setAutoHideBalances = useCallback((en: boolean) => {
    setAutoHideBalancesState(en);
    try { localStorage.setItem('nexora_auto_hide_balances', String(en)); } catch {}
  }, []);

  // Network RPC
  const [selectedRpcNetwork, setSelectedRpcNetworkState] = useState<RpcNetwork>(() => {
    try {
      const saved = localStorage.getItem('nexora_rpc_network');
      if (saved === 'arbitrum-one' || saved === 'direct-mempool' || saved === 'hyperliquid-l1') return saved;
      return 'hyperliquid-l1';
    } catch {
      return 'hyperliquid-l1';
    }
  });
  const setSelectedRpcNetwork = useCallback((net: RpcNetwork) => {
    setSelectedRpcNetworkState(net);
    try { localStorage.setItem('nexora_rpc_network', net); } catch {}
  }, []);

  // Default Order Leverage
  const [defaultOrderLeverage, setDefaultOrderLeverageState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexora_default_leverage');
      return saved ? parseInt(saved, 10) : 10;
    } catch {
      return 10;
    }
  });
  const setDefaultOrderLeverage = useCallback((lev: number) => {
    setDefaultOrderLeverageState(lev);
    try { localStorage.setItem('nexora_default_leverage', String(lev)); } catch {}
  }, []);

  // Buy Button Color ('green' | 'cyan')
  const [buyButtonColor, setBuyButtonColorState] = useState<BuyButtonColor>(() => {
    try {
      const saved = localStorage.getItem('nexora_buy_button_color');
      if (saved === 'green' || saved === 'cyan') return saved;
      return 'cyan';
    } catch {
      return 'cyan';
    }
  });
  const setBuyButtonColor = useCallback((color: BuyButtonColor) => {
    setBuyButtonColorState(color);
    try { localStorage.setItem('nexora_buy_button_color', color); } catch {}
  }, []);

  // Hide Flag in Header & UI (always hidden while keeping all languages)
  const [hideFlag, setHideFlagState] = useState<boolean>(true);
  const setHideFlag = useCallback((hide: boolean) => {
    setHideFlagState(hide);
    try { localStorage.setItem('nexora_hide_flag', String(hide)); } catch {}
  }, []);

  // Default Margin Mode ('cross' | 'isolated')
  const [defaultMarginMode, setDefaultMarginModeState] = useState<MarginMode>(() => {
    try {
      const saved = localStorage.getItem('nexora_default_margin_mode');
      if (saved === 'isolated' || saved === 'cross') return saved as MarginMode;
      return 'cross';
    } catch {
      return 'cross';
    }
  });
  const setDefaultMarginMode = useCallback((mode: MarginMode) => {
    setDefaultMarginModeState(mode);
    try { localStorage.setItem('nexora_default_margin_mode', mode); } catch {}
  }, []);

  // Registered User & Account state
  const DEFAULT_USERS: RegisteredUser[] = [
    {
      id: 'NX-94718',
      username: 'AnatoliM',
      fullName: 'Anatoli Marchenko',
      email: 'anatolimarcenko980@gmail.com',
      registeredAt: '2026-09-15',
      vipTier: 'VIP 3',
      makerFeeDiscount: 100, // 0% maker fee
      takerFeeRate: 0.015,
      authMethod: 'email',
      password: 'NexoraAdmin2026!',
      walletAddress: '0x7F41...b92E',
      isEmailVerified: true,
      twoFactorEnabled: false,
      myReferralCode: 'NX-94718',
      balance: 10000.00,
      role: 'admin',
    },
    {
      id: 'NX-94717',
      username: 'AnatoliyM',
      fullName: 'Anatoliy Marchenko',
      email: 'anatoliymarhenkoser1@gmail.com',
      registeredAt: '2026-09-15',
      vipTier: 'VIP 3',
      makerFeeDiscount: 100, // 0% maker fee
      takerFeeRate: 0.015,
      authMethod: 'google',
      walletAddress: '0x7F41...b92E',
      isEmailVerified: true,
      twoFactorEnabled: false,
      myReferralCode: 'NX-94717',
      balance: 10000.00,
      role: 'user',
    },
    {
      id: 'NX-90421',
      username: 'CryptoValkyrie',
      fullName: 'Elena Vance',
      email: 'elena.vance@cryptoval.io',
      registeredAt: '2026-09-20',
      vipTier: 'VIP 2',
      makerFeeDiscount: 100,
      takerFeeRate: 0.018,
      authMethod: 'wallet',
      walletAddress: '0xd839...7255',
      isEmailVerified: true,
      twoFactorEnabled: true,
      myReferralCode: 'NX-90421',
      balance: 34500.00,
      role: 'user',
      isMasterTrader: true,
    },
    {
      id: 'NX-48210',
      username: 'ApexMarcus',
      fullName: 'Marcus Sterling',
      email: 'marcus.sterling@apexhedge.xyz',
      registeredAt: '2026-10-02',
      vipTier: 'VIP 3',
      makerFeeDiscount: 100,
      takerFeeRate: 0.015,
      authMethod: 'google',
      walletAddress: '0x6859...7e1e',
      isEmailVerified: true,
      twoFactorEnabled: false,
      myReferralCode: 'NX-48210',
      balance: 250000.00,
      role: 'user',
    },
    {
      id: 'NX-19384',
      username: 'AlphaSophia',
      fullName: 'Sophia Chen',
      email: 'sophia.chen@quantresearch.io',
      registeredAt: '2026-10-10',
      vipTier: 'VIP 2',
      makerFeeDiscount: 100,
      takerFeeRate: 0.018,
      authMethod: 'apple',
      walletAddress: '0x3d89...eb14',
      isEmailVerified: true,
      twoFactorEnabled: true,
      myReferralCode: 'NX-19384',
      balance: 78200.00,
      role: 'user',
    },
    {
      id: 'NX-62194',
      username: 'SolanaSniper',
      fullName: 'David Kim',
      email: 'david.kim@blockflow.net',
      registeredAt: '2026-10-18',
      vipTier: 'VIP 1',
      makerFeeDiscount: 100,
      takerFeeRate: 0.02,
      authMethod: 'email',
      walletAddress: '0xc794...b332',
      isEmailVerified: true,
      twoFactorEnabled: false,
      myReferralCode: 'NX-62194',
      balance: 15400.00,
      role: 'user',
    },
  ];

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_registered_users');
      let users: RegisteredUser[] = saved ? JSON.parse(saved) : DEFAULT_USERS;
      
      // Ensure only anatolimarcenko980@gmail.com has role: 'admin', and normalize all other users to 'user'
      users = users.map(u => ({
        ...u,
        role: u.email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
      }));

      DEFAULT_USERS.forEach(defUser => {
        const idx = users.findIndex(u => u.email.trim().toLowerCase() === defUser.email.trim().toLowerCase());
        if (idx === -1) {
          users.push(defUser);
        } else if (defUser.email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
          users[idx] = {
            ...users[idx],
            role: 'admin',
            vipTier: 'VIP 3',
            password: users[idx].password || defUser.password,
          };
        }
      });

      return users;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() => {
    try {
      const savedLoggedIn = localStorage.getItem('nexora_is_logged_in');
      if (savedLoggedIn === 'false') return null;
      const saved = localStorage.getItem('nexora_current_user');
      if (savedLoggedIn === 'true' && saved) {
        const parsed: RegisteredUser = JSON.parse(saved);
        const isAllowedSuperAdmin = Boolean(
          parsed.email && parsed.email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
        );
        parsed.role = isAllowedSuperAdmin ? 'admin' : 'user';
        return parsed;
      }
      return DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexora_is_logged_in');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [userEmail, setUserEmail] = useState<string>(() => currentUser?.email || 'anatolimarcenko980@gmail.com');

  // Copytrading state
  const [masterTraders, setMasterTraders] = useState<MasterTrader[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_master_traders');
      return saved ? JSON.parse(saved) : MASTER_TRADERS;
    } catch {
      return MASTER_TRADERS;
    }
  });
  const [userTraderProfile, setUserTraderProfile] = useState(DEFAULT_USER_TRADER_PROFILE);
  const [copiedTraders, setCopiedTraders] = useState<CopiedTraderRecord[]>([
    {
      traderId: 'NX-90421',
      traderName: 'Elena Vance',
      traderHandle: '@CryptoValkyrie',
      allocatedMargin: 500,
      stopLossPercent: 15,
      copiedAt: Date.now() - 3600 * 24 * 3 * 1000,
      status: 'active',
      copiedPnl: 142.50,
      activeCopiedTradesCount: 4,
    }
  ]);

  // Portfolio state (strictly bound to Real/Live balance, never Demo balance)
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('nexora_token_balances');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, USDC: liveBalance };
      }
    } catch {}
    return { ...INITIAL_TOKEN_BALANCES, USDC: liveBalance };
  });

  const [portfolioTransactions, setPortfolioTransactions] = useState<PortfolioTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_portfolio_txs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexora_portfolio_txs', JSON.stringify(portfolioTransactions));
    } catch {}
  }, [portfolioTransactions]);

  // Sync tokenBalances.USDC strictly with liveBalance (so Demo mode never leaks into Live USDC)
  useEffect(() => {
    setTokenBalances(prev => {
      if (prev.USDC !== liveBalance) {
        const updated = { ...prev, USDC: liveBalance };
        try { localStorage.setItem('nexora_token_balances', JSON.stringify(updated)); } catch {}
        return updated;
      }
      return prev;
    });
  }, [liveBalance]);
  useEffect(() => {
    async function fetchLiveTicker() {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!res.ok) return;
        const data = await res.json();
        
        const priceMap: Record<string, { price: number; change24h: number; high: number; low: number; volume: number }> = {};
        for (const item of data) {
          if (item.symbol.endsWith('USDT') || item.symbol.endsWith('USDC')) {
            const base = item.symbol.replace(/USDT|USDC$/, '');
            priceMap[base] = {
              price: parseFloat(item.lastPrice),
              change24h: parseFloat(item.priceChangePercent),
              high: parseFloat(item.highPrice),
              low: parseFloat(item.lowPrice),
              volume: parseFloat(item.quoteVolume),
            };
          }
        }

        setMarkets(prev => prev.map(m => {
          const live = priceMap[m.baseAsset];
          if (live && live.price > 0) {
            return {
              ...m,
              price: live.price,
              change24h: live.change24h,
              high24h: live.high,
              low24h: live.low,
              volume24h: Math.max(m.volume24h, live.volume),
            };
          }
          return m;
        }));
      } catch {
        // Quiet fallback to realistic default prices
      }
    }

    fetchLiveTicker();
  }, []);

  // Compute selectedMarket object: In Demo Mode, strictly locked to BTC-USDC 50x!
  const selectedMarket = React.useMemo(() => {
    if (tradingMode === 'demo') {
      const btc = markets.find(m => m.id === 'BTC-USDC') || markets[0];
      return {
        ...btc,
        leverageMax: 50,
      };
    }
    return markets.find(m => m.id === selectedMarketId) || markets[0];
  }, [tradingMode, markets, selectedMarketId]);

  // Calculate margin reserved in positions for current trading mode & live mode separately
  const marginInUse = positions
    .filter(p => (tradingMode === 'demo' ? Boolean(p.isDemo) : !p.isDemo))
    .reduce((sum, p) => sum + p.margin, 0);
  const availableBalance = Math.max(0, walletBalance - marginInUse);

  const liveMarginInUse = positions
    .filter(p => !p.isDemo)
    .reduce((sum, p) => sum + p.margin, 0);
  const liveAvailableBalance = Math.max(0, liveBalance - liveMarginInUse);

  // Live price fluctuation engine (ticking every 1.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setMarkets(prevMarkets => {
        const flashes: Record<string, 'up' | 'down'> = {};
        const updated = prevMarkets.map(market => {
          // 40% chance of updating any given market, but always update selectedMarket
          if (market.id !== selectedMarketId && Math.random() > 0.4) {
            return market;
          }

          const volatility = 0.0006 * (Math.random() * 1.5);
          const direction = Math.random() > 0.49 ? 1 : -1;
          const delta = market.price * volatility * direction;
          const newPrice = Math.max(0.00001, market.price + delta);

          flashes[market.id] = delta >= 0 ? 'up' : 'down';

          return {
            ...market,
            price: newPrice,
            high24h: Math.max(market.high24h, newPrice),
            low24h: Math.min(market.low24h, newPrice),
          };
        });

        setLastPriceFlash(flashes);
        return updated;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [selectedMarketId]);

  // Recalculate dynamic PnL for active positions whenever markets tick
  useEffect(() => {
    setPositions(prevPositions => {
      if (prevPositions.length === 0) return prevPositions;

      return prevPositions.map(pos => {
        const currentMarket = markets.find(m => m.id === pos.marketId);
        if (!currentMarket) return pos;

        const markPrice = currentMarket.price;
        let unrealizedPnl = 0;
        let unrealizedPnlPercent = 0;

        if (pos.side === 'long') {
          unrealizedPnl = (markPrice - pos.entryPrice) * pos.size;
          unrealizedPnlPercent = ((markPrice - pos.entryPrice) / pos.entryPrice) * pos.leverage * 100;
        } else {
          unrealizedPnl = (pos.entryPrice - markPrice) * pos.size;
          unrealizedPnlPercent = ((pos.entryPrice - markPrice) / pos.entryPrice) * pos.leverage * 100;
        }

        return {
          ...pos,
          markPrice,
          unrealizedPnl,
          unrealizedPnlPercent,
        };
      });
    });
  }, [markets]);

  const connectWallet = useCallback(() => {
    setIsConnected(true);
    setWalletAddress('0x7F41...b92E');
    setNotifications(prev => [
      {
        id: 'conn-' + Date.now(),
        title: 'Wallet Connected',
        message: 'Privy Smart Wallet connected: 0x7F41...b92E',
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
  }, []);

  const setTradingMode = useCallback((mode: 'demo' | 'live') => {
    setTradingModeState(mode);
    try { localStorage.setItem('nexora_trading_mode', mode); } catch {}
    if (mode === 'demo') {
      setSelectedMarketId('BTC-USDC');
      setNotifications(prev => [
        {
          id: 'demo-mode-' + Date.now(),
          title: 'Demo Trading Mode (BTC-USDC 50x)',
          message: `Switched to Demo Trading. Virtual Demo Balance: $${demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC (Live balance isolated).`,
          type: 'info',
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    } else {
      setNotifications(prev => [
        {
          id: 'live-mode-' + Date.now(),
          title: 'Live Trading Mode',
          message: `Switched to Live Trading. Real Live Balance: $${liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC.`,
          type: 'success',
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    }
  }, [demoBalance, liveBalance]);

  const toggleTradingMode = useCallback(() => {
    setTradingMode(tradingMode === 'demo' ? 'live' : 'demo');
  }, [tradingMode, setTradingMode]);

  const resetDemoBalance = useCallback((customAmount: number = 10000.00) => {
    setDemoBalance(customAmount);
    try { localStorage.setItem('nexora_demo_balance', customAmount.toString()); } catch {}

    if (currentUser?.id) {
      setRegisteredUsers(prev => {
        const updated = prev.map(u =>
          u.id === currentUser.id ? { ...u, demoBalance: customAmount } : u
        );
        try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setCurrentUser(prevUser => {
        if (!prevUser) return prevUser;
        const updatedUser = { ...prevUser, demoBalance: customAmount };
        try { localStorage.setItem('nexora_current_user', JSON.stringify(updatedUser)); } catch {}
        return updatedUser;
      });
    }

    setNotifications(prev => [
      {
        id: 'reset-demo-' + Date.now(),
        title: 'Demo Balance Reset',
        message: `$${customAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} virtual Demo USDC set (Live balance unchanged).`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, [currentUser?.id]);

  const resetDemoAccount = useCallback(() => {
    resetDemoBalance(10000.00);
  }, [resetDemoBalance]);

  const faucetDeposit = useCallback((amount: number = 5000) => {
    if (tradingMode === 'demo') {
      setDemoBalance(prev => {
        const next = Math.max(0, Math.round((prev + amount) * 100) / 100);
        try { localStorage.setItem('nexora_demo_balance', next.toString()); } catch {}
        if (currentUser?.id) {
          setRegisteredUsers(users => {
            const updated = users.map(u => (u.id === currentUser.id ? { ...u, demoBalance: next } : u));
            try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setCurrentUser(u => {
            if (!u) return u;
            const upd = { ...u, demoBalance: next };
            try { localStorage.setItem('nexora_current_user', JSON.stringify(upd)); } catch {}
            return upd;
          });
        }
        return next;
      });
    } else {
      setLiveBalance(prev => {
        const next = Math.max(0, Math.round((prev + amount) * 100) / 100);
        try { localStorage.setItem('nexora_live_balance', next.toString()); } catch {}
        if (currentUser?.id) {
          setRegisteredUsers(users => {
            const updated = users.map(u => (u.id === currentUser.id ? { ...u, balance: next } : u));
            try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setCurrentUser(u => {
            if (!u) return u;
            const upd = { ...u, balance: next };
            try { localStorage.setItem('nexora_current_user', JSON.stringify(upd)); } catch {}
            return upd;
          });
        }
        return next;
      });
    }
    setNotifications(prev => [
      {
        id: 'faucet-' + Date.now(),
        title: 'Collateral Deposited',
        message: `+${amount.toLocaleString()} USDC added to your ${tradingMode === 'demo' ? 'demo' : 'live'} balance.`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, [tradingMode, currentUser?.id]);

  const toggleFavorite = useCallback((marketId: string) => {
    setFavorites(prev => 
      prev.includes(marketId) ? prev.filter(id => id !== marketId) : [...prev, marketId]
    );
  }, []);

  // Open a new trading position
  const openPosition = useCallback(({
    market,
    side,
    leverage,
    marginMode,
    marginAmount,
    tpPrice,
    slPrice,
  }: {
    market: Market;
    side: PositionSide;
    leverage: number;
    marginMode: MarginMode;
    marginAmount: number;
    tpPrice?: number;
    slPrice?: number;
  }) => {
    if (marginAmount <= 0) {
      return { success: false, error: 'Margin amount must be greater than 0' };
    }
    if (marginAmount > availableBalance) {
      return { success: false, error: `Insufficient available ${tradingMode === 'demo' ? 'Demo' : 'Live'} margin` };
    }

    const isDemo = tradingMode === 'demo';
    const effectiveMarket = isDemo ? (markets.find(m => m.id === 'BTC-USDC') || market) : market;
    const effectiveLeverage = isDemo ? Math.min(50, leverage) : leverage;

    const notionalUsdc = marginAmount * effectiveLeverage;
    const entryPrice = effectiveMarket.price;
    const size = notionalUsdc / entryPrice;
    const liqPrice = calculateLiquidationPrice(entryPrice, side, effectiveLeverage);

    const newPosition: Position = {
      id: 'pos-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      marketId: effectiveMarket.id,
      symbol: effectiveMarket.symbol,
      baseAsset: effectiveMarket.baseAsset,
      side,
      leverage: effectiveLeverage,
      marginMode,
      size,
      sizeUsdc: notionalUsdc,
      entryPrice,
      markPrice: entryPrice,
      liqPrice,
      margin: marginAmount,
      tpPrice,
      slPrice,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      createdAt: Date.now(),
      isDemo,
    };

    setPositions(prev => [newPosition, ...prev]);

    // Send toast notification
    setNotifications(prev => [
      {
        id: 'pos-open-' + Date.now(),
        title: `${isDemo ? '[DEMO] ' : ''}${side.toUpperCase()} Position Opened (${effectiveLeverage}x)`,
        message: `${effectiveLeverage}x ${effectiveMarket.symbol} | Size: $${notionalUsdc.toLocaleString(undefined, { maximumFractionDigits: 2 })} at $${entryPrice.toLocaleString()}`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true, positionId: newPosition.id };
  }, [availableBalance, tradingMode, markets]);

  // Close an active position - Demo PnL applies ONLY to Demo balance; Live PnL applies ONLY to Live balance
  const closePosition = useCallback((positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return { success: false, realizedPnl: 0 };

    const realizedPnl = Math.round(position.unrealizedPnl * 100) / 100;
    const isDemo = Boolean(position.isDemo);

    if (isDemo) {
      // 1a. Update ONLY Demo Balance (Live/Real balance stays untouched)
      setDemoBalance(prev => {
        const next = Math.max(0, Math.round((prev + realizedPnl) * 100) / 100);
        try { localStorage.setItem('nexora_demo_balance', next.toString()); } catch {}
        return next;
      });

      // Persist Demo balance on user record without altering real user.balance
      if (currentUser?.id) {
        setRegisteredUsers(prev => {
          const updated = prev.map(u => {
            if (u.id === currentUser.id) {
              const curDemo = u.demoBalance !== undefined ? u.demoBalance : demoBalance;
              const nextDemo = Math.max(0, Math.round((curDemo + realizedPnl) * 100) / 100);
              return { ...u, demoBalance: nextDemo };
            }
            return u;
          });
          try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
          return updated;
        });

        setCurrentUser(prevUser => {
          if (!prevUser) return prevUser;
          const curDemo = prevUser.demoBalance !== undefined ? prevUser.demoBalance : demoBalance;
          const nextDemo = Math.max(0, Math.round((curDemo + realizedPnl) * 100) / 100);
          const updatedUser = { ...prevUser, demoBalance: nextDemo };
          try { localStorage.setItem('nexora_current_user', JSON.stringify(updatedUser)); } catch {}
          return updatedUser;
        });
      }
    } else {
      // 1b. Update ONLY Live Balance & Real Token Balances (Demo balance stays untouched)
      setLiveBalance(prev => {
        const next = Math.max(0, Math.round((prev + realizedPnl) * 100) / 100);
        try { localStorage.setItem('nexora_live_balance', next.toString()); } catch {}
        return next;
      });

      setTokenBalances(prev => {
        const curUsdc = prev.USDC ?? liveBalance;
        const nextUsdc = Math.max(0, Math.round((curUsdc + realizedPnl) * 100) / 100);
        const updated = { ...prev, USDC: nextUsdc };
        try { localStorage.setItem('nexora_token_balances', JSON.stringify(updated)); } catch {}
        return updated;
      });

      if (currentUser?.id) {
        setRegisteredUsers(prev => {
          const updated = prev.map(u => {
            if (u.id === currentUser.id) {
              const currentBal = u.balance !== undefined ? u.balance : 0.00;
              const nextBal = Math.max(0, Math.round((currentBal + realizedPnl) * 100) / 100);
              return { ...u, balance: nextBal };
            }
            return u;
          });
          try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
          return updated;
        });

        setCurrentUser(prevUser => {
          if (!prevUser) return prevUser;
          const currentBal = prevUser.balance !== undefined ? prevUser.balance : 0.00;
          const nextBal = Math.max(0, Math.round((currentBal + realizedPnl) * 100) / 100);
          const updatedUser = { ...prevUser, balance: nextBal };
          try { localStorage.setItem('nexora_current_user', JSON.stringify(updatedUser)); } catch {}
          return updatedUser;
        });
      }
    }

    // Remove from active positions
    setPositions(prev => prev.filter(p => p.id !== positionId));

    // Record into closed trades history
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newClosedTrade: ClosedTrade = {
      id: 'trade-' + Date.now(),
      marketId: position.marketId,
      symbol: position.symbol,
      side: position.side,
      leverage: position.leverage,
      entryPrice: position.entryPrice,
      exitPrice: position.markPrice,
      size: position.size,
      sizeUsdc: position.sizeUsdc,
      pnl: realizedPnl,
      pnlPercent: position.unrealizedPnlPercent,
      closedAt: Date.now(),
      dateString,
      isDemo,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
    };

    // Record into Demo history ONLY (never Profit Calendar) vs Live closedTrades
    if (isDemo) {
      setDemoClosedTrades(prev => {
        const updated = [newClosedTrade, ...prev];
        try { localStorage.setItem('nexora_demo_closed_trades', JSON.stringify(updated)); } catch {}
        return updated;
      });
    } else {
      setClosedTrades(prev => {
        const updated = [newClosedTrade, ...prev];
        try { localStorage.setItem('nexora_closed_trades', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }

    // Record into Live Portfolio Transactions ONLY for Live/Real trades
    if (!isDemo) {
      const pnlTx: PortfolioTransaction = {
        id: 'tx-pnl-' + Date.now(),
        type: realizedPnl >= 0 ? 'deposit' : 'withdraw',
        title: `${position.symbol} ${position.side.toUpperCase()} Closed`,
        description: `Closed ${position.side.toUpperCase()} ${position.symbol} ${position.leverage}x with ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)} Live PnL`,
        asset: 'USDC',
        amount: Math.abs(realizedPnl),
        usdValue: Math.abs(realizedPnl),
        status: 'completed',
        txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...close',
        timestamp: Date.now(),
        details: {
          fromAsset: position.symbol,
          toAsset: 'USDC',
          fromAmount: position.size,
          toAmount: Math.abs(realizedPnl),
        }
      };
      setPortfolioTransactions(prev => [pnlTx, ...prev]);
    }

    // Send notification
    setNotifications(prev => [
      {
        id: 'pos-close-' + Date.now(),
        title: `${isDemo ? '[DEMO] ' : ''}Closed ${position.side.toUpperCase()} ${position.symbol}`,
        message: isDemo
          ? `Demo PnL: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)} (${position.unrealizedPnlPercent >= 0 ? '+' : ''}${position.unrealizedPnlPercent.toFixed(2)}%) applied to virtual Demo balance only.`
          : `Live PnL: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)} (${position.unrealizedPnlPercent >= 0 ? '+' : ''}${position.unrealizedPnlPercent.toFixed(2)}%) applied to Real balance.`,
        type: realizedPnl >= 0 ? 'success' : 'warning',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true, realizedPnl };
  }, [positions, currentUser]);

  const updateTpSl = useCallback((positionId: string, tpPrice?: number, slPrice?: number) => {
    setPositions(prev => prev.map(p => {
      if (p.id === positionId) {
        return { ...p, tpPrice, slPrice };
      }
      return p;
    }));

    setNotifications(prev => [
      {
        id: 'tpsl-' + Date.now(),
        title: 'TP/SL Updated',
        message: `Updated trigger orders: TP ${tpPrice ? '$' + tpPrice : 'None'} | SL ${slPrice ? '$' + slPrice : 'None'}`,
        type: 'info',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || fallback || key;
  }, [language]);

  const updateEmail = useCallback((newEmail: string) => {
    const trimmed = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { success: false, error: t('invalidEmail') };
    }
    if (
      trimmed === SUPERADMIN_EMAIL.toLowerCase() &&
      currentUser?.email.trim().toLowerCase() !== SUPERADMIN_EMAIL.toLowerCase()
    ) {
      return { success: false, error: t('invalidEmail') };
    }
    setUserEmail(trimmed);
    setNotifications(prev => [
      {
        id: 'email-' + Date.now(),
        title: t('emailUpdated'),
        message: `${t('currentEmail')}: ${trimmed}`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    return { success: true };
  }, [t, currentUser]);

  const updatePassword = useCallback((oldPass: string, newPass: string, confirmPass: string) => {
    if (currentUser?.password && oldPass !== currentUser.password) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (newPass.length < 6) {
      return { success: false, error: t('passwordTooShort') };
    }
    if (newPass !== confirmPass) {
      return { success: false, error: t('passwordMismatch') };
    }
    if (currentUser) {
      const updatedUser = { ...currentUser, password: newPass };
      setCurrentUser(updatedUser);
      setRegisteredUsers(prev => prev.map(u => (u.id === currentUser.id ? { ...u, password: newPass } : u)));
    }
    setNotifications(prev => [
      {
        id: 'pwd-' + Date.now(),
        title: t('passwordUpdated'),
        message: 'Security credentials have been updated for your account.',
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    return { success: true };
  }, [t, currentUser]);

  // Registration & User Auth methods
  const registerUser = useCallback((params: {
    username: string;
    fullName?: string;
    email: string;
    password?: string;
    referralCode?: string;
    authMethod?: 'email' | 'wallet' | 'google' | 'apple' | 'passkey' | 'facebook';
    walletAddress?: string;
  }) => {
    const cleanUsername = params.username.trim();
    const cleanEmail = params.email.trim().toLowerCase();

    // Check existing username
    if (registeredUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, error: 'Username is already taken. Please choose another.' };
    }

    // Check existing email
    if (registeredUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const newId = 'NX-' + Math.floor(10000 + Math.random() * 90000);
    const isSuperAdminEmail = SUPERADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail);
    const hasVipReferral = params.referralCode && (params.referralCode.toUpperCase() === 'NX-VIP' || params.referralCode.toUpperCase().startsWith('NX-'));
    const wallet = params.walletAddress || `0x${Math.random().toString(16).substring(2, 6).toUpperCase()}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`;

    const zeroTokens: Record<string, number> = { ...ZERO_TOKEN_BALANCES };

    const initialLiveBal = isSuperAdminEmail ? 10000.00 : 0.00;
    const initialDemoBal = 10000.00;

    const newUser: RegisteredUser = {
      id: newId,
      username: cleanUsername,
      fullName: params.fullName?.trim() || cleanUsername,
      email: cleanEmail,
      password: params.password,
      registeredAt: new Date().toISOString().split('T')[0],
      vipTier: isSuperAdminEmail ? 'VIP 3' : (hasVipReferral ? 'VIP 2' : 'VIP 1'),
      makerFeeDiscount: 100, // 0% maker fee
      takerFeeRate: isSuperAdminEmail ? 0.015 : (hasVipReferral ? 0.015 : 0.02),
      authMethod: params.authMethod || 'email',
      walletAddress: wallet,
      isEmailVerified: true,
      twoFactorEnabled: false,
      referralCodeUsed: params.referralCode,
      myReferralCode: newId,
      balance: initialLiveBal,
      demoBalance: initialDemoBal,
      tokenBalances: { ...zeroTokens, USDC: initialLiveBal },
      role: isSuperAdminEmail ? 'admin' : 'user',
    };

    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setUserEmail(cleanEmail);
    setWalletAddress(wallet);
    setIsConnected(true);
    setLiveBalance(initialLiveBal);
    setDemoBalance(initialDemoBal);
    setPositions([]);
    setOrders([]);
    setPortfolioTransactions([]);
    setTokenBalances({ ...zeroTokens, USDC: initialLiveBal });

    try {
      localStorage.setItem('nexora_registered_users', JSON.stringify(updated));
      localStorage.setItem('nexora_current_user', JSON.stringify(newUser));
      localStorage.setItem('nexora_is_logged_in', 'true');
      localStorage.setItem('nexora_live_balance', initialLiveBal.toString());
      localStorage.setItem('nexora_demo_balance', initialDemoBal.toString());
      localStorage.setItem('nexora_token_balances', JSON.stringify({ ...zeroTokens, USDC: initialLiveBal }));
      localStorage.setItem('nexora_active_positions', JSON.stringify([]));
      localStorage.setItem('nexora_portfolio_txs', JSON.stringify([]));
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }

    setNotifications(prev => [
      {
        id: 'reg-' + Date.now(),
        title: isSuperAdminEmail ? 'SuperAdmin Account Activated!' : 'Registration Successful!',
        message: isSuperAdminEmail
          ? `Welcome SuperAdmin @${cleanUsername}! Full system privileges granted.`
          : `Welcome @${cleanUsername}! Account ${newId} created with ${newUser.vipTier} (0% Maker Fees), $${initialLiveBal.toFixed(2)} Real balance & $10,000.00 Demo balance.`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true, user: newUser };
  }, [registeredUsers]);

  const loginUser = useCallback((params: { emailOrUsername: string; password?: string }) => {
    const ident = params.emailOrUsername.trim().toLowerCase();
    let found = registeredUsers.find(
      u => u.email.trim().toLowerCase() === ident || u.username.trim().toLowerCase() === ident
    );

    if (!found) {
      if (ident.includes('@')) {
        return registerUser({
          username: ident.split('@')[0],
          email: ident,
          password: params.password,
        });
      }
      return { success: false, error: 'No account found with this email or username. Please create an account.' };
    }

    if (found.password && params.password !== undefined && found.password !== params.password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    if (found!.email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
      found = { ...found, role: 'admin', vipTier: 'VIP 3' };
    } else {
      found = { ...found, role: 'user' };
    }

    setCurrentUser(found);
    setIsLoggedIn(true);
    setUserEmail(found.email);
    setWalletAddress(found.walletAddress);
    setIsConnected(true);

    const targetLiveBal = found.balance !== undefined ? found.balance : 0.00;
    const targetDemoBal = found.demoBalance !== undefined ? found.demoBalance : 10000.00;
    setLiveBalance(targetLiveBal);
    setDemoBalance(targetDemoBal);

    if (found.tokenBalances) {
      const userTokens = { ...found.tokenBalances, USDC: targetLiveBal };
      setTokenBalances(userTokens);
      try { localStorage.setItem('nexora_token_balances', JSON.stringify(userTokens)); } catch {}
    } else if (targetLiveBal === 0) {
      const zeroTokens: Record<string, number> = { ...ZERO_TOKEN_BALANCES };
      setTokenBalances(zeroTokens);
      try { localStorage.setItem('nexora_token_balances', JSON.stringify(zeroTokens)); } catch {}
    } else {
      setTokenBalances(prev => {
        const updated = { ...prev, USDC: targetLiveBal };
        try { localStorage.setItem('nexora_token_balances', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }

    try {
      localStorage.setItem('nexora_current_user', JSON.stringify(found));
      localStorage.setItem('nexora_is_logged_in', 'true');
      localStorage.setItem('nexora_live_balance', targetLiveBal.toString());
      localStorage.setItem('nexora_demo_balance', targetDemoBal.toString());
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }

    const isUserSuperAdmin = SUPERADMIN_EMAILS.some(e => e.toLowerCase() === found!.email.trim().toLowerCase());

    setNotifications(prev => [
      {
        id: 'login-' + Date.now(),
        title: isUserSuperAdmin ? 'SuperAdmin Verified' : 'Signed In',
        message: isUserSuperAdmin
          ? `Welcome back SuperAdmin ${found!.username}! System administration unlocked.`
          : `Welcome back, ${found!.username} (${found!.id})!`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true, user: found };
  }, [registeredUsers, registerUser]);

  const logoutUser = useCallback(() => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('nexora_is_logged_in', 'false');
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }

    setNotifications(prev => [
      {
        id: 'logout-' + Date.now(),
        title: 'Logged Out',
        message: 'You have been disconnected from the trading terminal.',
        type: 'info',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const switchUser = useCallback((userId: string) => {
    let found = registeredUsers.find(u => u.id === userId);
    if (found) {
      if (found!.email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
        found = { ...found, role: 'admin', vipTier: 'VIP 3' };
      } else {
        found = { ...found, role: 'user' };
      }
      setCurrentUser(found);
      setIsLoggedIn(true);
      setUserEmail(found.email);
      setWalletAddress(found.walletAddress);
      setIsConnected(true);

      const targetLiveBal = found.balance !== undefined ? found.balance : 0.00;
      const targetDemoBal = found.demoBalance !== undefined ? found.demoBalance : 10000.00;
      setLiveBalance(targetLiveBal);
      setDemoBalance(targetDemoBal);

      if (found.tokenBalances) {
        const userTokens = { ...found.tokenBalances, USDC: targetLiveBal };
        setTokenBalances(userTokens);
        try { localStorage.setItem('nexora_token_balances', JSON.stringify(userTokens)); } catch {}
      } else if (targetLiveBal === 0) {
        const zeroTokens: Record<string, number> = { ...ZERO_TOKEN_BALANCES };
        setTokenBalances(zeroTokens);
        try { localStorage.setItem('nexora_token_balances', JSON.stringify(zeroTokens)); } catch {}
      } else {
        setTokenBalances(prev => {
          const updated = { ...prev, USDC: targetLiveBal };
          try { localStorage.setItem('nexora_token_balances', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }

      try {
        localStorage.setItem('nexora_current_user', JSON.stringify(found));
        localStorage.setItem('nexora_is_logged_in', 'true');
        localStorage.setItem('nexora_live_balance', targetLiveBal.toString());
        localStorage.setItem('nexora_demo_balance', targetDemoBal.toString());
      } catch (e) {}
    }
  }, [registeredUsers]);

  // ================= SUPERADMIN CAPABILITIES =================
  const isSuperAdminEmail = (emailStr?: string | null) => {
    if (!emailStr) return false;
    return emailStr.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
  };

  const isAdmin = Boolean(
    currentUser && isSuperAdminEmail(currentUser.email)
  );
  const adminEmail = SUPERADMIN_EMAIL;

  const updateUserBalance = useCallback(
    (userId: string, usdcAmount: number, tokenOverrides?: Record<string, number>, forceApplyToActive: boolean = false) => {
      const targetId = userId === 'current' ? (currentUser?.id || 'NX-94718') : userId;

      setRegisteredUsers(prev => {
        const updated = prev.map(u => {
          if (u.id === targetId) {
            return {
              ...u,
              balance: usdcAmount,
              tokenBalances: tokenOverrides ? { ...(u.tokenBalances || {}), ...tokenOverrides } : u.tokenBalances,
            };
          }
          return u;
        });
        try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
        return updated;
      });

      const isTargetingCurrent = Boolean(
        forceApplyToActive ||
        userId === 'current' ||
        (currentUser && currentUser.id === targetId) ||
        (currentUser && registeredUsers.find(u => u.id === targetId)?.email.toLowerCase() === currentUser.email.toLowerCase())
      );

      if (isTargetingCurrent) {
        setLiveBalance(usdcAmount);

        setCurrentUser(prev => {
          if (!prev) return null;
          const updatedUser: RegisteredUser = {
            ...prev,
            balance: usdcAmount,
            tokenBalances: tokenOverrides ? { ...(prev.tokenBalances || {}), ...tokenOverrides } : prev.tokenBalances,
          };
          try {
            localStorage.setItem('nexora_current_user', JSON.stringify(updatedUser));
          } catch {}
          return updatedUser;
        });

        try {
          localStorage.setItem('nexora_live_balance', usdcAmount.toString());
        } catch {}

        setTokenBalances(prev => {
          const updated = {
            ...prev,
            ...(tokenOverrides || {}),
            USDC: usdcAmount,
          };
          try { localStorage.setItem('nexora_token_balances', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }

      setNotifications(prev => [
        {
          id: 'adm-bal-' + Date.now(),
          title: 'Admin Balance Updated',
          message: `Live USDC Balance set to $${usdcAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC`,
          type: 'success',
          timestamp: Date.now(),
        },
        ...prev,
      ]);
      return { success: true };
    },
    [currentUser, registeredUsers]
  );

  const updateUserTrades = useCallback((userId: string, newTrades: ClosedTrade[]) => {
    setClosedTrades(prev => {
      const otherTrades = prev.filter(t => t.userId !== userId);
      const updated = [...newTrades, ...otherTrades];
      try { localStorage.setItem('nexora_closed_trades', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const adminAddTrade = useCallback((userId: string, tradeData: Omit<ClosedTrade, 'id'>) => {
    const targetUser = registeredUsers.find(u => u.id === userId);
    const newTrade: ClosedTrade = {
      ...tradeData,
      id: 'trade-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId,
      userEmail: tradeData.userEmail || targetUser?.email,
      isDemo: Boolean(tradeData.isDemo),
    };
    setClosedTrades(prev => {
      const updated = [newTrade, ...prev];
      try { localStorage.setItem('nexora_closed_trades', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setNotifications(prev => [
      {
        id: 'adm-trade-' + Date.now(),
        title: 'Trade Record Injected',
        message: `${tradeData.side.toUpperCase()} ${tradeData.symbol} (${tradeData.dateString}): ${tradeData.pnl >= 0 ? '+' : ''}$${tradeData.pnl.toFixed(2)}`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    return { success: true, trade: newTrade };
  }, [registeredUsers]);

  const adminEditTrade = useCallback((tradeId: string, updatedFields: Partial<ClosedTrade>) => {
    setClosedTrades(prev => {
      const updated = prev.map(t => {
        if (t.id === tradeId) {
          return { ...t, ...updatedFields };
        }
        return t;
      });
      try { localStorage.setItem('nexora_closed_trades', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return { success: true };
  }, []);

  const adminDeleteTrade = useCallback((tradeId: string) => {
    setClosedTrades(prev => {
      const updated = prev.filter(t => t.id !== tradeId);
      try { localStorage.setItem('nexora_closed_trades', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return { success: true };
  }, []);

  const adminPromoteToMasterTrader = useCallback((userId: string, traderData: Partial<MasterTrader>) => {
    const user = registeredUsers.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    const masterId = traderData.id || user.walletAddress || user.id;

    const newMaster: MasterTrader = {
      id: masterId,
      name: traderData.name || user.fullName || user.username,
      handle: traderData.handle || `@${user.username}`,
      address: user.walletAddress || '0x7F41...b92E',
      shortAddress: user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : user.id,
      verified: traderData.verified !== undefined ? traderData.verified : true,
      avatarColor: traderData.avatarColor || 'from-amber-400 to-rose-600',
      avatarInitials: (traderData.name || user.username).slice(0, 2).toUpperCase(),
      rank: traderData.rank || masterTraders.length + 1,
      bio: traderData.bio || 'Hyperliquid L1 algorithmic HFT scalper & perpetuals specialist.',
      isTopProfitable: traderData.isTopProfitable !== undefined ? traderData.isTopProfitable : true,
      totalPnl: traderData.totalPnl || 68450.00,
      totalPnlPercent: traderData.totalPnlPercent || 94.5,
      winRate: traderData.winRate || 97.3,
      copiersCount: traderData.copiersCount || 3840,
      aum: traderData.aum || 245000.00,
      maxDrawdown: traderData.maxDrawdown || 0.00,
      profitSharePercent: traderData.profitSharePercent || 10,
      sharpeRatio: traderData.sharpeRatio || 4.52,
      bias: traderData.bias || 'Bullish',
      volume30d: traderData.volume30d || '$112.5M',
      aumFormatted: traderData.aumFormatted || '$245.0K',
      avgTradesPerDay: traderData.avgTradesPerDay || 48.5,
      winRate30d: traderData.winRate30d || 97.3,
      maxDrawdown30d: traderData.maxDrawdown30d || 0.00,
      lead30dPnlPercent: traderData.lead30dPnlPercent || 94.5,
      lead30dPnlAmount: traderData.lead30dPnlAmount || 68450,
      sparkline: traderData.sparkline || [20, 24, 30, 38, 45, 52, 60, 68, 74, 82, 88, 94.5],
      perpsTotalValue: traderData.perpsTotalValue || 245000.00,
      unrealizedPnl: traderData.unrealizedPnl || 2310.00,
      unrealizedPnlPercent: traderData.unrealizedPnlPercent || 1.15,
      marginUsed: traderData.marginUsed || 45000.00,
      availableMargin: traderData.availableMargin || 200000.00,
      tradingStylePills: traderData.tradingStylePills || ['Perps', 'HFT', 'Alpha'],
      favToken: traderData.favToken || 'BTC-PERP',
      avgHoldingTime: traderData.avgHoldingTime || '2h 45m',
      leverageRange: traderData.leverageRange || '5x - 50x',
      tags: traderData.tags || ['Verified Master', '#1 30D PnL', 'Zero Drawdown', 'Hyperliquid Native'],
      activeDeals: traderData.activeDeals || [],
      closedDeals: traderData.closedDeals || [],
    };

    setMasterTraders(prev => {
      const filtered = prev.filter(m => m.id !== masterId);
      const updated = [newMaster, ...filtered];
      try { localStorage.setItem('nexora_master_traders', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setRegisteredUsers(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, isMasterTrader: true } : u);
      try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setNotifications(prev => [
      {
        id: 'adm-promote-' + Date.now(),
        title: 'Master Leader Added to Copytrading',
        message: `${newMaster.name} (${newMaster.handle}) is now live on the Copy Trading Board!`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true, trader: newMaster };
  }, [masterTraders, registeredUsers]);

  const adminRemoveMasterTrader = useCallback((traderId: string) => {
    setMasterTraders(prev => {
      const updated = prev.filter(m => m.id !== traderId);
      try { localStorage.setItem('nexora_master_traders', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return { success: true };
  }, []);

  const adminUpdateMasterTrader = useCallback((traderId: string, updatedFields: Partial<MasterTrader>) => {
    setMasterTraders(prev => {
      const updated = prev.map(m => m.id === traderId ? { ...m, ...updatedFields } : m);
      try { localStorage.setItem('nexora_master_traders', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return { success: true };
  }, []);

  const adminCreateUser = useCallback((userParams: Partial<RegisteredUser>) => {
    const newId = 'NX-' + Math.floor(10000 + Math.random() * 90000);
    const newUser: RegisteredUser = {
      id: newId,
      username: userParams.username || `trader_${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: userParams.fullName || 'Trader Account',
      email: userParams.email || `trader_${newId.toLowerCase()}@nexora.dex`,
      registeredAt: new Date().toISOString().split('T')[0],
      vipTier: userParams.vipTier || 'VIP 1',
      makerFeeDiscount: 100,
      takerFeeRate: 0.02,
      authMethod: userParams.authMethod || 'email',
      walletAddress: userParams.walletAddress || `0x${Math.random().toString(16).substring(2, 6).toUpperCase()}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
      isEmailVerified: true,
      twoFactorEnabled: false,
      myReferralCode: newId,
      balance: userParams.balance ?? 0.00,
      demoBalance: userParams.demoBalance ?? 10000.00,
      role: (userParams.email || '').trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
    };
    setRegisteredUsers(prev => {
      const updated = [newUser, ...prev];
      try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return { success: true, user: newUser };
  }, []);

  const adminDeleteUser = useCallback((userId: string) => {
    if (userId === 'NX-94718') {
      return { success: false, error: 'Cannot delete primary SuperAdmin account.' };
    }
    setRegisteredUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
      return updated;
    });
    return { success: true };
  }, []);

  // Copytrading Methods
  const copyTraderById = useCallback((traderId: string, margin: number, slPercent = 15) => {
    const rawId = traderId.trim();
    if (!rawId) {
      return { success: false, error: 'Please enter a valid Trader ID (e.g. NX-90421).' };
    }
    if (rawId.toUpperCase() === userTraderProfile.id.toUpperCase()) {
      return { success: false, error: 'You cannot copy your own Trader ID.' };
    }
    if (margin <= 0) {
      return { success: false, error: 'Allocation margin must be greater than 0.' };
    }
    if (margin > liveAvailableBalance) {
      return { success: false, error: `Insufficient available Live balance ($${liveAvailableBalance.toFixed(2)} USDC available).` };
    }
    if (copiedTraders.some(c => c.traderId.toLowerCase() === rawId.toLowerCase())) {
      return { success: false, error: `You are already copying Trader ${rawId}.` };
    }

    const existing = masterTraders.find(t => t.id.toLowerCase() === rawId.toLowerCase());
    const traderName = existing ? existing.name : `Trader ${rawId}`;
    const traderHandle = existing ? existing.handle : `@trader_${rawId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const newRecord: CopiedTraderRecord = {
      traderId: existing ? existing.id : rawId,
      traderName,
      traderHandle,
      allocatedMargin: margin,
      stopLossPercent: slPercent,
      copiedAt: Date.now(),
      status: 'active',
      copiedPnl: 0,
      activeCopiedTradesCount: existing ? existing.activeDeals.length : 2,
    };

    setCopiedTraders(prev => [newRecord, ...prev]);

    if (existing) {
      setMasterTraders(prev => prev.map(m => m.id === existing.id ? { ...m, copiersCount: m.copiersCount + 1 } : m));
    }

    setNotifications(prev => [
      {
        id: 'copy-' + Date.now(),
        title: 'Copy Trading Started',
        message: `Successfully mirrored ${traderName} (${newRecord.traderId}) with $${margin.toFixed(2)} USDC allocation.`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true };
  }, [liveAvailableBalance, copiedTraders, masterTraders, userTraderProfile.id]);

  const stopCopyingTrader = useCallback((traderId: string) => {
    setCopiedTraders(prev => prev.filter(c => c.traderId !== traderId));
    setNotifications(prev => [
      {
        id: 'stop-copy-' + Date.now(),
        title: 'Stopped Copying',
        message: `Released copied position margin back to available balance for Trader ${traderId}.`,
        type: 'info',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const toggleCopiedTraderStatus = useCallback((traderId: string) => {
    setCopiedTraders(prev => prev.map(c => {
      if (c.traderId === traderId) {
        const nextStatus = c.status === 'active' ? 'paused' : 'active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  }, []);

  const toggleMasterTraderMode = useCallback(() => {
    setUserTraderProfile(prev => {
      const nextEnabled = !prev.isMasterTraderEnabled;
      setNotifications(n => [
        {
          id: 'master-' + Date.now(),
          title: nextEnabled ? 'Master Trader Mode Enabled' : 'Master Trader Mode Disabled',
          message: nextEnabled
            ? `Your public Trader ID (${prev.id}) is now open for followers. 10% profit-sharing fee enabled.`
            : 'Copy trading requests for your ID are now paused.',
          type: nextEnabled ? 'success' : 'info',
          timestamp: Date.now(),
        },
        ...n,
      ]);
      return { ...prev, isMasterTraderEnabled: nextEnabled };
    });
  }, []);

  // Real/Live portfolio equity computation (always isolated from Demo balance & Demo positions)
  const livePortfolioValue = React.useMemo(() => {
    let holdingsTotal = 0;
    for (const [sym, balance] of Object.entries(tokenBalances)) {
      if (!balance || balance <= 0) continue;
      if (sym === 'USDC' || sym === 'USDT') {
        holdingsTotal += balance;
      } else {
        const m = markets.find(item => item.baseAsset === sym || item.symbol === `${sym}-USDC` || item.symbol === `${sym}-USDT`);
        const defaultMeta = PORTFOLIO_CRYPTO_LIST.find(c => c.symbol === sym);
        const price = m ? m.price : (defaultMeta ? defaultMeta.defaultPrice : 1.0);
        holdingsTotal += (balance * price);
      }
    }

    const liveUnrealizedPnl = positions
      .filter(p => !p.isDemo)
      .reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);

    return Math.max(0, Number((holdingsTotal + liveUnrealizedPnl).toFixed(2)));
  }, [tokenBalances, markets, positions]);

  // Mode-aware displayed total equity: Demo mode displays Demo balance + Demo PnL; Live mode displays Live Portfolio
  const totalPortfolioValue = React.useMemo(() => {
    if (isDemoMode) {
      const demoUnrealizedPnl = positions
        .filter(p => Boolean(p.isDemo))
        .reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
      return Math.max(0, Number((demoBalance + demoUnrealizedPnl).toFixed(2)));
    }
    return livePortfolioValue;
  }, [isDemoMode, demoBalance, positions, livePortfolioValue]);

  // Helper to update Live balance & sync to user account record (never touches Demo balance)
  const applyLiveUsdcChange = useCallback((delta: number) => {
    setLiveBalance(prev => {
      const next = Math.max(0, Math.round((prev + delta) * 100) / 100);
      try { localStorage.setItem('nexora_live_balance', next.toString()); } catch {}
      if (currentUser?.id) {
        setRegisteredUsers(users => {
          const updated = users.map(u => (u.id === currentUser.id ? { ...u, balance: next } : u));
          try { localStorage.setItem('nexora_registered_users', JSON.stringify(updated)); } catch {}
          return updated;
        });
        setCurrentUser(u => {
          if (!u) return u;
          const upd = { ...u, balance: next };
          try { localStorage.setItem('nexora_current_user', JSON.stringify(upd)); } catch {}
          return upd;
        });
      }
      return next;
    });
  }, [currentUser?.id]);

  // Deposit tokens (supports simulated on-chain verification failure)
  const depositTokens = useCallback((asset: string, amount: number, network: string, fail: boolean = true) => {
    if (amount <= 0) {
      return { success: false, error: 'Deposit amount must be greater than zero.' };
    }

    if (fail) {
      const failedTx: PortfolioTransaction = {
        id: 'tx-dep-failed-' + Date.now(),
        type: 'deposit',
        title: `Failed Deposit ${asset}`,
        description: `Deposit failed on ${network} - No incoming transaction detected`,
        asset,
        amount,
        usdValue: amount,
        status: 'failed',
        txHash: '0x' + Math.random().toString(16).substring(2, 10) + '... (Reverted)',
        timestamp: Date.now(),
        details: { network, failureReason: 'Transaction not found on chain or reverted by RPC' },
      };
      setPortfolioTransactions(prev => [failedTx, ...prev]);

      setNotifications(prev => [
        {
          id: 'dep-fail-' + Date.now(),
          title: 'Deposit Failed',
          message: `Deposit of ${amount} ${asset} on ${network} failed. No incoming tx verified on-chain.`,
          type: 'error',
          timestamp: Date.now(),
        },
        ...prev,
      ]);

      return {
        success: false,
        error: `Deposit Failed: No incoming on-chain transfer of ${amount} ${asset} detected on ${network}. Please send funds to the deposit address first.`
      };
    }

    setTokenBalances(prev => {
      const updated = {
        ...prev,
        [asset]: (prev[asset] || 0) + amount,
      };
      try { localStorage.setItem('nexora_token_balances', JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (asset === 'USDC') {
      applyLiveUsdcChange(amount);
    }

    const tx: PortfolioTransaction = {
      id: 'tx-dep-' + Date.now(),
      type: 'deposit',
      title: `Deposit ${asset}`,
      description: `Deposited ${amount} ${asset} via ${network}`,
      asset,
      amount,
      usdValue: amount,
      status: 'completed',
      txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6),
      timestamp: Date.now(),
      details: { network }
    };
    setPortfolioTransactions(prev => [tx, ...prev]);

    setNotifications(prev => [
      {
        id: 'dep-' + Date.now(),
        title: 'Deposit Confirmed',
        message: `+${amount.toLocaleString()} ${asset} credited via ${network}.`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    return { success: true };
  }, [applyLiveUsdcChange]);

  // Withdraw tokens (strictly uses Live balances)
  const withdrawTokens = useCallback((asset: string, amount: number, address: string, network: string) => {
    if (!address.trim()) {
      return { success: false, error: 'Please enter a valid recipient address.' };
    }
    const curBal = tokenBalances[asset] || 0;
    if (amount <= 0 || amount > curBal) {
      return { success: false, error: `Insufficient ${asset} balance (Available: ${curBal} ${asset}).` };
    }
    if (asset === 'USDC' && amount > liveAvailableBalance) {
      return { success: false, error: `Cannot withdraw margin locked in active Live positions ($${liveAvailableBalance.toFixed(2)} USDC available).` };
    }

    setTokenBalances(prev => {
      const updated = {
        ...prev,
        [asset]: Math.max(0, (prev[asset] || 0) - amount),
      };
      try { localStorage.setItem('nexora_token_balances', JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (asset === 'USDC') {
      applyLiveUsdcChange(-amount);
    }

    const tx: PortfolioTransaction = {
      id: 'tx-wd-' + Date.now(),
      type: 'withdraw',
      title: `Withdraw ${asset}`,
      description: `Transferred ${amount} ${asset} to ${address.slice(0, 6)}...${address.slice(-4)} via ${network}`,
      asset,
      amount,
      usdValue: amount,
      status: 'completed',
      txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6),
      timestamp: Date.now(),
      details: { destinationAddress: address, network }
    };
    setPortfolioTransactions(prev => [tx, ...prev]);

    setNotifications(prev => [
      {
        id: 'wd-' + Date.now(),
        title: 'Withdrawal Broadcasted',
        message: `Successfully transferred ${amount} ${asset} to ${address.slice(0, 6)}...${address.slice(-4)}.`,
        type: 'info',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    return { success: true };
  }, [tokenBalances, liveAvailableBalance, applyLiveUsdcChange]);

  // Swap tokens with 0 commission bonus (strictly uses Live balances)
  const swapTokens = useCallback((fromAsset: string, toAsset: string, fromAmount: number) => {
    if (fromAsset === toAsset) {
      return { success: false, error: 'Cannot swap the same asset.' };
    }
    const curFromBal = tokenBalances[fromAsset] || 0;
    if (fromAmount <= 0 || fromAmount > curFromBal) {
      return { success: false, error: `Insufficient ${fromAsset} balance (Available: ${curFromBal}).` };
    }
    if (fromAsset === 'USDC' && fromAmount > liveAvailableBalance) {
      return { success: false, error: `Cannot swap margin locked in Live positions ($${liveAvailableBalance.toFixed(2)} available).` };
    }

    const getAssetPrice = (sym: string): number => {
      if (sym === 'USDC' || sym === 'USDT') return 1.0;
      const found = markets.find(m => m.baseAsset === sym || m.symbol === `${sym}-USDC` || m.symbol === `${sym}-USDT`);
      return found ? found.price : 1.0;
    };

    const fromPrice = getAssetPrice(fromAsset);
    const toPrice = getAssetPrice(toAsset);
    const fromValueUsd = fromAmount * fromPrice;
    const toAmount = fromValueUsd / toPrice;

    setTokenBalances(prev => {
      const updated = {
        ...prev,
        [fromAsset]: Math.max(0, (prev[fromAsset] || 0) - fromAmount),
        [toAsset]: (prev[toAsset] || 0) + toAmount,
      };
      try { localStorage.setItem('nexora_token_balances', JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (fromAsset === 'USDC') {
      applyLiveUsdcChange(-fromAmount);
    } else if (toAsset === 'USDC') {
      applyLiveUsdcChange(toAmount);
    }

    const tx: PortfolioTransaction = {
      id: 'tx-swap-' + Date.now(),
      type: 'swap',
      title: `Swap: ${fromAsset} → ${toAsset}`,
      description: `Swapped ${fromAmount} ${fromAsset} to ${toAmount.toFixed(4)} ${toAsset}`,
      asset: toAsset,
      amount: toAmount,
      usdValue: fromValueUsd,
      status: 'completed',
      txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...swap',
      timestamp: Date.now(),
      details: {
        fromAsset,
        toAsset,
        fromAmount,
        toAmount,
      }
    };
    setPortfolioTransactions(prev => [tx, ...prev]);

    setNotifications(prev => [
      {
        id: 'swap-' + Date.now(),
        title: 'Swap Completed',
        message: `Swapped ${fromAmount} ${fromAsset} to ${toAmount.toFixed(4)} ${toAsset}.`,
        type: 'success',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true, toAmount };
  }, [tokenBalances, liveAvailableBalance, markets, applyLiveUsdcChange]);

  return (
    <TradingContext.Provider
      value={{
        theme,
        setTheme,
        candleColors,
        setCandleColors,
        buyButtonColor,
        setBuyButtonColor,
        hideFlag,
        setHideFlag,
        layoutDensity,
        setLayoutDensity,
        soundEnabled,
        setSoundEnabled,
        playAudioFeedback,
        oneClickTrading,
        setOneClickTrading,
        slippageTolerance,
        setSlippageTolerance,
        defaultMarginMode,
        setDefaultMarginMode,
        fiatCurrency,
        setFiatCurrency,
        priceFlashEnabled,
        setPriceFlashEnabled,
        autoHideBalances,
        setAutoHideBalances,
        selectedRpcNetwork,
        setSelectedRpcNetwork,
        defaultOrderLeverage,
        setDefaultOrderLeverage,
        markets,
        selectedMarket,
        setSelectedMarket: (m) => setSelectedMarketId(m.id),
        positions,
        orders,
        closedTrades,
        demoClosedTrades,
        walletBalance,
        availableBalance,
        isConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
        faucetDeposit,
        resetDemoAccount,
        openPosition,
        closePosition,
        updateTpSl,
        cancelOrder,
        notifications,
        dismissNotification,
        lastPriceFlash,
        toggleFavorite,
        favorites,
        // Copytrading
        userTraderId: userTraderProfile.id,
        masterTraders,
        copiedTraders,
        copyTraderById,
        stopCopyingTrader,
        toggleCopiedTraderStatus,
        userTraderProfile,
        toggleMasterTraderMode,
        // Portfolio
        tokenBalances,
        portfolioTransactions,
        totalPortfolioValue,
        livePortfolioValue,
        depositTokens,
        withdrawTokens,
        swapTokens,
        // Language & Account
        language,
        setLanguage,
        t,
        userEmail,
        updateEmail,
        updatePassword,
        // Auth & Registration
        currentUser,
        isRegistered: Boolean(currentUser),
        isLoggedIn,
        registeredUsers,
        registerUser,
        loginUser,
        logoutUser,
        switchUser,
        // SuperAdmin Capabilities
        isAdmin,
        adminEmail,
        updateUserBalance,
        updateUserTrades,
        adminAddTrade,
        adminEditTrade,
        adminDeleteTrade,
        adminPromoteToMasterTrader,
        adminRemoveMasterTrader,
        adminUpdateMasterTrader,
        adminCreateUser,
        adminDeleteUser,
        // Trading Mode (Live vs Demo)
        tradingMode,
        isDemoMode,
        setTradingMode,
        toggleTradingMode,
        demoBalance,
        liveBalance,
        resetDemoBalance,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
