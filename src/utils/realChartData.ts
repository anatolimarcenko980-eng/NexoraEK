import { UTCTimestamp } from 'lightweight-charts';
import { Market } from '../types/market';

export interface RealCandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface RealVolumeData {
  time: UTCTimestamp;
  value: number;
  color: string;
}

export interface RealLineData {
  time: UTCTimestamp;
  value: number;
}

// Map DEX symbols to Binance pairs where available
const BINANCE_PAIR_MAP: Record<string, string> = {
  'BTC-USDC': 'BTCUSDT',
  'ETH-USDC': 'ETHUSDT',
  'SOL-USDC': 'SOLUSDT',
  'XRP-USDC': 'XRPUSDT',
  'DOGE-USDC': 'DOGEUSDT',
  'SUI-USDC': 'SUIUSDT',
  'BNB-USDC': 'BNBUSDT',
  'LINK-USDC': 'LINKUSDT',
  'AVAX-USDC': 'AVAXUSDT',
  'AAVE-USDC': 'AAVEUSDT',
  'NEAR-USDC': 'NEARUSDT',
  'ADA-USDC': 'ADAUSDT',
  'WIF-USDC': 'WIFUSDT',
  'ZEC-USDC': 'ZECUSDT',
  'XMR-USDC': 'XMRUSDT',
  'UNI-USDC': 'UNIUSDT',
  'ARB-USDC': 'ARBUSDT',
  'OP-USDC': 'OPUSDT',
  'INJ-USDC': 'INJUSDT',
  'TIA-USDC': 'TIAUSDT',
  'RENDER-USDC': 'RENDERUSDT',
  'FET-USDC': 'FETUSDT',
  'ONDO-USDC': 'ONDOUSDT',
  'LTC-USDC': 'LTCUSDT',
  'BCH-USDC': 'BCHUSDT',
  'PAXG-USDC': 'PAXGUSDT',
  'ENA-USDC': 'ENAUSDT',
  'WLD-USDC': 'WLDUSDT',
  'JUP-USDC': 'JUPUSDT',
  'DOT-USDC': 'DOTUSDT',
  'APT-USDC': 'APTUSDT',
  'ATOM-USDC': 'ATOMUSDT',
  'CRV-USDC': 'CRVUSDT',
  'FIL-USDC': 'FILUSDT',
  'BTC-SPOT': 'BTCUSDT',
  'ETH-SPOT': 'ETHUSDT',
  'SOL-SPOT': 'SOLUSDT',
  'XRP-SPOT': 'XRPUSDT',
  'LINK-SPOT': 'LINKUSDT',
  'AVAX-SPOT': 'AVAXUSDT',
  'XAUT-SPOT': 'PAXGUSDT',
};

// Map interval string to Binance kline interval
const BINANCE_INTERVAL_MAP: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1D': '1d',
  '1W': '1w',
};

// Map DEX market to TradingView embed symbol
export function getTradingViewSymbol(market: Market): string {
  if (market.category === 'stocks') {
    return `NASDAQ:${market.baseAsset}`;
  }
  if (market.category === 'indices') {
    if (market.baseAsset === 'SP500') return 'SP:SPX';
    if (market.baseAsset === 'USTECH') return 'NASDAQ:NDX';
    if (market.baseAsset === 'JP225') return 'INDEX:NKY';
    if (market.baseAsset === 'SMALL2000') return 'RUSSELL:RUT';
    return 'SP:SPX';
  }
  if (market.category === 'commodities') {
    if (market.baseAsset === 'GOLD') return 'OANDA:XAUUSD';
    if (market.baseAsset === 'SILVER') return 'OANDA:XAGUSD';
    if (market.baseAsset === 'CL') return 'TVC:USOIL';
    if (market.baseAsset === 'BRENTOIL') return 'TVC:UKOIL';
    if (market.baseAsset === 'NATGAS') return 'TVC:NATGAS';
    if (market.baseAsset === 'COPPER') return 'TVC:COPPER';
    if (market.baseAsset === 'PLATINUM') return 'TVC:PLATINUM';
    if (market.baseAsset === 'PALLADIUM') return 'TVC:PALLADIUM';
    return 'OANDA:XAUUSD';
  }
  // Crypto
  const binancePair = BINANCE_PAIR_MAP[market.id] || `${market.baseAsset}USDT`;
  return `BINANCE:${binancePair}`;
}

/**
 * Fetch real historical Klines from Binance API for crypto assets
 */
