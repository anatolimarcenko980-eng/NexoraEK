export type MarketCategory = 'perps' | 'stocks' | 'indices' | 'commodities' | 'spot';

export interface Market {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  name: string;
  category: MarketCategory;
  price: number;
  change24h: number; // percentage, e.g. +4.25
  high24h: number;
  low24h: number;
  volume24h: number; // in USD
  fundingRate?: number; // per 8h, e.g. 0.0001 = 0.01%
  openInterest?: number; // in USD
  leverageMax: number; // e.g. 50
  precision: number; // decimal places for price
  sizePrecision: number; // decimal places for size
  isHot?: boolean;
  isFavorite?: boolean;
}

export type PositionSide = 'long' | 'short';
export type MarginMode = 'cross' | 'isolated';
export type OrderType = 'market' | 'limit' | 'stop_market' | 'tp_sl';

export interface Position {
  id: string;
  marketId: string;
  symbol: string;
  baseAsset: string;
  side: PositionSide;
  leverage: number;
  marginMode: MarginMode;
  size: number; // in base asset units
  sizeUsdc: number; // size * entryPrice
  entryPrice: number;
  markPrice: number;
  liqPrice: number;
  margin: number; // initial margin allocated
  tpPrice?: number;
  slPrice?: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  createdAt: number;
  isDemo?: boolean;
}

export interface Order {
  id: string;
  marketId: string;
  symbol: string;
  side: PositionSide;
  type: OrderType;
  leverage: number;
  size: number;
  price?: number;
  triggerPrice?: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: number;
}

export interface MarketTrade {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  time: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface ClosedTrade {
  id: string;
  userId?: string;
  userEmail?: string;
  marketId: string;
  symbol: string;
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  size: number;
  sizeUsdc: number;
  pnl: number;
  pnlPercent: number;
  closedAt: number;
  dateString: string; // YYYY-MM-DD
  isDemo?: boolean;
}

export interface DayPnL {
  date: string; // YYYY-MM-DD
  day: number;
  pnl: number;
  tradesCount: number;
  volume: number;
  winCount: number;
  lossCount: number;
  trades: ClosedTrade[];
}
