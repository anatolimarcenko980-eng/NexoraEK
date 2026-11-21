import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  UTCTimestamp,
} from 'lightweight-charts';
import { Market, Position } from '../types/market';
import { formatPrice } from '../utils/tradingMath';
import { useTrading } from '../context/TradingContext';
import {
  fetchRealBinanceKlines,
  generateRealisticHistoricalData,
  calculateEmaData,
  getTimeframeSeconds,
  getTradingViewSymbol,
  RealCandleData,
  RealVolumeData,
} from '../utils/realChartData';
import {
  CandlestickChart,
  LineChart,
  BarChart3,
  Monitor,
  Maximize2,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';

interface InteractiveChartProps {
  market: Market;
  activePositions: Position[];
  onClosePosition?: (positionId: string) => void;
}

type ChartDisplayMode = 'lightweight' | 'tradingview';
type SeriesTypeMode = 'candles' | 'line' | 'bars';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  market,
  activePositions,
  onClosePosition,
}) => {
  const { candleColors, t, language } = useTrading();
  const isGreenTheme = candleColors === 'emerald-ruby';
  const upCandleColor = isGreenTheme ? '#10b981' : '#00d2ff';
  const downCandleColor = '#ff4d4d';
  const lineAreaTopColor = isGreenTheme ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 210, 255, 0.4)';

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick' | 'Line' | 'Bar' | 'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const latestCandleRef = useRef<RealCandleData | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const loadIdRef = useRef<number>(0);

  // Safe chart destroyer helper that nullifies series refs before disposing chart
  const destroyChart = useCallback(() => {
    mainSeriesRef.current = null;
    volumeSeriesRef.current = null;
    ema20SeriesRef.current = null;
    ema50SeriesRef.current = null;
    priceLinesRef.current = [];
    if (chartInstanceRef.current) {
      try {
        const chart = chartInstanceRef.current;
        chartInstanceRef.current = null;
        chart.remove();
      } catch {
        // ignore disposed chart exceptions
      }
    }
    if (chartContainerRef.current) {
      try {
        chartContainerRef.current.innerHTML = '';
      } catch {}
    }
  }, []);

  // UI state
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('lightweight');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [seriesType, setSeriesType] = useState<SeriesTypeMode>('candles');
  const [showEma20, setShowEma20] = useState<boolean>(true);
  const [showEma50, setShowEma50] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [isLoadingRealData, setIsLoadingRealData] = useState<boolean>(false);
  const [isLiveBinanceData, setIsLiveBinanceData] = useState<boolean>(false);

  // Legend values on crosshair
  const [legendData, setLegendData] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  } | null>(null);

  // Keep market in a ref so price ticks do not cause the chart to reload or re-create
  const marketRef = useRef(market);
  marketRef.current = market;

  // Active position for this market
  const currentMarketPosition = activePositions.find((p) => p.marketId === market.id);
  const currentMarketPositionRef = useRef<Position | undefined>(currentMarketPosition);
  currentMarketPositionRef.current = currentMarketPosition;

  // Key based only on position geometry (entry, TP, SL), NOT fluctuating unrealized PnL
  const positionLineKey = currentMarketPosition
    ? `${currentMarketPosition.id}_${currentMarketPosition.entryPrice}_${currentMarketPosition.tpPrice || 0}_${currentMarketPosition.slPrice || 0}_${currentMarketPosition.side}`
    : 'none';

  // Clean up existing price lines
  const clearPriceLines = useCallback(() => {
    if (mainSeriesRef.current && priceLinesRef.current.length > 0) {
      priceLinesRef.current.forEach((line) => {
        try {
          mainSeriesRef.current?.removePriceLine(line);
        } catch {
          // ignore
        }
      });
      priceLinesRef.current = [];
    }
  }, []);

  // Update position overlay lines on the real chart WITHOUT reloading the chart
  const updatePositionLines = useCallback(() => {
    clearPriceLines();
    const pos = currentMarketPositionRef.current;
    if (!mainSeriesRef.current || !pos) return;

    const isLong = pos.side === 'long';

    // 1. Entry line (Green dashed for Long, Red dashed for Short)
    const entryLine = mainSeriesRef.current.createPriceLine({
      price: pos.entryPrice,
      color: isLong ? '#10b981' : '#ff4d4d',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: `ENTRY ${pos.leverage}x ${isLong ? 'LONG' : 'SHORT'}`,
    });
    priceLinesRef.current.push(entryLine);

    // 2. Take Profit line (Teal dotted)
    if (pos.tpPrice) {
      const tpLine = mainSeriesRef.current.createPriceLine({
        price: pos.tpPrice,
        color: '#00d2ff',
        lineWidth: 2,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: 'TAKE PROFIT',
      });
      priceLinesRef.current.push(tpLine);
    }

    // 3. Stop Loss line (Red dotted)
    if (pos.slPrice) {
      const slLine = mainSeriesRef.current.createPriceLine({
        price: pos.slPrice,
        color: '#ff4d4d',
        lineWidth: 2,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: 'STOP LOSS',
      });
      priceLinesRef.current.push(slLine);
    }
  }, [clearPriceLines]);

  // Load real historical data & initialize TradingView lightweight-charts
  const loadChartData = useCallback(async () => {
    if (displayMode !== 'lightweight' || !chartContainerRef.current) return;

    const currentLoadId = ++loadIdRef.current;
    setIsLoadingRealData(true);

    const targetMarket = marketRef.current;

    // 1. Attempt to fetch real Binance Klines
    let realData = null;
    let isBinance = true;

    try {
      realData = await fetchRealBinanceKlines(targetMarket, timeframe, 120);
    } catch {
      realData = null;
    }

    // Abort if load was superseded or component unmounted
    if (!isMountedRef.current || currentLoadId !== loadIdRef.current) return;

    // 2. If not a crypto pair or offline, fallback to realistic high-precision data generator
    if (!realData || realData.candles.length === 0) {
      realData = generateRealisticHistoricalData(targetMarket.price, timeframe, 100);
      isBinance = false;
    }

    if (!isMountedRef.current || currentLoadId !== loadIdRef.current) return;

    setIsLiveBinanceData(isBinance);
    setIsLoadingRealData(false);

    const { candles, volumes } = realData;
    if (candles.length === 0) return;

    const container = chartContainerRef.current;
    if (!container) return;

    // Remove existing chart cleanly before creating a new one
    destroyChart();

    latestCandleRef.current = candles[candles.length - 1];
    setLegendData({
      open: latestCandleRef.current.open,
      high: latestCandleRef.current.high,
      low: latestCandleRef.current.low,
      close: latestCandleRef.current.close,
      volume: volumes[volumes.length - 1]?.value,
    });

    const initialWidth = container.clientWidth > 0 ? container.clientWidth : 600;
    const initialHeight = container.clientHeight > 0 ? container.clientHeight : 400;

    try {
      // Create fresh TradingView Chart
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: '#08090d' },
          textColor: '#94a3b8',
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: '#475569',
            width: 1,
            style: LineStyle.Dashed,
            labelBackgroundColor: '#1e293b',
          },
          horzLine: {
            color: '#475569',
            width: 1,
            style: LineStyle.Dashed,
            labelBackgroundColor: '#1e293b',
          },
        },
        rightPriceScale: {
          borderColor: '#1e293b',
          scaleMargins: {
            top: 0.12,
            bottom: 0.22,
          },
        },
        timeScale: {
          borderColor: '#1e293b',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
        width: initialWidth,
        height: initialHeight,
      });

      if (!isMountedRef.current || currentLoadId !== loadIdRef.current) {
        try { chart.remove(); } catch {}
        return;
      }

      chartInstanceRef.current = chart;

      // Create Main Series (Candlestick, Line, or Bars)
      if (seriesType === 'candles') {
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: upCandleColor,
          downColor: downCandleColor,
          borderVisible: false,
          wickUpColor: upCandleColor,
          wickDownColor: downCandleColor,
          priceLineVisible: true,
          lastValueVisible: true,
        });
        candleSeries.setData(candles);
        mainSeriesRef.current = candleSeries;
      } else if (seriesType === 'line') {
        const lineSeries = chart.addSeries(AreaSeries, {
          topColor: lineAreaTopColor,
          bottomColor: 'rgba(0, 0, 0, 0.0)',
          lineColor: upCandleColor,
          lineWidth: 2,
        });
        lineSeries.setData(
          candles.map((c) => ({
            time: c.time,
            value: c.close,
          }))
        );
        mainSeriesRef.current = lineSeries;
      } else {
        const barSeries = chart.addSeries(BarSeries, {
          upColor: upCandleColor,
          downColor: downCandleColor,
        });
        barSeries.setData(candles);
        mainSeriesRef.current = barSeries;
      }

      // Add Volume Histogram at the bottom
      if (showVolume) {
        const volumeSeries = chart.addSeries(HistogramSeries, {
          priceFormat: { type: 'volume' },
          priceScaleId: '', // overlay
        });
        volumeSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
        volumeSeries.setData(volumes);
        volumeSeriesRef.current = volumeSeries;
      }

      // Add EMA 20 line
      if (showEma20) {
        const ema20Data = calculateEmaData(candles, 20);
        const ema20Series = chart.addSeries(LineSeries, {
          color: '#38bdf8',
          lineWidth: 1,
          title: 'EMA 20',
          priceLineVisible: false,
        });
        ema20Series.setData(ema20Data);
        ema20SeriesRef.current = ema20Series;
      }

      // Add EMA 50 line
      if (showEma50) {
        const ema50Data = calculateEmaData(candles, 50);
        const ema50Series = chart.addSeries(LineSeries, {
          color: '#a855f7',
          lineWidth: 1,
          title: 'EMA 50',
          priceLineVisible: false,
        });
        ema50Series.setData(ema50Data);
        ema50SeriesRef.current = ema50Series;
      }

      // Crosshair hover listener for real-time OHLCV inspection
      chart.subscribeCrosshairMove((param) => {
        if (!isMountedRef.current || !chartInstanceRef.current) return;
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > container.clientWidth ||
          param.point.y < 0 ||
          param.point.y > container.clientHeight
        ) {
          if (latestCandleRef.current) {
            setLegendData({
              open: latestCandleRef.current.open,
              high: latestCandleRef.current.high,
              low: latestCandleRef.current.low,
              close: latestCandleRef.current.close,
            });
          }
        } else if (mainSeriesRef.current) {
          try {
            const data = param.seriesData.get(mainSeriesRef.current);
            if (data) {
              if ('open' in data) {
                setLegendData({
                  open: (data as any).open,
                  high: (data as any).high,
                  low: (data as any).low,
                  close: (data as any).close,
                });
              } else if ('value' in data) {
                const val = (data as any).value;
                setLegendData({ open: val, high: val, low: val, close: val });
              }
            }
          } catch {}
        }
      });

      // Update on-chart position lines
      updatePositionLines();

      // Auto-fit content
      chart.timeScale().fitContent();
    } catch {
      // Disposed or interrupted
    }
  }, [market.id, timeframe, seriesType, showVolume, showEma20, showEma50, displayMode, candleColors, upCandleColor, lineAreaTopColor, destroyChart, updatePositionLines]);

  // Overall unmount cleanup effect
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      loadIdRef.current++;
      destroyChart();
    };
  }, [destroyChart]);

  // Initial load and re-mount on parameter change (never on tick)
  useEffect(() => {
    loadChartData();

    // Resize observer to ensure 100% responsive resizing
    const container = chartContainerRef.current;
    if (!container) return;

    let resizeTimer: any = null;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!isMountedRef.current || entries.length === 0 || !chartInstanceRef.current) return;
      const { width, height } = entries[0].contentRect;
      if (width <= 0 || height <= 0) return;
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        if (!isMountedRef.current || !chartInstanceRef.current) return;
        try {
          chartInstanceRef.current.applyOptions({ width, height });
        } catch {
          // ignore disposed chart
        }
      });
    });

    resizeObserver.observe(container);

    return () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeObserver.disconnect();
      destroyChart();
    };
  }, [loadChartData, destroyChart]);

  // Keep position lines synchronized ONLY when active position geometry (entry, TP, SL) changes, NOT on every PnL tick
  useEffect(() => {
    if (!isMountedRef.current || !chartInstanceRef.current || !mainSeriesRef.current) return;
    updatePositionLines();
  }, [positionLineKey, updatePositionLines]);

  // Live candle price response: make chart candles move dynamically in response to the price
  useEffect(() => {
    if (!isMountedRef.current || !chartInstanceRef.current || !mainSeriesRef.current || !latestCandleRef.current) return;
    if (!market.price || isNaN(market.price)) return;

    const currentPrice = market.price;
    const lastCandle = latestCandleRef.current;
    const tfSec = getTimeframeSeconds(timeframe);
    const nowSec = Math.floor(Date.now() / 1000);

    let updatedCandle: RealCandleData;

    // Check if current candle period has completed (new bar period)
    if (nowSec >= (lastCandle.time as number) + tfSec) {
      const newCandleTime = ((lastCandle.time as number) + tfSec) as UTCTimestamp;
      updatedCandle = {
        time: newCandleTime,
        open: lastCandle.close,
        high: Math.max(lastCandle.close, currentPrice),
        low: Math.min(lastCandle.close, currentPrice),
        close: currentPrice,
      };
    } else {
      // Dynamic candle response: body expands/contracts, wicks stretch to high/low
      updatedCandle = {
        time: lastCandle.time,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, currentPrice),
        low: Math.min(lastCandle.low, currentPrice),
        close: currentPrice,
      };
    }

    latestCandleRef.current = updatedCandle;

    try {
      if (seriesType === 'line') {
        mainSeriesRef.current.update({
          time: updatedCandle.time,
          value: currentPrice,
        });
      } else {
        mainSeriesRef.current.update(updatedCandle);
      }

      // Smoothly update volume series if enabled
      if (volumeSeriesRef.current && showVolume) {
        const isUp = updatedCandle.close >= updatedCandle.open;
        volumeSeriesRef.current.update({
          time: updatedCandle.time,
          value: Math.max(5, currentPrice * 0.05),
          color: isUp ? 'rgba(0, 210, 255, 0.45)' : 'rgba(255, 77, 77, 0.45)',
        });
      }

      // Update crosshair OHLC legend values to reflect the moving live candle
      setLegendData((prev) => {
        if (!prev) {
          return {
            open: updatedCandle.open,
            high: updatedCandle.high,
            low: updatedCandle.low,
            close: updatedCandle.close,
          };
        }
        return {
          ...prev,
          high: updatedCandle.high,
          low: updatedCandle.low,
          close: updatedCandle.close,
        };
      });
    } catch {
      // Ignore if series is in unmount phase
    }
  }, [market.price, timeframe, seriesType, showVolume]);

  const tvSymbol = getTradingViewSymbol(market);

  return (
    <div className="flex flex-col h-full w-full bg-[#08090d] border border-[#1e293b]/70 rounded-xl overflow-hidden shadow-2xl">
      {/* Chart Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e293b] bg-[#0c0d12] flex-wrap gap-2 text-xs">
        {/* Left Side: Timeframe Selectors */}
        <div className="flex items-center gap-1.5">
          {displayMode === 'lightweight' && (
            <div className="flex items-center gap-0.5 bg-[#14161f] p-0.5 rounded-lg border border-[#1e293b]/60">
              {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-[#00d2ff] text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}

          {/* Chart Style Switcher (for Lightweight) */}
          {displayMode === 'lightweight' && (
            <div className="flex items-center gap-0.5 bg-[#14161f] p-0.5 rounded-lg border border-[#1e293b]/60">
              <button
                onClick={() => setSeriesType('candles')}
                title="Candlestick"
                className={`p-1.5 rounded transition-all ${
                  seriesType === 'candles' ? 'bg-[#1e293b] text-[#00d2ff]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CandlestickChart className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSeriesType('line')}
                title="Line & Area"
                className={`p-1.5 rounded transition-all ${
                  seriesType === 'line' ? 'bg-[#1e293b] text-[#00d2ff]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSeriesType('bars')}
                title="Bars"
                className={`p-1.5 rounded transition-all ${
                  seriesType === 'bars' ? 'bg-[#1e293b] text-[#00d2ff]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Technical Indicators Toggle */}
          {displayMode === 'lightweight' && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setShowEma20(!showEma20)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  showEma20
                    ? 'border-sky-400/50 text-sky-400 bg-sky-400/10'
                    : 'border-[#1e293b] text-slate-500'
                }`}
              >
                EMA 20
              </button>
              <button
                onClick={() => setShowEma50(!showEma50)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  showEma50
                    ? 'border-purple-400/50 text-purple-400 bg-purple-400/10'
                    : 'border-[#1e293b] text-slate-500'
                }`}
              >
                EMA 50
              </button>
              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  showVolume
                    ? 'border-slate-500 text-slate-300 bg-slate-800/40'
                    : 'border-[#1e293b] text-slate-500'
                }`}
              >
                VOL
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Data Source Indicator & TradingView Mode Switcher */}
        <div className="flex items-center gap-2">
          {displayMode === 'lightweight' && (
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#121520] border border-[#1e293b] text-[10px] font-mono text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#00d2ff] font-semibold">{t('liveFeed')}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">{isLiveBinanceData ? 'Binance Klines' : 'Nexora Feed'}</span>
              </div>
              <button
                onClick={() => loadChartData()}
                title="Reload historical candles"
                className="p-1 rounded-md bg-[#121520] hover:bg-[#1a1f2e] border border-[#1e293b] text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRealData ? 'animate-spin text-[#00d2ff]' : ''}`} />
              </button>
            </div>
          )}

          {/* Toggle between Nexora Pro Chart (Lightweight with positions) and Full TradingView Terminal */}
          <div className="flex items-center gap-1 bg-[#14161f] p-0.5 rounded-lg border border-[#1e293b]/60">
            <button
              onClick={() => setDisplayMode('lightweight')}
              className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-all ${
                displayMode === 'lightweight'
                  ? 'bg-[#1e293b] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('nexoraPro')}
            </button>
            <button
              onClick={() => setDisplayMode('tradingview')}
              className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-all flex items-center gap-1 ${
                displayMode === 'tradingview'
                  ? 'bg-[#00d2ff] text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>TradingView</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas or TradingView Embed */}
      <div className="relative flex-1 w-full min-h-[360px] bg-[#08090d]">
        {displayMode === 'lightweight' ? (
          <>
            {/* Real TradingView Lightweight Chart Container */}
            <div ref={chartContainerRef} className="w-full h-full" />

            {/* OHLCV Crosshair Legend */}
            {legendData && (
              <div className="absolute top-2 left-3 bg-[#0d0f15]/90 border border-[#1e293b] rounded px-2.5 py-1 text-[11px] font-mono text-slate-300 flex items-center gap-3 backdrop-blur-sm pointer-events-none z-10 flex-wrap">
                <span>
                  O: <span className="text-white">{formatPrice(legendData.open, market.precision)}</span>
                </span>
                <span>
                  H: <span className="text-emerald-400">{formatPrice(legendData.high, market.precision)}</span>
                </span>
                <span>
                  L: <span className="text-red-400">{formatPrice(legendData.low, market.precision)}</span>
                </span>
                <span>
                  C:{' '}
                  <span
                    className={
                      legendData.close >= legendData.open
                        ? isGreenTheme ? 'text-emerald-400' : 'text-[#00d2ff]'
                        : 'text-red-400'
                    }
                  >
                    {formatPrice(legendData.close, market.precision)}
                  </span>
                </span>
                {legendData.volume !== undefined && (
                  <span className="text-slate-500 hidden sm:inline">
                    Vol: {legendData.volume.toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Active Position Overlay Floater */}
            {currentMarketPosition && (
              <div className="absolute top-2 right-3 bg-[#10141f]/95 border border-[#1e293b] rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-lg backdrop-blur-md z-10 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentMarketPosition.side === 'long' ? 'bg-[#00d2ff]' : 'bg-[#ff4d4d]'
                    }`}
                  />
                  <span className="font-bold text-white uppercase">
                    {currentMarketPosition.leverage}x {currentMarketPosition.side}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">PnL:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      currentMarketPosition.unrealizedPnl >= 0 ? 'text-[#00d2ff]' : 'text-[#ff4d4d]'
                    }`}
                  >
                    {currentMarketPosition.unrealizedPnl >= 0 ? '+' : ''}$
                    {currentMarketPosition.unrealizedPnl.toFixed(2)}{' '}
                    ({currentMarketPosition.unrealizedPnlPercent >= 0 ? '+' : ''}
                    {currentMarketPosition.unrealizedPnlPercent.toFixed(2)}%)
                  </span>
                </div>
                {onClosePosition && (
                  <button
                    onClick={() => onClosePosition(currentMarketPosition.id)}
                    className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[10px] font-semibold transition-colors"
                  >
                    {t('close')}
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* Official TradingView Advanced Real-Time Chart Iframe */
          <div className="w-full h-full relative">
            <iframe
              title={`TradingView Chart ${market.symbol}`}
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
                tvSymbol
              )}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=08090d&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%22mainSeriesProperties.candleStyle.upColor%22%3A%22${encodeURIComponent(upCandleColor)}%22%2C%22mainSeriesProperties.candleStyle.downColor%22%3A%22%23ff4d4d%22%2C%22mainSeriesProperties.candleStyle.wickUpColor%22%3A%22${encodeURIComponent(upCandleColor)}%22%2C%22mainSeriesProperties.candleStyle.wickDownColor%22%3A%22%23ff4d4d%22%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=${encodeURIComponent(language === 'zh' ? 'zh_CN' : language)}`}
              className="w-full h-full border-0 absolute inset-0"
              scrolling="no"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
};