export async function fetchRealBinanceKlines(
  market: Market,
  timeframe: string = '15m',
  limit: number = 100
): Promise<{ candles: RealCandleData[]; volumes: RealVolumeData[] } | null> {
  const binanceSymbol = BINANCE_PAIR_MAP[market.id];
  if (!binanceSymbol) return null;

  const interval = BINANCE_INTERVAL_MAP[timeframe] || '15m';

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const candles: RealCandleData[] = [];
    const volumes: RealVolumeData[] = [];

    for (const item of data) {
      // Binance format: [openTime, open, high, low, close, volume, closeTime, ...]
      const time = Math.floor(item[0] / 1000) as UTCTimestamp;
      const open = parseFloat(item[1]);
      const high = parseFloat(item[2]);
      const low = parseFloat(item[3]);
      const close = parseFloat(item[4]);
      const volume = parseFloat(item[5]);

      candles.push({ time, open, high, low, close });
      volumes.push({
        time,
        value: volume,
        color: close >= open ? 'rgba(0, 210, 255, 0.45)' : 'rgba(255, 77, 77, 0.45)',
      });
    }

    return { candles, volumes };
  } catch (err) {
    console.warn('Binance kline fetch error, falling back to simulated historical bars:', err);
    return null;
  }
}

/**
 * High-precision historical bars generator for stocks/commodities or offline fallback
 */
export function generateRealisticHistoricalData(
  currentPrice: number,
  timeframe: string = '15m',
  count: number = 100
): { candles: RealCandleData[]; volumes: RealVolumeData[] } {
  const candles: RealCandleData[] = [];
  const volumes: RealVolumeData[] = [];

  let intervalSec = 15 * 60;
  if (timeframe === '1m') intervalSec = 60;
  else if (timeframe === '5m') intervalSec = 5 * 60;
  else if (timeframe === '15m') intervalSec = 15 * 60;
  else if (timeframe === '1h') intervalSec = 60 * 60;
  else if (timeframe === '4h') intervalSec = 4 * 60 * 60;
  else if (timeframe === '1D') intervalSec = 24 * 60 * 60;
  else if (timeframe === '1W') intervalSec = 7 * 24 * 60 * 60;

  const nowSec = Math.floor(Date.now() / 1000);
  const startTime = nowSec - count * intervalSec;

  const volatility = currentPrice * 0.003;
  let lastClose = currentPrice * (1 - 0.015 + Math.random() * 0.01);

  for (let i = 0; i < count; i++) {
    const time = (startTime + i * intervalSec) as UTCTimestamp;
    const progress = i / count;
    const pull = (currentPrice - lastClose) * (0.05 + progress * 0.1);
    const change = (Math.random() - 0.49) * volatility + pull;

    const open = lastClose;
    let close = open + change;
    if (i === count - 1) {
      close = currentPrice;
    }

    const wickUp = Math.random() * volatility * 0.7;
    const wickDown = Math.random() * volatility * 0.7;
    const high = Math.max(open, close) + wickUp;
    const low = Math.max(0.0001, Math.min(open, close) - wickDown);
    const volume = Math.floor(currentPrice * (5 + Math.random() * 30));

    candles.push({ time, open, high, low, close });
    volumes.push({
      time,
      value: volume,
      color: close >= open ? 'rgba(0, 210, 255, 0.45)' : 'rgba(255, 77, 77, 0.45)',
    });

    lastClose = close;
  }

  return { candles, volumes };
}

/**
 * Calculate EMA line data points for Lightweight Charts
 */
export function calculateEmaData(candles: RealCandleData[], period: number): RealLineData[] {
  if (candles.length < period) return [];
  const k = 2 / (period + 1);
  const result: RealLineData[] = [];

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / period;
  result.push({ time: candles[period - 1].time, value: prevEma });

  for (let i = period; i < candles.length; i++) {
    const currentEma = candles[i].close * k + prevEma * (1 - k);
    result.push({ time: candles[i].time, value: currentEma });
    prevEma = currentEma;
  }

  return result;
}

/**
 * Get interval in seconds for a given timeframe
 */
export function getTimeframeSeconds(timeframe: string): number {
  switch (timeframe) {
    case '1m':
      return 60;
    case '5m':
      return 5 * 60;
    case '15m':
      return 15 * 60;
    case '1h':
      return 60 * 60;
    case '4h':
      return 4 * 60 * 60;
    case '1D':
      return 24 * 60 * 60;
    case '1W':
      return 7 * 24 * 60 * 60;
    default:
      return 15 * 60;
  }
}

