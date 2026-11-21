import { Candle, OrderBookEntry, MarketTrade } from '../types/market';

/**
 * Format currency with appropriate decimals
 */
export function formatPrice(price: number, precision: number = 2): string {
  if (price === 0) return '$0.00';
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', {
      minimumFractionDigits: Math.min(precision, 2),
      maximumFractionDigits: Math.max(precision, 2)
    });
  }
  if (price < 0.01) {
    return '$' + price.toFixed(Math.max(precision, 5));
  }
  return '$' + price.toFixed(precision);
}

/**
 * Format numbers with compact letters (e.g. $1.42B, $48.2M)
 */
export function formatCompactUsd(amount: number): string {
  if (amount >= 1e9) {
    return '$' + (amount / 1e9).toFixed(2) + 'B';
  }
  if (amount >= 1e6) {
    return '$' + (amount / 1e6).toFixed(2) + 'M';
  }
  if (amount >= 1e3) {
    return '$' + (amount / 1e3).toFixed(2) + 'K';
  }
  return '$' + amount.toFixed(2);
}

/**
 * Calculate liquidation price for long/short with maintenance margin buffer
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  side: 'long' | 'short',
  leverage: number,
  maintenanceMarginRate: number = 0.02
): number {
  if (leverage <= 1) return 0;
  
  if (side === 'long') {
    // Liq = Entry * (1 - (1/Leverage) + MMR)
    const liq = entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
    return Math.max(0, liq);
  } else {
    // Liq = Entry * (1 + (1/Leverage) - MMR)
    const liq = entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
    return liq;
  }
}

/**
 * Generate realistic historical candles around a base price
 */
export function generateCandles(currentPrice: number, timeframe: string = '15m', count: number = 60): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  
  let intervalMs = 15 * 60 * 1000;
  if (timeframe === '1m') intervalMs = 60 * 1000;
  else if (timeframe === '5m') intervalMs = 5 * 60 * 1000;
  else if (timeframe === '15m') intervalMs = 15 * 60 * 1000;
  else if (timeframe === '1h') intervalMs = 60 * 60 * 1000;
  else if (timeframe === '4h') intervalMs = 4 * 60 * 60 * 1000;
  else if (timeframe === '1D') intervalMs = 24 * 60 * 60 * 1000;
  else if (timeframe === '1W') intervalMs = 7 * 24 * 60 * 60 * 1000;

  // Volatility coefficient depending on price scale
  const volatility = currentPrice * 0.0035;

  let lastClose = currentPrice * (1 - 0.02 + Math.random() * 0.01);
  const startTime = now - count * intervalMs;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalMs;
    // Bias towards currentPrice as we approach index count - 1
    const target = currentPrice;
    const progress = i / count;
    const pull = (target - lastClose) * (0.05 + progress * 0.1);
    
    const change = (Math.random() - 0.49) * volatility + pull;
    const open = lastClose;
    let close = open + change;
    if (i === count - 1) {
      close = currentPrice; // exact match on latest candle
    }
    
    const wick1 = Math.random() * volatility * 0.8;
    const wick2 = Math.random() * volatility * 0.8;
    const high = Math.max(open, close) + wick1;
    const low = Math.min(open, close) - wick2;
    const volume = Math.floor((currentPrice * (10 + Math.random() * 50)) * (0.8 + Math.random() * 0.6));

    candles.push({
      time,
      open,
      high,
      low: Math.max(low, high * 0.001),
      close,
      volume,
    });

    lastClose = close;
  }

  return candles;
}

/**
 * Generate realistic simulated order book bids & asks
 */
export function generateOrderBook(midPrice: number, depth: number = 8): { bids: OrderBookEntry[]; asks: OrderBookEntry[]; spread: number; spreadPercent: number } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  
  const tickSize = midPrice * 0.0003;
  let bidAccum = 0;
  let askAccum = 0;

  for (let i = 1; i <= depth; i++) {
    const askPrice = midPrice + i * tickSize * (1 + Math.random() * 0.2);
    const askSize = (midPrice > 1000 ? 0.2 : 50) * (1 + Math.random() * 1.5) * (1 + i * 0.15);
    askAccum += askSize;
    asks.push({
      price: askPrice,
      size: askSize,
      total: askAccum,
    });

    const bidPrice = midPrice - i * tickSize * (1 + Math.random() * 0.2);
    const bidSize = (midPrice > 1000 ? 0.2 : 50) * (1 + Math.random() * 1.5) * (1 + i * 0.15);
    bidAccum += bidSize;
    bids.push({
      price: bidPrice,
      size: bidSize,
      total: bidAccum,
    });
  }

  const bestAsk = asks[0]?.price || midPrice;
  const bestBid = bids[0]?.price || midPrice;
  const spread = Math.max(0.0001, bestAsk - bestBid);
  const spreadPercent = (spread / midPrice) * 100;

  return { bids, asks: asks.reverse(), spread, spreadPercent };
}

/**
 * Generate simulated recent trades
 */
export function generateRecentTrades(midPrice: number, count: number = 10): MarketTrade[] {
  const trades: MarketTrade[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const isBuy = Math.random() > 0.48;
    const offset = (Math.random() - 0.5) * (midPrice * 0.0008);
    const price = midPrice + offset;
    const size = (midPrice > 1000 ? 0.05 + Math.random() * 0.8 : 20 + Math.random() * 250);
    const time = new Date(now - i * (2000 + Math.random() * 3000)).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    trades.push({
      id: 'trade-' + (now - i * 1000),
      price,
      size,
      side: isBuy ? 'buy' : 'sell',
      time,
    });
  }

  return trades;
}
