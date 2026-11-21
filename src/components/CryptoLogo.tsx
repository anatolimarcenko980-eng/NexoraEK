import React from 'react';

export interface CryptoLogoProps {
  symbol: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  glow?: boolean;
}

const SIZE_MAP = {
  xs: 16,
  sm: 22,
  md: 28,
  lg: 36,
  xl: 48,
};

export const CryptoLogo: React.FC<CryptoLogoProps> = ({
  symbol,
  size = 'md',
  className = '',
  glow = false,
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 28;
  const sym = (symbol || '').toUpperCase().trim();
  const [imgError, setImgError] = React.useState<boolean>(false);

  // Supported real stock symbols with authentic corporate logos
  const STOCK_SET = React.useMemo(() => new Set([
    'NVDA', 'AAPL', 'TSLA', 'MSFT', 'META', 'GOOGL', 'GOOG', 'AMZN', 'PLTR', 'MSTR', 'COIN',
    'AMD', 'HOOD', 'NFLX', 'BABA', 'INTC', 'SOXL', 'DIS', 'PYPL', 'CRM', 'UBER', 'ABNB',
    'SPY', 'QQQ', 'DIA', 'IWM', 'VOO', 'SMCI', 'ARM', 'AVGO', 'QCOM', 'TXN', 'ORCL', 'IBM',
    'BA', 'JPM', 'GS', 'V', 'MA', 'WMT', 'COST', 'NKE', 'XOM', 'CVX'
  ]), []);

  // Supported real commodity assets
  const COMMODITY_SET = React.useMemo(() => new Set([
    'GOLD', 'GLD', 'XAU',
    'SILVER', 'SLV', 'XAG',
    'OIL', 'USOIL', 'CL', 'WTI',
    'BRENTOIL', 'BRENT',
    'NATGAS', 'NG', 'GAS',
    'COPPER', 'HG', 'CPER',
    'PLATINUM', 'PL', 'PPLT', 'XPT',
    'PALLADIUM', 'PA', 'PALL', 'XPD'
  ]), []);

  // Supported real index assets with authentic vector logos
  const INDEX_SET = React.useMemo(() => new Set([
    'SP500', 'SPX', 'SPY',
    'USTECH', 'NDX', 'NASDAQ', 'QQQ',
    'XYZ100', 'CRYPTO100',
    'JP225', 'N225', 'NI225', 'NIKKEI',
    'SMALL2000', 'RUT', 'IWM', 'RUSSELL',
    'DJI', 'DOW', 'US30',
    'DAX', 'GER40',
    'FTSE', 'UK100',
    'VIX',
    'DXY', 'USDX',
    'CAC40', 'CAC', 'FRA40',
    'HSI', 'HK50',
    'ASX200', 'EUROSTOXX50', 'SX5E'
  ]), []);

  const isStock = React.useMemo(() => STOCK_SET.has(sym), [sym, STOCK_SET]);
  const isCommodity = React.useMemo(() => COMMODITY_SET.has(sym), [sym, COMMODITY_SET]);
  const isIndex = React.useMemo(() => INDEX_SET.has(sym), [sym, INDEX_SET]);
  const isPaddedStock = sym === 'MSFT' || sym === 'META' || sym === 'HOOD' || sym === 'GOOGL' || sym === 'GOOG';

  // Map special aliases or symbol variations to CoinCap asset slugs
  const symbolMap: Record<string, string> = React.useMemo(() => ({
    KPEPE: 'pepe',
    RENDER: 'rndr',
    RNDR: 'rndr',
    BTC: 'btc',
    ETH: 'eth',
    SOL: 'sol',
    XRP: 'xrp',
    BNB: 'bnb',
    DOGE: 'doge',
    SUI: 'sui',
    HYPE: 'hype',
    AVAX: 'avax',
    LINK: 'link',
    ADA: 'ada',
    NEAR: 'near',
    AAVE: 'aave',
    TON: 'ton',
    ARB: 'arb',
    PEPE: 'pepe',
    USDC: 'usdc',
    USDT: 'usdt',
    UNI: 'uni',
    OP: 'op',
    APT: 'apt',
    INJ: 'inj',
    TIA: 'tia',
    SHIB: 'shib',
    WIF: 'wif',
    BONK: 'bonk',
    FLOKI: 'floki',
    KAS: 'kas',
    FET: 'fet',
    LDO: 'ldo',
    MKR: 'mkr',
    TAO: 'tao',
    SEI: 'sei',
    PENDLE: 'pendle',
    TRUMP: 'trump',
    ZEC: 'zec',
    XMR: 'xmr',
    ONDO: 'ondo',
    LTC: 'ltc',
    BCH: 'bch',
    PAXG: 'paxg',
    ENA: 'ena',
    WLD: 'wld',
    PENGU: 'pengu',
    GRASS: 'grass',
    VIRTUAL: 'virtual',
    JUP: 'jup',
    DOT: 'dot',
    ATOM: 'atom',
    CRV: 'crv',
    PUMP: 'pump',
    FIL: 'fil',
    XAUT: 'xaut',
    NEXO: 'nexo',
  }), []);

  // Symbols that use dedicated inline SVG graphics only (custom memes)
  const svgOnlyList = React.useMemo(() => new Set([
    'FARTCOIN'
  ]), []);

  // Custom uploaded commodity asset logos
  const COMMODITY_CUSTOM_IMAGES: Record<string, string> = React.useMemo(() => ({
    CL: '/assets/aistudio/CL_1705b5f9.jpg',
    OIL: '/assets/aistudio/CL_1705b5f9.jpg',
    USOIL: '/assets/aistudio/CL_1705b5f9.jpg',
    WTI: '/assets/aistudio/CL_1705b5f9.jpg',
    BRENTOIL: '/assets/aistudio/BRENTOIL_1705b5f9.jpg',
    BRENT: '/assets/aistudio/BRENTOIL_1705b5f9.jpg',
    COPPER: '/assets/aistudio/COPPER_d94390fe.jpg',
    HG: '/assets/aistudio/COPPER_d94390fe.jpg',
    CPER: '/assets/aistudio/COPPER_d94390fe.jpg',
    PLATINUM: '/assets/aistudio/PLATINUM_6845432b.jpg',
    PL: '/assets/aistudio/PLATINUM_6845432b.jpg',
    PPLT: '/assets/aistudio/PLATINUM_6845432b.jpg',
    XPT: '/assets/aistudio/PLATINUM_6845432b.jpg',
    GOLD: '/assets/aistudio/GOLD_cc30aa37.jpg',
    GLD: '/assets/aistudio/GOLD_cc30aa37.jpg',
    XAU: '/assets/aistudio/GOLD_cc30aa37.jpg',
    SILVER: '/assets/aistudio/SILVER_245290f0.jpg',
    SLV: '/assets/aistudio/SILVER_245290f0.jpg',
    XAG: '/assets/aistudio/SILVER_245290f0.jpg',
    PALLADIUM: '/assets/aistudio/PALLADIUM_6446faaf.jpg',
    PA: '/assets/aistudio/PALLADIUM_6446faaf.jpg',
    PALL: '/assets/aistudio/PALLADIUM_6446faaf.jpg',
    XPD: '/assets/aistudio/PALLADIUM_6446faaf.jpg',
  }), []);

  const [currentSrc, setCurrentSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    setImgError(false);
    if (!sym) {
      setCurrentSrc(null);
      return;
    }
    // Check custom uploaded commodity image logos first
    if (COMMODITY_CUSTOM_IMAGES[sym]) {
      setCurrentSrc(COMMODITY_CUSTOM_IMAGES[sym]);
      return;
    }
    // Check if it's a real stock
    if (STOCK_SET.has(sym)) {
      setCurrentSrc(`/assets/stocks/${sym}.png`);
      return;
    }
    // Check if it's a real commodity
    if (COMMODITY_SET.has(sym)) {
      setCurrentSrc(`/assets/commodities/${sym}.svg`);
      return;
    }
    // Check if it's a real index
    if (INDEX_SET.has(sym)) {
      setCurrentSrc(`/assets/indices/${sym}.svg`);
      return;
    }
    // Check if it's SVG only
    if (svgOnlyList.has(sym)) {
      setCurrentSrc(null);
      return;
    }
    // Default to CoinCap Web3 crypto logos
    const key = symbolMap[sym] || sym.toLowerCase();
    setCurrentSrc(`https://assets.coincap.io/assets/icons/${key}@2x.png`);
  }, [sym, COMMODITY_CUSTOM_IMAGES, STOCK_SET, COMMODITY_SET, INDEX_SET, svgOnlyList, symbolMap]);

  const handleImageError = () => {
    if (currentSrc && currentSrc.startsWith('/assets/aistudio/') && COMMODITY_SET.has(sym)) {
      setCurrentSrc(`/assets/commodities/${sym}.svg`);
    } else if (currentSrc && currentSrc.startsWith('/assets/stocks/')) {
      // Fallback to Parqet CDN
      setCurrentSrc(`https://assets.parqet.com/logos/symbol/${sym}?format=png`);
    } else if (currentSrc && currentSrc.includes('parqet.com')) {
      // Fallback to Financial Modeling Prep CDN
      setCurrentSrc(`https://financialmodelingprep.com/image-stock/${sym}.png`);
    } else if (currentSrc && currentSrc.startsWith('/assets/commodities/')) {
      // Fallback to TradingView official commodity vectors or FMP
      if (sym === 'GOLD' || sym === 'GLD' || sym === 'XAU') {
        setCurrentSrc('https://s3-symbol-logo.tradingview.com/metal/gold.svg');
      } else if (sym === 'SILVER' || sym === 'SLV' || sym === 'XAG') {
        setCurrentSrc('https://s3-symbol-logo.tradingview.com/metal/silver.svg');
      } else if (sym === 'CL' || sym === 'OIL' || sym === 'USOIL' || sym === 'WTI') {
        setCurrentSrc('https://s3-symbol-logo.tradingview.com/crude-oil--big.svg');
      } else if (sym === 'BRENTOIL' || sym === 'BRENT') {
        setCurrentSrc('https://financialmodelingprep.com/image-stock/BNO.png');
      } else if (sym === 'NATGAS' || sym === 'NG' || sym === 'GAS') {
        setCurrentSrc('https://s3-symbol-logo.tradingview.com/natural-gas--big.svg');
      } else if (sym === 'COPPER' || sym === 'HG' || sym === 'CPER') {
        setCurrentSrc('https://s3-symbol-logo.tradingview.com/metal/copper.svg');
      } else if (sym === 'PLATINUM' || sym === 'PL' || sym === 'PPLT' || sym === 'XPT') {
        setCurrentSrc('https://s3-symbol-logo.tradingview.com/metal/platinum.svg');
      } else if (sym === 'PALLADIUM' || sym === 'PA' || sym === 'PALL' || sym === 'XPD') {
        setCurrentSrc('https://s3-symbol-logo.tradingview.com/metal/palladium.svg');
      } else {
        setImgError(true);
        setCurrentSrc(null);
      }
    } else if (currentSrc && currentSrc.startsWith('/assets/indices/')) {
      // For indices, fallback to inline SVG vector immediately
      setImgError(true);
      setCurrentSrc(null);
    } else {
      setImgError(true);
      setCurrentSrc(null);
    }
  };

  // Pick unique glow color per asset
  const getGlowShadow = () => {
    if (!glow) return '';
    switch (sym) {
      case 'BTC': return 'shadow-[0_0_12px_rgba(247,147,26,0.5)]';
      case 'ETH': return 'shadow-[0_0_12px_rgba(98,126,234,0.5)]';
      case 'SOL': return 'shadow-[0_0_12px_rgba(20,241,149,0.5)]';
      case 'XRP': return 'shadow-[0_0_12px_rgba(255,255,255,0.4)]';
      case 'BNB': return 'shadow-[0_0_12px_rgba(240,185,11,0.5)]';
      case 'DOGE': return 'shadow-[0_0_12px_rgba(194,166,51,0.5)]';
      case 'SUI': return 'shadow-[0_0_12px_rgba(77,162,255,0.5)]';
      case 'HYPE': return 'shadow-[0_0_12px_rgba(0,245,184,0.6)]';
      case 'AVAX': return 'shadow-[0_0_12px_rgba(232,65,66,0.5)]';
      case 'LINK': return 'shadow-[0_0_12px_rgba(55,91,210,0.5)]';
      case 'ADA': return 'shadow-[0_0_12px_rgba(0,51,173,0.5)]';
      case 'NEAR': return 'shadow-[0_0_12px_rgba(255,255,255,0.4)]';
      case 'AAVE': return 'shadow-[0_0_12px_rgba(182,90,237,0.5)]';
      case 'TON': return 'shadow-[0_0_12px_rgba(0,152,234,0.5)]';
      case 'ARB': return 'shadow-[0_0_12px_rgba(40,160,240,0.5)]';
      case 'PEPE': return 'shadow-[0_0_12px_rgba(74,153,61,0.5)]';
      case 'USDC': return 'shadow-[0_0_12px_rgba(39,117,202,0.5)]';
      case 'USDT': return 'shadow-[0_0_12px_rgba(38,161,123,0.5)]';
      case 'NEXO': return 'shadow-[0_0_14px_rgba(0,210,255,0.6)]';
      case 'UNI': return 'shadow-[0_0_12px_rgba(255,0,122,0.5)]';
      case 'OP': return 'shadow-[0_0_12px_rgba(255,4,32,0.5)]';
      case 'APT': return 'shadow-[0_0_12px_rgba(33,212,253,0.5)]';
      case 'INJ': return 'shadow-[0_0_12px_rgba(0,180,255,0.5)]';
      case 'TIA': return 'shadow-[0_0_12px_rgba(123,63,228,0.5)]';
      case 'RENDER': return 'shadow-[0_0_12px_rgba(235,53,53,0.5)]';
      case 'SHIB': return 'shadow-[0_0_12px_rgba(255,160,0,0.5)]';
      case 'WIF': return 'shadow-[0_0_12px_rgba(205,133,63,0.5)]';
      case 'BONK': return 'shadow-[0_0_12px_rgba(255,140,0,0.5)]';
      case 'FLOKI': return 'shadow-[0_0_12px_rgba(235,168,52,0.5)]';
      case 'KAS': return 'shadow-[0_0_12px_rgba(112,199,186,0.5)]';
      case 'FET': return 'shadow-[0_0_12px_rgba(24,56,132,0.5)]';
      case 'LDO': return 'shadow-[0_0_12px_rgba(0,163,255,0.5)]';
      case 'MKR': return 'shadow-[0_0_12px_rgba(26,171,155,0.5)]';
      case 'TAO': return 'shadow-[0_0_12px_rgba(40,40,40,0.5)]';
      case 'SEI': return 'shadow-[0_0_12px_rgba(155,30,55,0.5)]';
      // Stocks & Commodities
      case 'NVDA': return 'shadow-[0_0_12px_rgba(118,185,0,0.6)]';
      case 'AAPL': return 'shadow-[0_0_12px_rgba(255,255,255,0.45)]';
      case 'TSLA': return 'shadow-[0_0_12px_rgba(232,33,39,0.6)]';
      case 'MSFT': return 'shadow-[0_0_12px_rgba(0,164,239,0.5)]';
      case 'META': return 'shadow-[0_0_12px_rgba(0,100,224,0.6)]';
      case 'GOOGL':
      case 'GOOG': return 'shadow-[0_0_12px_rgba(66,133,244,0.5)]';
      case 'AMZN': return 'shadow-[0_0_12px_rgba(255,153,0,0.5)]';
      case 'PLTR': return 'shadow-[0_0_12px_rgba(255,255,255,0.4)]';
      case 'MSTR': return 'shadow-[0_0_12px_rgba(217,39,46,0.6)]';
      case 'COIN': return 'shadow-[0_0_12px_rgba(0,82,255,0.6)]';
      case 'AMD': return 'shadow-[0_0_12px_rgba(0,138,0,0.5)]';
      case 'HOOD': return 'shadow-[0_0_12px_rgba(33,206,153,0.6)]';
      case 'NFLX': return 'shadow-[0_0_12px_rgba(229,9,20,0.6)]';
      case 'BABA': return 'shadow-[0_0_12px_rgba(255,106,0,0.6)]';
      case 'INTC': return 'shadow-[0_0_12px_rgba(0,113,197,0.5)]';
      case 'SOXL': return 'shadow-[0_0_12px_rgba(0,210,255,0.5)]';
      // Indices
      case 'SP500':
      case 'SPX':
      case 'SPY': return 'shadow-[0_0_12px_rgba(235,30,40,0.5)]';
      case 'USTECH':
      case 'NDX':
      case 'NASDAQ':
      case 'QQQ': return 'shadow-[0_0_12px_rgba(0,163,224,0.6)]';
      case 'XYZ100':
      case 'CRYPTO100': return 'shadow-[0_0_14px_rgba(0,210,255,0.6)]';
      case 'JP225':
      case 'N225':
      case 'NIKKEI': return 'shadow-[0_0_12px_rgba(188,0,45,0.6)]';
      case 'SMALL2000':
      case 'RUT':
      case 'IWM':
      case 'RUSSELL': return 'shadow-[0_0_12px_rgba(0,176,80,0.5)]';
      case 'DJI':
      case 'DOW':
      case 'US30': return 'shadow-[0_0_12px_rgba(11,34,101,0.6)]';
      case 'DAX':
      case 'GER40': return 'shadow-[0_0_12px_rgba(255,185,0,0.5)]';
      case 'FTSE':
      case 'UK100': return 'shadow-[0_0_12px_rgba(200,16,46,0.5)]';
      case 'VIX': return 'shadow-[0_0_12px_rgba(255,140,0,0.6)]';
      case 'DXY':
      case 'USDX': return 'shadow-[0_0_12px_rgba(16,185,129,0.55)]';
      case 'CAC40':
      case 'CAC':
      case 'FRA40': return 'shadow-[0_0_12px_rgba(0,85,164,0.55)]';
      case 'HSI':
      case 'HK50': return 'shadow-[0_0_12px_rgba(16,185,129,0.55)]';
      case 'ASX200': return 'shadow-[0_0_12px_rgba(245,158,11,0.5)]';
      case 'EUROSTOXX50':
      case 'SX5E': return 'shadow-[0_0_12px_rgba(30,58,138,0.6)]';
      // Commodities
      case 'GOLD':
      case 'GLD':
      case 'XAU':
      case 'PAXG': return 'shadow-[0_0_14px_rgba(245,158,11,0.55)]';
      case 'SILVER':
      case 'SLV':
      case 'XAG': return 'shadow-[0_0_12px_rgba(203,213,225,0.5)]';
      case 'OIL':
      case 'USOIL':
      case 'CL':
      case 'WTI': return 'shadow-[0_0_12px_rgba(249,115,22,0.55)]';
      case 'BRENTOIL':
      case 'BRENT': return 'shadow-[0_0_12px_rgba(56,189,248,0.55)]';
      case 'NATGAS':
      case 'NG':
      case 'GAS': return 'shadow-[0_0_12px_rgba(14,165,233,0.6)]';
      case 'COPPER':
      case 'HG':
      case 'CPER': return 'shadow-[0_0_12px_rgba(234,88,12,0.55)]';
      case 'PLATINUM':
      case 'PL':
      case 'PPLT':
      case 'XPT': return 'shadow-[0_0_12px_rgba(199,210,254,0.55)]';
      case 'PALLADIUM':
      case 'PA':
      case 'PALL':
      case 'XPD': return 'shadow-[0_0_12px_rgba(176,190,197,0.5)]';
      default: return 'shadow-[0_0_8px_rgba(0,210,255,0.3)]';
    }
  };

  const renderSvg = () => {
    switch (sym) {
      // ================= BTC =================
      case 'BTC':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#F7931A" />
            <path
              d="M22.5 13.5c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.6 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1.1-.3l-2.3-.6-.5 1.8s1.2.3 1.2.3c.7.2.8.6.8.9l-.8 3.2c0 0 .1 0 .1 0l-.1 0-1.1 4.5c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.6c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c2.8.5 4.9.3 5.8-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.4zm-3.7 5.2c-.5 2-3.9.9-5 .6l.9-3.6c1.1.3 4.6.8 4.1 3zm.5-5.3c-.5 1.8-3.3.9-4.2.7l.8-3.3c.9.2 3.9.7 3.4 2.6z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= ETH =================
      case 'ETH':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#1C2132" />
            <g transform="translate(8, 5) scale(0.666)">
              <polygon points="12 0 11.8 0.6 11.8 17.1 12 17.3 19.8 12.7" fill="#8A92B2" />
              <polygon points="12 0 4.2 12.7 12 17.3 12 9.2" fill="#62688F" />
              <polygon points="12 18.7 11.9 18.9 11.9 25.1 12 25.4 19.8 14.1" fill="#8A92B2" />
              <polygon points="12 25.4 12 18.7 4.2 14.1" fill="#62688F" />
              <polygon points="12 17.3 19.8 12.7 12 9.2" fill="#454A75" />
              <polygon points="4.2 12.7 12 17.3 12 9.2" fill="#50577C" />
            </g>
          </svg>
        );

      // ================= SOL =================
      case 'SOL':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0E121B" />
            <defs>
              <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FFA3" />
                <stop offset="100%" stopColor="#DC1FFF" />
              </linearGradient>
            </defs>
            <g transform="translate(6, 8) scale(0.85)">
              <path
                d="M3.7 4.5h16.2c.4 0 .7-.3.5-.6l-2.4-3.5c-.1-.2-.4-.4-.7-.4H1.1c-.4 0-.7.3-.5.6l2.4 3.5c.1.2.4.4.7.4z"
                fill="url(#solGrad)"
              />
              <path
                d="M19.9 8.2H3.7c-.4 0-.7.3-.5.6l2.4 3.5c.1.2.4.4.7.4h16.2c.4 0 .7-.3.5-.6L20.6 8.6c-.1-.2-.4-.4-.7-.4z"
                fill="url(#solGrad)"
              />
              <path
                d="M3.7 19.4h16.2c.4 0 .7-.3.5-.6l-2.4-3.5c-.1-.2-.4-.4-.7-.4H1.1c-.4 0-.7.3-.5.6l2.4 3.5c.1.2.4.4.7.4z"
                fill="url(#solGrad)"
              />
            </g>
          </svg>
        );

      // ================= XRP =================
      case 'XRP':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#1B1F2A" />
            <path
              d="M23.8 8h2.3l-5.6 5.5-2.2 2.2 4.1 4.1 3.7 3.7H23.8l-3-3-3-3-3 3-3 3H9.5l3.7-3.7 4.1-4.1-2.2-2.2L9.5 8h2.3l4.3 4.3 1.7 1.7 1.7-1.7L23.8 8z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= BNB =================
      case 'BNB':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#F0B90B" />
            <g fill="#FFFFFF" transform="translate(6, 6) scale(0.625)">
              <polygon points="16 2.5 19.8 6.3 16 10.1 12.2 6.3" />
              <polygon points="9.5 8.9 13.3 12.7 9.5 16.5 5.7 12.7" />
              <polygon points="22.5 8.9 26.3 12.7 22.5 16.5 18.7 12.7" />
              <polygon points="16 15.3 19.8 19.1 16 22.9 12.2 19.1" />
              <polygon points="9.5 21.7 13.3 25.5 9.5 29.3 5.7 25.5" />
              <polygon points="22.5 21.7 26.3 25.5 22.5 29.3 18.7 25.5" />
              <polygon points="16 28.1 19.8 31.9 16 35.7 12.2 31.9" />
              {/* Central diamond */}
              <polygon points="16 8.9 23.3 16.2 16 23.5 8.7 16.2" />
            </g>
          </svg>
        );

      // ================= DOGE =================
      case 'DOGE':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#C2A633" />
            <path
              d="M10.5 8.5h6.2c3.8 0 6.8 2.8 6.8 7.5s-3 7.5-6.8 7.5h-6.2V8.5zm3.2 2.6v3.6h4.5v1.8h-4.5v4.5h2.9c2.2 0 3.8-1.5 3.8-4.9 0-3.3-1.6-5-3.8-5h-2.9z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= SUI =================
      case 'SUI':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#2A82E4" />
            <path
              d="M16 6c-1.2 2.4-5 8.2-5 12.2 0 3.2 2.2 5.8 5 5.8s5-2.6 5-5.8C21 14.2 17.2 8.4 16 6zm0 15c-1.7 0-3-1.3-3-3 0-1.4 1.3-3.6 3-6.2 1.7 2.6 3 4.8 3 6.2 0 1.7-1.3 3-3 3z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= HYPE (Hyperliquid) =================
      case 'HYPE':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#04201E" stroke="#00F5B8" strokeWidth="1.5" />
            <path
              d="M9 8h3.2v6.5h7.6V8H23v16h-3.2v-6.5h-7.6V24H9V8z"
              fill="#00F5B8"
            />
            <circle cx="16" cy="14.5" r="1.5" fill="#FFFFFF" />
          </svg>
        );

      // ================= AVAX =================
      case 'AVAX':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#E84142" />
            <path
              d="M17.8 7.8c-.8-1.4-2.8-1.4-3.6 0L6.4 21.4c-.8 1.4.2 3.1 1.8 3.1h4.4c.8 0 1.5-.4 1.9-1.1l3.5-6.2 3.5 6.2c.4.7 1.1 1.1 1.9 1.1h4.4c1.6 0 2.6-1.7 1.8-3.1L17.8 7.8z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= LINK =================
      case 'LINK':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#375BD2" />
            <path
              d="M16 6.5l8.2 4.7v9.6L16 25.5l-8.2-4.7v-9.6L16 6.5zm5.5 12.5V13l-5.5-3.2-5.5 3.2v6l5.5 3.2 5.5-3.2z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= ADA (Cardano) =================
      case 'ADA':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0033AD" />
            <circle cx="16" cy="16" r="3.2" fill="#FFFFFF" />
            {/* Constellation dots */}
            <circle cx="16" cy="8.5" r="1.4" fill="#FFFFFF" />
            <circle cx="16" cy="23.5" r="1.4" fill="#FFFFFF" />
            <circle cx="8.5" cy="16" r="1.4" fill="#FFFFFF" />
            <circle cx="23.5" cy="16" r="1.4" fill="#FFFFFF" />
            <circle cx="10.8" cy="10.8" r="1.2" fill="#FFFFFF" />
            <circle cx="21.2" cy="10.8" r="1.2" fill="#FFFFFF" />
            <circle cx="10.8" cy="21.2" r="1.2" fill="#FFFFFF" />
            <circle cx="21.2" cy="21.2" r="1.2" fill="#FFFFFF" />
          </svg>
        );

      // ================= NEAR =================
      case 'NEAR':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#111827" />
            <path
              d="M9.5 23.5V8.5h3.4l6.8 9.8V8.5h2.8v15h-3.2l-7-10.2v10.2H9.5z"
              fill="#00FFA3"
            />
          </svg>
        );

      // ================= AAVE =================
      case 'AAVE':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#2B2D3C" />
            <circle cx="16" cy="16" r="14" fill="#7C5FE6" />
            {/* Friendly ghost */}
            <path
              d="M16 8c-3.8 0-7 3.2-7 7.2v7.8l2.3-1.8 2.3 1.8 2.4-1.8 2.4 1.8 2.3-1.8 2.3 1.8v-7.8c0-4-3.2-7.2-7-7.2z"
              fill="#FFFFFF"
            />
            <circle cx="13.5" cy="14" r="1.5" fill="#2B2D3C" />
            <circle cx="18.5" cy="14" r="1.5" fill="#2B2D3C" />
          </svg>
        );

      // ================= TON =================
      case 'TON':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0098EA" />
            <path
              d="M8.5 11l7.5-4 7.5 4-7.5 14L8.5 11z"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill="none"
            />
            <line x1="16" y1="7" x2="16" y2="25" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="8.5" y1="11" x2="23.5" y2="11" stroke="#FFFFFF" strokeWidth="1.5" />
          </svg>
        );

      // ================= ARB =================
      case 'ARB':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#28A0F0" />
            <path
              d="M16 6l9 5.2v10.4L16 26.8l-9-5.2V11.2L16 6z"
              fill="#182333"
            />
            <path
              d="M16 8.5l6.5 11.5h-3.2l-3.3-6.2-3.3 6.2H9.5L16 8.5z"
              fill="#28A0F0"
            />
          </svg>
        );

      // ================= PEPE =================
      case 'PEPE':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#4B963E" />
            {/* Pepe silhouette eyes & grin */}
            <ellipse cx="12" cy="13" rx="3.5" ry="3" fill="#FFFFFF" />
            <circle cx="12.5" cy="13" r="1.5" fill="#000000" />
            <ellipse cx="20" cy="13" rx="3.5" ry="3" fill="#FFFFFF" />
            <circle cx="20.5" cy="13" r="1.5" fill="#000000" />
            <path
              d="M9 19c2 3.5 12 3.5 14 0"
              stroke="#8B2500"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M9 19.5c2 2 12 2 14 0"
              stroke="#D32F2F"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        );

      // ================= USDC =================
      case 'USDC':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#2775CA" />
            <path
              d="M19.5 17.5c0-2-1.5-2.8-3.5-3.1-1.3-.2-1.8-.6-1.8-1.2 0-.7.6-1.1 1.7-1.1 1.3 0 2 .5 2.1 1.3h1.8c-.2-1.6-1.4-2.6-3.1-2.8V9h-1.5v1.6c-1.8.3-2.9 1.4-2.9 2.8 0 1.9 1.3 2.7 3.3 3.1 1.4.3 2 .6 2 1.3 0 .8-.8 1.2-1.8 1.2-1.4 0-2.3-.6-2.4-1.5h-1.9c.1 1.7 1.3 2.8 3.4 3.1V23h1.5v-1.6c1.8-.3 3.1-1.4 3.1-3.9z"
              fill="#FFFFFF"
            />
            <circle cx="16" cy="16" r="11" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          </svg>
        );

      // ================= USDT =================
      case 'USDT':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#26A17B" />
            <path
              d="M17.8 15.6v-1.2h4.5v-3.2h-12.6v3.2h4.5v1.2c-4 .3-7 1.4-7 2.8s3 2.5 7 2.8v4.8h3.6v-4.8c4-.3 7-1.4 7-2.8s-3-2.5-7-2.8zm0 4.2c-3.1 0-5.7-.6-6.4-1.4.7-.8 3.3-1.4 6.4-1.4s5.7.6 6.4 1.4c-.7.8-3.3 1.4-6.4 1.4z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= TRX / TRON =================
      case 'TRX':
      case 'TRON':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#EF0027" />
            <path
              d="M6 7l20 5.5-12 14.5L6 7zm3 3.5l12.5 3.5-7.5 9-5-12.5zm6.5 1.8l-1.5 6 4-2.5-2.5-3.5z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= NEXO (Nexora DEX) =================
      case 'NEXO':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0A1124" stroke="#00D2FF" strokeWidth="1.2" />
            <polygon points="16 5 25 10 25 22 16 27 7 22 7 10" fill="none" stroke="#00D2FF" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="4.5" fill="#00D2FF" />
            <circle cx="16" cy="16" r="2" fill="#FFFFFF" />
            <line x1="16" y1="5" x2="16" y2="11.5" stroke="#00D2FF" strokeWidth="1.5" />
            <line x1="16" y1="20.5" x2="16" y2="27" stroke="#00D2FF" strokeWidth="1.5" />
            <line x1="7" y1="10" x2="12" y2="13.5" stroke="#00D2FF" strokeWidth="1.5" />
            <line x1="20" y1="18.5" x2="25" y2="22" stroke="#00D2FF" strokeWidth="1.5" />
          </svg>
        );

      // ================= UNI =================
      case 'UNI':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#FF007A" />
            <path
              d="M20.5 9c-.5 0-1 .3-1.3.8-.4.7-.2 1.6.4 2.1l.6.5c-1.8 1.4-3.5 3.3-4.6 5.5-.3.6-.8 1.6-.8 1.6s-.5-1-.8-1.6c-1.1-2.2-2.8-4.1-4.6-5.5l.6-.5c.6-.5.8-1.4.4-2.1-.3-.5-.8-.8-1.3-.8-1 0-1.8.8-1.7 1.8.1 1.2.7 2.3 1.6 3.1l.7.6c-.3 1.3-.3 2.7 0 4 .8 3.5 3.8 6.1 7.4 6.1s6.6-2.6 7.4-6.1c.3-1.3.3-2.7 0-4l.7-.6c.9-.8 1.5-1.9 1.6-3.1.2-1-.6-1.8-1.7-1.8z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= OP =================
      case 'OP':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#FF0420" />
            <circle cx="11.5" cy="16" r="4.2" stroke="#FFFFFF" strokeWidth="2.8" fill="none" />
            <path d="M17.5 11.8h4.5c2.3 0 4.2 1.9 4.2 4.2s-1.9 4.2-4.2 4.2h-2v4.8h-2.5V11.8zm2.5 5.8h1.8c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H20v3.6z" fill="#FFFFFF" />
          </svg>
        );

      // ================= APT =================
      case 'APT':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#1A1E29" />
            <path d="M16 6L7 22h3.5l1.8-3.4h7.4l1.8 3.4H25L16 6zm0 5.8l2.5 4.8h-5L16 11.8z" fill="#21D4FD" />
            <line x1="8" y1="24.5" x2="24" y2="24.5" stroke="#21D4FD" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );

      // ================= INJ =================
      case 'INJ':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0A0E1A" />
            <path d="M11 8c3 0 5 2 5 5s-2 5-5 5H8V8h3zm0 7c1.7 0 2.8-1.1 2.8-2.8S12.7 9.4 11 9.4h-.8v5.6H11z" fill="#00B4FF" />
            <path d="M21 24c-3 0-5-2-5-5s2-5 5-5h3v10h-3zm0-7c-1.7 0-2.8 1.1-2.8 2.8s1.1 2.8 2.8 2.8h.8v-5.6H21z" fill="#00F5FF" />
          </svg>
        );

      // ================= TIA =================
      case 'TIA':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#7B3FE4" />
            <circle cx="16" cy="16" r="6.5" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
            <circle cx="16" cy="16" r="2.2" fill="#FFFFFF" />
            <circle cx="16" cy="6.5" r="1.5" fill="#FFFFFF" />
            <circle cx="25.5" cy="16" r="1.5" fill="#FFFFFF" />
            <circle cx="16" cy="25.5" r="1.5" fill="#FFFFFF" />
            <circle cx="6.5" cy="16" r="1.5" fill="#FFFFFF" />
          </svg>
        );

      // ================= RENDER =================
      case 'RENDER':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0E121B" />
            <circle cx="16" cy="16" r="6" stroke="#EB3535" strokeWidth="2" fill="none" />
            <circle cx="16" cy="16" r="2.5" fill="#EB3535" />
            <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="#EB3535" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      // ================= SHIB =================
      case 'SHIB':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#FFA409" />
            <polygon points="10 8 13 14 8 14" fill="#662D00" />
            <polygon points="22 8 24 14 19 14" fill="#662D00" />
            <circle cx="16" cy="18" r="7" fill="#FFFFFF" />
            <ellipse cx="13" cy="17" rx="1.5" ry="2" fill="#000000" />
            <ellipse cx="19" cy="17" rx="1.5" ry="2" fill="#000000" />
            <polygon points="16 19 14.5 21 17.5 21" fill="#000000" />
          </svg>
        );

      // ================= WIF =================
      case 'WIF':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#CD853F" />
            <path d="M9 13c0-3.5 3.5-5 7-5s7 1.5 7 5c0 4-3 9-7 9s-7-5-7-9z" fill="#FFF8DC" />
            {/* The pink beanie hat */}
            <path d="M10 11c1-4 4-6 6-6s5 2 6 6H10z" fill="#FF69B4" />
            <rect x="9" y="10" width="14" height="2" rx="1" fill="#FF1493" />
            <circle cx="13.5" cy="14.5" r="1.2" fill="#000000" />
            <circle cx="18.5" cy="14.5" r="1.2" fill="#000000" />
            <ellipse cx="16" cy="17" rx="1.5" ry="1" fill="#000000" />
          </svg>
        );

      // ================= BONK =================
      case 'BONK':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#FF8C00" />
            <circle cx="16" cy="17" r="7.5" fill="#FFE4B5" />
            <polygon points="11 9 13.5 13 9 13" fill="#D2691E" />
            <polygon points="21 9 23 13 18.5 13" fill="#D2691E" />
            <ellipse cx="13" cy="16" rx="1.2" ry="1.8" fill="#000000" />
            <ellipse cx="19" cy="16" rx="1.2" ry="1.8" fill="#000000" />
            <polygon points="16 18 14.5 20 17.5 20" fill="#000000" />
            <path d="M14 21c1 1.5 3 1.5 4 0" stroke="#FF4500" strokeWidth="1.2" fill="none" />
          </svg>
        );

      // ================= FLOKI =================
      case 'FLOKI':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#141824" stroke="#EBA834" strokeWidth="1.2" />
            {/* Viking Helmet */}
            <path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6H10z" fill="#EBA834" />
            <path d="M9 14c-2-2-2-5-1-6 2 1 3 3 3 5l-2 1z" fill="#FFFFFF" />
            <path d="M23 14c2-2 2-5 1-6-2 1-3 3-3 5l2 1z" fill="#FFFFFF" />
            <circle cx="16" cy="19" r="4.5" fill="#EBA834" />
            <circle cx="14" cy="18.5" r="1" fill="#000000" />
            <circle cx="18" cy="18.5" r="1" fill="#000000" />
          </svg>
        );

      // ================= KAS (Kaspa) =================
      case 'KAS':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#70C7BA" />
            <path d="M12 9v14h3.5v-6.5l4.5 6.5h4.2l-5.6-7.8 5.2-6.2h-4.3l-4 5V9H12z" fill="#FFFFFF" />
          </svg>
        );

      // ================= FET =================
      case 'FET':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#183884" />
            <circle cx="16" cy="16" r="3.5" fill="#FFFFFF" />
            <circle cx="16" cy="8.5" r="2.2" fill="#00D2FF" />
            <circle cx="22.5" cy="12.5" r="2.2" fill="#00D2FF" />
            <circle cx="22.5" cy="19.5" r="2.2" fill="#00D2FF" />
            <circle cx="16" cy="23.5" r="2.2" fill="#00D2FF" />
            <circle cx="9.5" cy="19.5" r="2.2" fill="#00D2FF" />
            <circle cx="9.5" cy="12.5" r="2.2" fill="#00D2FF" />
          </svg>
        );

      // ================= LDO =================
      case 'LDO':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0A1628" />
            <polygon points="16 6 22 17 16 14 10 17" fill="#00A3FF" />
            <polygon points="16 15 22 18 16 26 10 18" fill="#FFB800" />
          </svg>
        );

      // ================= MKR =================
      case 'MKR':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#1AAB9B" />
            <path d="M9 10v12h2.5v-7.5l3.5 5.5h2l3.5-5.5V22H23V10h-2.5l-4.5 7.2L11.5 10H9z" fill="#FFFFFF" />
          </svg>
        );

      // ================= TAO =================
      case 'TAO':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#111111" stroke="#444444" strokeWidth="1" />
            <path d="M16 7v18M10 11h12M12 17h8M14 23h4" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        );

      // ================= SEI =================
      case 'SEI':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#9B1E37" />
            <path d="M21 11c-1.5-1.5-4-1.5-5.5 0L10 16.5c-1.5 1.5-1.5 4 0 5.5s4 1.5 5.5 0l5.5-5.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        );

      // ================= REAL STOCK LOGOS =================
      // ================= NVDA (NVIDIA) =================
      case 'NVDA':
        return (
          <div
            className="rounded-full overflow-hidden bg-white shrink-0 flex items-center justify-center p-0.5 border border-white/20 shadow-sm"
            style={{ width: pixelSize, height: pixelSize }}
          >
            <img
              src="/assets/aistudio/nvidia-logo-vert-blk_thmb_f575aaf5.png"
              alt="NVIDIA"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
        );

      // ================= AAPL (Apple) =================
      case 'AAPL':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#111318" stroke="#252A36" strokeWidth="1" />
            <path
              d="M17.5 7.5c.8-.9 1.4-2.2 1.2-3.5-1.2.1-2.6.8-3.4 1.7-.7.8-1.3 2.1-1.1 3.4 1.3.1 2.5-.7 3.3-1.6z"
              fill="#FFFFFF"
            />
            <path
              d="M21.2 17.8c-.1-2.8 2.3-4.1 2.4-4.2-1.3-1.9-3.3-2.2-4-2.2-1.7-.2-3.4 1-4.3 1-.9 0-2.2-1-3.6-1-1.9 0-3.6 1.1-4.6 2.8-2 3.5-.5 8.6 1.4 11.4 1 1.4 2.1 2.9 3.6 2.8 1.5-.1 2.1-1 3.8-1s2.3 1 3.8 1c1.6 0 2.6-1.4 3.6-2.8 1.1-1.6 1.6-3.2 1.6-3.3-.1 0-3.1-1.2-3.3-4.5z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // ================= TSLA (Tesla) =================
      case 'TSLA':
        return (
          <div
            className="rounded-full overflow-hidden bg-[#D81B26] shrink-0 flex items-center justify-center shadow-sm border border-red-500/30"
            style={{ width: pixelSize, height: pixelSize }}
          >
            <img
              src="/assets/aistudio/360_F_891794895_mJWe8OORs49hzUdHl9CF1pwlULOWIpD8_4b469094.jpg"
              alt="Tesla"
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
          </div>
        );

      // ================= MSFT (Microsoft) =================
      case 'MSFT':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0F172A" />
            <rect x="8.5" y="8.5" width="6.5" height="6.5" fill="#F25022" rx="0.5" />
            <rect x="17" y="8.5" width="6.5" height="6.5" fill="#7FBA00" rx="0.5" />
            <rect x="8.5" y="17" width="6.5" height="6.5" fill="#00A4EF" rx="0.5" />
            <rect x="17" y="17" width="6.5" height="6.5" fill="#FFB900" rx="0.5" />
          </svg>
        );

      // ================= META (Meta Platforms) =================
      case 'META':
        return (
          <div
            className="rounded-full overflow-hidden bg-white shrink-0 flex items-center justify-center p-0.5 border border-white/20 shadow-sm"
            style={{ width: pixelSize, height: pixelSize }}
          >
            <img
              src="/assets/aistudio/images__1__bc6b48b9.png"
              alt="Meta"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
        );

      // ================= GOOGL / GOOG (Alphabet) =================
      case 'GOOGL':
      case 'GOOG':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#141824" stroke="#252A36" strokeWidth="1" />
            <path
              d="M23.6 16.2c0-.6-.05-1.2-.15-1.8H16v3.4h4.3c-.2 1-.7 1.9-1.6 2.5v2h2.6c1.5-1.4 2.3-3.5 2.3-6.1z"
              fill="#4285F4"
            />
            <path
              d="M16 24c2.2 0 4-.7 5.3-2l-2.6-2c-.7.5-1.6.8-2.7.8-2.1 0-3.9-1.4-4.5-3.3h-2.7v2.1C10.2 22.2 12.9 24 16 24z"
              fill="#34A853"
            />
            <path
              d="M11.5 17.5c-.1-.7-.2-1.3-.2-2s.1-1.3.2-2V11.4H8.8c-.6 1.2-.9 2.6-.9 4.1s.3 2.9.9 4.1l2.7-2.1z"
              fill="#FBBC05"
            />
            <path
              d="M16 10.7c1.2 0 2.2.4 3.1 1.2l2.3-2.3C20 8.4 18.2 7.7 16 7.7c-3.1 0-5.8 1.8-7.2 4.4l2.7 2.1c.6-1.9 2.4-3.5 4.5-3.5z"
              fill="#EA4335"
            />
          </svg>
        );

      // ================= AMZN (Amazon) =================
      case 'AMZN':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#141926" stroke="#252C3D" strokeWidth="1" />
            <path
              d="M14.5 9.5c-2.8 0-4.5 1.5-4.5 3.8 0 2.4 1.7 3.5 3.8 3.5 1.5 0 2.7-.6 3.4-1.5v1.2h2.4V9.8h-2.4v1c-.7-.8-1.6-1.3-2.7-1.3zm.4 5.5c-1.3 0-2.2-.7-2.2-1.9 0-1.1.9-1.9 2.2-1.9 1.1 0 2 .7 2.2 1.8 0 1.2-.9 2-2.2 2z"
              fill="#FFFFFF"
            />
            <path
              d="M8.5 20.5c4.5 2.5 10.5 2.5 14.5-.5.4-.3.9.2.6.6-4.5 3.5-11 3.5-15.5.5-.3-.2 0-.8.4-.6z"
              fill="#FF9900"
            />
            <path d="M23.5 19.8l1.2 2.2-2.4-.2 1.2-2z" fill="#FF9900" />
          </svg>
        );

      // ================= PLTR (Palantir) =================
      case 'PLTR':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0A0D14" stroke="#242B3B" strokeWidth="1" />
            <circle cx="16" cy="14.5" r="5" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
            <line x1="16" y1="20" x2="16" y2="24" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="12" y1="24" x2="20" y2="24" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      // ================= MSTR (MicroStrategy) =================
      case 'MSTR':
        return (
          <div
            className="rounded-full overflow-hidden bg-[#D9272E] shrink-0 flex items-center justify-center shadow-sm"
            style={{ width: pixelSize, height: pixelSize }}
          >
            <img
              src="/assets/aistudio/images__3__fd6b00d2.png"
              alt="MicroStrategy"
              className="w-full h-full object-cover rounded-full"
              loading="eager"
            />
          </div>
        );

      // ================= COIN (Coinbase) =================
      case 'COIN':
        return (
          <div
            className="rounded-full overflow-hidden bg-[#0052FF] shrink-0 flex items-center justify-center shadow-sm"
            style={{ width: pixelSize, height: pixelSize }}
          >
            <img
              src="/assets/aistudio/images__2__b0ea1011.png"
              alt="Coinbase"
              className="w-full h-full object-cover rounded-full"
              loading="eager"
            />
          </div>
        );

      // ================= AMD =================
      case 'AMD':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0A0E14" stroke="#008A00" strokeWidth="1" />
            <path d="M10 9h5v5l-5-5z" fill="#008A00" />
            <path d="M10 23h5v-5l-5 5z" fill="#008A00" />
            <path d="M16 9h6v14h-6v-3.5h3.5v-7H16V9z" fill="#008A00" />
            <polygon points="10 14.5 15 14.5 15 17.5 10 17.5" fill="#008A00" />
          </svg>
        );

      // ================= HOOD (Robinhood) =================
      case 'HOOD':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0B150F" stroke="#21CE99" strokeWidth="1" />
            <path
              d="M19.5 8.5c-3 1.5-6.5 5.5-7.5 10.5-.3 1.5-.2 2.8.2 3.8.3.7 1.2.7 1.5 0 .5-1.2 1.2-2.5 2.2-3.5 1.5-1.5 3.5-2.8 4.8-4.2 1.4-1.5 1.8-3.5 1.2-5.2-.2-.6-.9-1.8-2.4-1.4z"
              fill="#00C805"
            />
            <path
              d="M12.5 18c1.5-2 3.8-3.8 6.5-4.8-.8 2.2-2.5 4.2-4.5 5.5-1 0-1.7-.3-2-.7z"
              fill="#21CE99"
            />
          </svg>
        );

      // ================= NFLX (Netflix) =================
      case 'NFLX':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#08080A" stroke="#E50914" strokeWidth="1" />
            <rect x="9.5" y="8" width="3.2" height="16" fill="#E50914" />
            <rect x="19.3" y="8" width="3.2" height="16" fill="#E50914" />
            <polygon points="9.5 8 13.5 8 22.5 24 18.5 24" fill="#B81D24" />
            <polygon points="9.5 8 12.8 8 22.5 24 19.3 24" fill="#E50914" />
          </svg>
        );

      // ================= BABA (Alibaba) =================
      case 'BABA':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#FF6A00" />
            <path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6c0 3.3-2.7 6-6 6s-6-2.7-6-6z" fill="#FFFFFF" />
            <path d="M12 16.5c1.2 2 3 2.5 5 2 1.8-.5 2.8-2 3-3.5-.8 1-2 1.8-3.5 1.8-1.8 0-3.3-1-4.5-.3z" fill="#FF6A00" />
            <circle cx="17.5" cy="13.5" r="1" fill="#FF6A00" />
          </svg>
        );

      // ================= INTC (Intel) =================
      case 'INTC':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0068B5" />
            <rect x="8.5" y="11" width="2" height="2" fill="#FFFFFF" />
            <rect x="8.5" y="14" width="2" height="7" fill="#FFFFFF" />
            <path d="M12 14v7h2v-4.5c0-1 .8-1.5 1.8-1.5s1.7.5 1.7 1.5V21h2v-4.8c0-2-1.2-3.2-3-3.2-1.2 0-2.2.6-2.5 1.5V14H12z" fill="#FFFFFF" />
            <path d="M21 16h2.5c0-1.8-1.2-3-3-3-2.2 0-3.5 1.8-3.5 4s1.3 4 3.5 4c1.8 0 3-1 3-2.5H21.5c-.3.5-.8.8-1.5.8-1 0-1.8-.8-1.8-2.3h5.3v-.5c0-.2 0-.5-.5-.5z" fill="#FFFFFF" />
          </svg>
        );

      // ================= SOXL (Semiconductor 3x) =================
      case 'SOXL':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0B1A28" stroke="#00D2FF" strokeWidth="1" />
            <rect x="10" y="10" width="12" height="12" rx="2" fill="#142C44" stroke="#00D2FF" strokeWidth="1.2" />
            <rect x="12" y="12" width="8" height="8" rx="1" fill="#00D2FF" />
            <text x="16" y="18" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#000000" fontFamily="sans-serif">3X</text>
            <line x1="12" y1="8" x2="12" y2="10" stroke="#00D2FF" strokeWidth="1.2" />
            <line x1="16" y1="8" x2="16" y2="10" stroke="#00D2FF" strokeWidth="1.2" />
            <line x1="20" y1="8" x2="20" y2="10" stroke="#00D2FF" strokeWidth="1.2" />
            <line x1="12" y1="22" x2="12" y2="24" stroke="#00D2FF" strokeWidth="1.2" />
            <line x1="16" y1="22" x2="16" y2="24" stroke="#00D2FF" strokeWidth="1.2" />
            <line x1="20" y1="22" x2="20" y2="24" stroke="#00D2FF" strokeWidth="1.2" />
          </svg>
        );

      // ================= SP500 / SPX / SPY (S&P 500 Index) =================
      case 'SP500':
      case 'SPX':
      case 'SPY':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#E31B23" stroke="#FF4D52" strokeWidth="0.8" />
            <circle cx="16" cy="16" r="14" fill="none" stroke="#FFFFFF" strokeWidth="0.4" strokeOpacity="0.4" />
            <text x="16" y="15" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">S&amp;P</text>
            <line x1="8" y1="18" x2="24" y2="18" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
            <text x="16" y="25" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFE5E5" fontFamily="monospace">500</text>
          </svg>
        );

      // ================= USTECH / NDX / QQQ (Nasdaq 100 Index) =================
      case 'USTECH':
      case 'NDX':
      case 'NASDAQ':
      case 'QQQ':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#001C3D" stroke="#00A3E0" strokeWidth="1" />
            {/* Dynamic multifaceted helix bands */}
            <polygon points="9 8 13 8 23 24 19 24" fill="#00A3E0" />
            <polygon points="12 8 16 8 20 15 16 15" fill="#FFFFFF" opacity="0.9" />
            <polygon points="16 17 20 24 16 24 12 17" fill="#005B94" />
            <text x="16" y="28" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#00D2FF" fontFamily="monospace">100</text>
          </svg>
        );

      // ================= XYZ100 (Crypto Top 100 Index) =================
      case 'XYZ100':
      case 'CRYPTO100':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#080C16" stroke="#00D2FF" strokeWidth="1" />
            {/* Orbit constellation ring */}
            <circle cx="16" cy="14" r="6.5" stroke="#00D2FF" strokeWidth="1" strokeDasharray="3 2" fill="none" />
            {/* Tri-nodes (BTC gold, ETH indigo, SOL mint) */}
            <circle cx="16" cy="7.5" r="2.2" fill="#F7931A" />
            <circle cx="10" cy="18" r="2.2" fill="#627EEA" />
            <circle cx="22" cy="18" r="2.2" fill="#14F195" />
            {/* Connecting lines */}
            <line x1="16" y1="7.5" x2="10" y2="18" stroke="#00D2FF" strokeWidth="1" opacity="0.6" />
            <line x1="16" y1="7.5" x2="22" y2="18" stroke="#00D2FF" strokeWidth="1" opacity="0.6" />
            <line x1="10" y1="18" x2="22" y2="18" stroke="#00D2FF" strokeWidth="1" opacity="0.6" />
            {/* 100 text */}
            <text x="16" y="26" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="monospace">100</text>
          </svg>
        );

      // ================= JP225 / N225 (Nikkei 225 Index) =================
      case 'JP225':
      case 'N225':
      case 'NIKKEI':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0E121A" stroke="#BC002D" strokeWidth="1" />
            {/* Rising Sun Red Circle */}
            <circle cx="16" cy="13" r="6.5" fill="#BC002D" />
            {/* Stylized Mt. Fuji silhouette in white */}
            <polygon points="16 9 20 16 12 16" fill="#FFFFFF" />
            <polygon points="16 9 17.5 11.5 14.5 11.5" fill="#FFFFFF" />
            {/* 225 text */}
            <text x="16" y="24" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="monospace">225</text>
          </svg>
        );

      // ================= SMALL2000 / RUT / IWM (Russell 2000 Index) =================
      case 'SMALL2000':
      case 'RUT':
      case 'IWM':
      case 'RUSSELL':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0A182E" stroke="#00B050" strokeWidth="1" />
            {/* Interlocking compass arcs */}
            <path d="M10 16a6 6 0 0 1 12 0" stroke="#00B050" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M16 10a6 6 0 0 1 6 6" stroke="#00A3E0" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* R 2000 text */}
            <text x="16" y="18" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">R</text>
            <text x="16" y="25" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#00D2FF" fontFamily="monospace">2000</text>
          </svg>
        );

      // ================= DJI / DOW / US30 (Dow Jones Industrial Average) =================
      case 'DJI':
      case 'DOW':
      case 'US30':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#0A1C3C" stroke="#D4AF37" strokeWidth="1" />
            <polygon points="16 7 17.5 10 21 10.5 18.5 12.5 19 16 16 14.5 13 16 13.5 12.5 11 10.5 14.5 10" fill="#D4AF37" />
            <text x="16" y="21" textAnchor="middle" fontSize="5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">DOW</text>
            <text x="16" y="26.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#D4AF37" fontFamily="monospace">30</text>
          </svg>
        );

      // ================= DAX / GER40 (German DAX 40 Index) =================
      case 'DAX':
      case 'GER40':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#001838" stroke="#FFCC00" strokeWidth="1" />
            <polygon points="10 9 17 9 22 16 17 23 10 23 15 16" fill="#FFCC00" />
            <polygon points="15 11 19 16 15 21" fill="#00A3E0" />
            <text x="16" y="28" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#FFFFFF" fontFamily="sans-serif">DAX</text>
          </svg>
        );

      // ================= FTSE / UK100 (FTSE 100 Index) =================
      case 'FTSE':
      case 'UK100':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#091830" stroke="#C8102E" strokeWidth="1" />
            <path d="M9 13c3-3 11-3 14 0" stroke="#C8102E" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M11 16c2-2 8-2 10 0" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <text x="16" y="24" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="monospace">100</text>
          </svg>
        );

      // ================= VIX (CBOE Volatility Index) =================
      case 'VIX':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#130D1B" stroke="#FF7700" strokeWidth="1" />
            <path d="M6 16h4l2-6 3 12 3-8 2 4h6" stroke="#FF7700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <text x="16" y="26" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#FFFFFF" fontFamily="monospace">VIX</text>
          </svg>
        );

      // ================= DXY / USDX (US Dollar Index) =================
      case 'DXY':
      case 'USDX':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#092618" stroke="#10B981" strokeWidth="1" />
            <circle cx="16" cy="16" r="13" stroke="#10B981" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#10B981" fontFamily="sans-serif">$</text>
            <text x="16" y="27" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#FFFFFF" fontFamily="monospace">DXY</text>
          </svg>
        );

      // ================= CAC40 / CAC / FRA40 =================
      case 'CAC40':
      case 'CAC':
      case 'FRA40':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#051C3B" stroke="#0055A4" strokeWidth="0.8" />
            <path d="M8 11c5-3.5 11-3.5 16 0" stroke="#EF4135" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <text x="16" y="19" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">CAC</text>
            <text x="16" y="26" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#EF4135" fontFamily="monospace">40</text>
          </svg>
        );

      // ================= HSI / HK50 =================
      case 'HSI':
      case 'HK50':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#05331C" stroke="#10B981" strokeWidth="0.8" />
            <polygon points="16,7 22,11 22,17 16,21 10,17 10,11" fill="#EF4444" stroke="#D4AF37" strokeWidth="0.5" />
            <circle cx="16" cy="14" r="3" fill="#FFFFFF" />
            <circle cx="16" cy="14" r="1.8" fill="#B91C1C" />
            <text x="16" y="26" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">HSI 50</text>
          </svg>
        );

      // ================= GOLD / GLD / XAU / PAXG =================
      case 'GOLD':
      case 'GLD':
      case 'XAU':
      case 'PAXG':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#1C1507" stroke="#D4AF37" strokeWidth="1.2" />
            <circle cx="16" cy="16" r="13.8" fill="none" stroke="#F59E0B" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* 3D Gold Ingot */}
            <polygon points="8,13 22,11 24,14 10,16" fill="#FFFBEB" />
            <polygon points="10,16 24,14 22,23 8,25" fill="#F59E0B" />
            <polygon points="24,14 26,15 24,24 22,23" fill="#B45309" />
            {/* Stamp */}
            <text x="15" y="21" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#78350F" fontFamily="sans-serif">999.9</text>
            <text x="16.5" y="14" textAnchor="middle" fontSize="2" fontWeight="bold" fill="#B45309" fontFamily="sans-serif">Au</text>
            {/* Sparkle */}
            <circle cx="10" cy="16" r="1.2" fill="#FFFFFF" opacity="0.9" />
          </svg>
        );

      // ================= SILVER / SLV / XAG =================
      case 'SILVER':
      case 'SLV':
      case 'XAG':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#141820" stroke="#CBD5E1" strokeWidth="1.2" />
            <circle cx="16" cy="16" r="13.8" fill="none" stroke="#94A3B8" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* 3D Silver Ingot */}
            <polygon points="8,13 22,11 24,14 10,16" fill="#FFFFFF" />
            <polygon points="10,16 24,14 22,23 8,25" fill="#94A3B8" />
            <polygon points="24,14 26,15 24,24 22,23" fill="#475569" />
            {/* Stamp */}
            <text x="15" y="21" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#1E293B" fontFamily="sans-serif">999.0</text>
            <text x="16.5" y="14" textAnchor="middle" fontSize="2" fontWeight="bold" fill="#475569" fontFamily="sans-serif">Ag</text>
            {/* Sparkle */}
            <circle cx="10" cy="16" r="1.2" fill="#FFFFFF" opacity="0.9" />
          </svg>
        );

      // ================= OIL / USOIL / CL / WTI =================
      case 'OIL':
      case 'USOIL':
      case 'CL':
      case 'WTI':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#150E06" stroke="#F97316" strokeWidth="1.2" />
            {/* Steel Drum Barrel */}
            <path d="M10 11c0 0 0 11 0 11.5 0 1.5 2.7 2.5 6 2.5s6-1 6-2.5V11z" fill="#374151" />
            <ellipse cx="16" cy="11" rx="6" ry="2" fill="#4B5563" stroke="#9CA3AF" strokeWidth="0.5" />
            {/* Chime Ribs */}
            <path d="M10 15c0 1 2.7 1.8 6 1.8s6-.8 6-1.8" stroke="#9CA3AF" strokeWidth="0.7" fill="none" />
            <path d="M10 19.5c0 1 2.7 1.8 6 1.8s6-.8 6-1.8" stroke="#9CA3AF" strokeWidth="0.7" fill="none" />
            {/* Oil Drop In Center */}
            <path d="M16 14c-1.5 2-2.5 3.5-2.5 5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0-1.5-1-3-2.5-5z" fill="#F97316" />
            <circle cx="15.5" cy="19" r="0.6" fill="#FED7AA" />
          </svg>
        );

      // ================= BRENTOIL / BRENT =================
      case 'BRENTOIL':
      case 'BRENT':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#081422" stroke="#38BDF8" strokeWidth="1.2" />
            {/* Sea Waves */}
            <path d="M7 23q4.5-1 9 0t9 0v3H7z" fill="#0C2033" />
            {/* Offshore Rig Silhouette */}
            <line x1="10" y1="23" x2="13" y2="15" stroke="#94A3B8" strokeWidth="1" />
            <line x1="22" y1="23" x2="19" y2="15" stroke="#94A3B8" strokeWidth="1" />
            <line x1="13" y1="15" x2="15" y2="9" stroke="#CBD5E1" strokeWidth="0.8" />
            <line x1="19" y1="15" x2="17" y2="9" stroke="#CBD5E1" strokeWidth="0.8" />
            <line x1="11" y1="20" x2="21" y2="17" stroke="#64748B" strokeWidth="0.5" />
            <line x1="21" y1="20" x2="11" y2="17" stroke="#64748B" strokeWidth="0.5" />
            <rect x="12" y="16" width="8" height="1.5" rx="0.3" fill="#F8FAFC" />
            {/* Flare */}
            <circle cx="23" cy="8" r="2.2" fill="#F97316" />
            <circle cx="23" cy="8" r="1" fill="#FEF08A" />
          </svg>
        );

      // ================= NATGAS / NG / GAS =================
      case 'NATGAS':
      case 'NG':
      case 'GAS':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#041220" stroke="#38BDF8" strokeWidth="1.2" />
            {/* Outer Flame */}
            <path d="M16 6c2.5 4 6.5 6.5 6.5 11 0 4-3 6.5-6.5 6.5s-6.5-2.5-6.5-6.5c0-4.5 4-7 6.5-11z" fill="#0284C7" />
            {/* Mid Flame */}
            <path d="M16 8.5c1.8 3 4.5 5 4.5 8.5 0 2.8-2 4.8-4.5 4.8s-4.5-2-4.5-4.8c0-3.5 2.7-5.5 4.5-8.5z" fill="#38BDF8" />
            {/* Core White Plasma */}
            <path d="M16 12c1 1.8 2.5 3 2.5 5 0 1.5-1.1 2.8-2.5 2.8S13.5 18.5 13.5 17c0-2 1.5-3.2 2.5-5z" fill="#FFFFFF" />
          </svg>
        );

      // ================= COPPER / HG / CPER =================
      case 'COPPER':
      case 'HG':
      case 'CPER':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#1C0904" stroke="#EA580C" strokeWidth="1.2" />
            <circle cx="16" cy="16" r="13.8" fill="none" stroke="#F97316" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* 3D Copper Ingot */}
            <polygon points="8,13 22,11 24,14 10,16" fill="#FED7AA" />
            <polygon points="10,16 24,14 22,23 8,25" fill="#C2410C" />
            <polygon points="24,14 26,15 24,24 22,23" fill="#7C2D12" />
            {/* Stamp */}
            <text x="15" y="21" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#431407" fontFamily="sans-serif">Cu 29</text>
            <text x="16.5" y="14" textAnchor="middle" fontSize="2" fontWeight="bold" fill="#7C2D12" fontFamily="sans-serif">Cu</text>
            {/* Sparkle */}
            <circle cx="10" cy="16" r="1.2" fill="#FFF7ED" opacity="0.9" />
          </svg>
        );

      // ================= PLATINUM / PL / PPLT / XPT =================
      case 'PLATINUM':
      case 'PL':
      case 'PPLT':
      case 'XPT':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#0E121E" stroke="#C7D2FE" strokeWidth="1.2" />
            <circle cx="16" cy="16" r="13.8" fill="none" stroke="#A5B4FC" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* 3D Platinum Ingot */}
            <polygon points="8,13 22,11 24,14 10,16" fill="#FFFFFF" />
            <polygon points="10,16 24,14 22,23 8,25" fill="#94A3B8" />
            <polygon points="24,14 26,15 24,24 22,23" fill="#475569" />
            {/* Stamp */}
            <text x="15" y="21" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#0F172A" fontFamily="sans-serif">Pt 78</text>
            <text x="16.5" y="14" textAnchor="middle" fontSize="2" fontWeight="bold" fill="#334155" fontFamily="sans-serif">Pt</text>
            {/* Sparkle */}
            <circle cx="10" cy="16" r="1.2" fill="#FFFFFF" opacity="0.95" />
          </svg>
        );

      // ================= PALLADIUM / PA / PALL / XPD =================
      case 'PALLADIUM':
      case 'PA':
      case 'PALL':
      case 'XPD':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#0E1216" stroke="#B0BEC5" strokeWidth="1.2" />
            <circle cx="16" cy="16" r="13.8" fill="none" stroke="#78909C" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* 3D Palladium Ingot */}
            <polygon points="8,13 22,11 24,14 10,16" fill="#FFFFFF" />
            <polygon points="10,16 24,14 22,23 8,25" fill="#78909C" />
            <polygon points="24,14 26,15 24,24 22,23" fill="#37474F" />
            {/* Stamp */}
            <text x="15" y="21" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#101820" fontFamily="sans-serif">Pd 46</text>
            <text x="16.5" y="14" textAnchor="middle" fontSize="2" fontWeight="bold" fill="#263238" fontFamily="sans-serif">Pd</text>
            {/* Sparkle */}
            <circle cx="10" cy="16" r="1.2" fill="#ECEFF1" opacity="0.9" />
          </svg>
        );

      // ================= FARTCOIN =================
      case 'FARTCOIN':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#1F0E38" stroke="#A855F7" strokeWidth="1.5" />
            <ellipse cx="14" cy="17" rx="6" ry="5" fill="#10B981" />
            <ellipse cx="18" cy="15" rx="5" ry="4" fill="#34D399" />
            <circle cx="21" cy="12" r="2.5" fill="#6EE7B7" />
            <circle cx="12" cy="12" r="1.5" fill="#A7F3D0" />
            <text x="16" y="27" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#F3E8FF" fontFamily="monospace">FART</text>
          </svg>
        );

      // ================= KPEPE =================
      case 'KPEPE':
        return (
          <svg viewBox="0 0 32 32" width={pixelSize} height={pixelSize} fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="16" fill="#4B8B3B" />
            <ellipse cx="11.5" cy="12.5" rx="4.5" ry="4" fill="#FFFFFF" />
            <ellipse cx="20.5" cy="12.5" rx="4.5" ry="4" fill="#FFFFFF" />
            <circle cx="12" cy="13" r="2" fill="#000000" />
            <circle cx="20" cy="13" r="2" fill="#000000" />
            <path d="M8 20c3 3.5 13 3.5 16 0-3-1-13-1-16 0z" fill="#991B1B" />
            <path d="M7 19c4 3 14 3 18 0" stroke="#000000" strokeWidth="1.5" fill="none" />
          </svg>
        );

      // ================= DEFAULT FALLBACK =================
      default:
        return (
          <div
            style={{ width: pixelSize, height: pixelSize }}
            className="rounded-full bg-gradient-to-tr from-[#1e293b] to-[#334155] border border-cyan-500/40 flex items-center justify-center text-white font-mono font-extrabold text-[10px] shrink-0"
          >
            {sym.slice(0, 3)}
          </div>
        );
    }
  };

  return (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none overflow-hidden ${
        isStock || isCommodity || isIndex ? 'bg-[#0b0f19] border border-white/10' : ''
      } ${getGlowShadow()} ${className}`}
    >
      {currentSrc && !imgError ? (
        <img
          src={currentSrc}
          alt={`${sym} logo`}
          width={pixelSize}
          height={pixelSize}
          loading="lazy"
          className={`w-full h-full rounded-full pointer-events-none ${
            isPaddedStock ? 'object-contain p-0.5' : 'object-cover'
          }`}
          onError={handleImageError}
        />
      ) : (
        renderSvg()
      )}
    </div>
  );
};
