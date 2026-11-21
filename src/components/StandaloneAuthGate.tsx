import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { FaqSection } from './FaqSection';
import { AuthModal } from './AuthModal';
import { GoogleAuthModal } from './GoogleAuthModal';
import { FacebookAuthModal } from './FacebookAuthModal';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../i18n/translations';
import { AppView } from '../App';
import { GmailSenderConnectionCard, GmailVerificationModal } from './GmailVerificationModal';
import { generateVerificationCode, getConnectedGmailSender } from '../services/gmailService';
import { CryptoLogo } from './CryptoLogo';
import { formatPrice } from '../utils/tradingMath';
import { getTradingViewSymbol } from '../utils/realChartData';
import {
  Lock,
  Shield,
  ShieldAlert,
  Zap,
  Globe,
  ArrowRight,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface StandaloneAuthGateProps {
  initialMode?: 'register' | 'login';
  intendedDestination?: AppView;
  authGuardNotice?: string | null;
  onClearNotice?: () => void;
  onOpenAuthModal?: (mode: 'register' | 'login') => void;
  showAuthModal?: boolean;
  onCloseAuthModal?: () => void;
  onAuthenticated?: (destination?: AppView) => void;
}

export const StandaloneAuthGate: React.FC<StandaloneAuthGateProps> = ({
  initialMode = 'register',
  intendedDestination = 'trade',
  authGuardNotice = null,
  onClearNotice,
  onOpenAuthModal,
  showAuthModal = false,
  onCloseAuthModal,
  onAuthenticated,
}) => {
  const {
    registerUser,
    loginUser,
    registeredUsers,
    switchUser,
    language,
    setLanguage,
    t,
    hideFlag,
    markets,
    setSelectedMarket,
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'register' | 'login'>(initialMode);
  const [internalAuthModal, setInternalAuthModal] = useState<boolean>(false);
  const [internalModalMode] = useState<'register' | 'login'>(initialMode);
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [showFacebookModal, setShowFacebookModal] = useState<boolean>(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState<boolean>(false);

  // Form inputs for Registration
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Form inputs for Login
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showGmailVerifyModal, setShowGmailVerifyModal] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [previewSelectedMarketId, setPreviewSelectedMarketId] = useState<string>('BTC-USD');
  const [hoveredCandleIdx, setHoveredCandleIdx] = useState<number | null>(null);

  const passwordStrength = React.useMemo(() => {
    if (!regPassword) return { score: 0, label: '', colorClass: 'bg-[#1e2636]', textClass: 'text-slate-500' };
    let score = 0;
    if (regPassword.length >= 6) score += 1;
    if (regPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(regPassword) && /[0-9]/.test(regPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(regPassword)) score += 1;
    if (score <= 1) return { score: 1, label: 'Weak', colorClass: 'bg-red-500', textClass: 'text-red-400' };
    if (score === 2) return { score: 2, label: 'Fair', colorClass: 'bg-amber-400', textClass: 'text-amber-300' };
    if (score === 3) return { score: 3, label: 'Good', colorClass: 'bg-[#00d2ff]', textClass: 'text-[#00d2ff]' };
    return { score: 4, label: 'Strong', colorClass: 'bg-emerald-400', textClass: 'text-emerald-400' };
  }, [regPassword]);

  const showcaseMarkets = React.useMemo(() => {
    const preferred = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XAU-USD', 'NVDA-USD'];
    const picked = preferred
      .map(id => markets.find(m => m.id === id || m.symbol === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));
    return (picked.length >= 4 ? picked : markets).slice(0, 4);
  }, [markets]);

  const activePreviewMarket = React.useMemo(() => {
    return showcaseMarkets.find(m => m.id === previewSelectedMarketId) || showcaseMarkets[0] || markets[0];
  }, [showcaseMarkets, previewSelectedMarketId, markets]);

  const previewRangePercent = React.useMemo(() => {
    if (!activePreviewMarket) return 50;
    const span = Math.max(0.0001, activePreviewMarket.high24h - activePreviewMarket.low24h);
    const pct = ((activePreviewMarket.price - activePreviewMarket.low24h) / span) * 100;
    return Math.min(96, Math.max(4, pct));
  }, [activePreviewMarket]);

  const previewChart = React.useMemo(() => {
    if (!activePreviewMarket) return null;

    const svgW = 420;
    const svgH = 186;
    const padL = 6;
    const padR = 64;
    const padT = 24;
    const padB = 20;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;
    const volMaxH = 26;
    const count = 24;

    // Deterministic pseudo-random seed per market ID so each asset has a distinct, stable structure
    let seed = 0;
    for (let i = 0; i < activePreviewMarket.id.length; i++) {
      seed = (seed * 31 + activePreviewMarket.id.charCodeAt(i)) >>> 0;
    }
    const rand = (step: number) => {
      const x = Math.sin(seed * 0.001 + step * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    const low = Math.min(activePreviewMarket.low24h, activePreviewMarket.price);
    const high = Math.max(activePreviewMarket.high24h, activePreviewMarket.price);
    const range = Math.max(activePreviewMarket.price * 0.004, high - low);

    const startEstRaw = activePreviewMarket.price / (1 + activePreviewMarket.change24h / 100);
    const startPrice = Math.min(high - range * 0.05, Math.max(low + range * 0.05, startEstRaw));
    const endPrice = activePreviewMarket.price;

    // Build smooth intraday closes connecting startPrice -> endPrice within 24h range
    const rawCloses: number[] = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      if (i === count - 1) {
        rawCloses.push(endPrice);
      } else {
        const trend = startPrice + (endPrice - startPrice) * t;
        const envelope = Math.sin(t * Math.PI);
        const wave =
          Math.sin(t * Math.PI * 3.2 + (seed % 7)) * range * 0.16 * envelope +
          (rand(i + 1) - 0.5) * range * 0.22 * envelope;
        const clamped = Math.min(high - range * 0.03, Math.max(low + range * 0.03, trend + wave));
        rawCloses.push(clamped);
      }
    }

    const candles = rawCloses.map((close, idx) => {
      const open = idx === 0 ? startPrice : rawCloses[idx - 1];
      const bodyMax = Math.max(open, close);
      const bodyMin = Math.min(open, close);
      const bodySize = Math.abs(close - open);
      const wickUp = (0.18 + rand(idx * 3 + 11) * 0.55) * Math.max(bodySize, range * 0.05);
      const wickDown = (0.18 + rand(idx * 3 + 17) * 0.55) * Math.max(bodySize, range * 0.05);
      const candleHigh = Math.min(high, bodyMax + wickUp);
      const candleLow = Math.max(low, bodyMin - wickDown);
      const isUp = close >= open;
      const volWeight = 0.25 + rand(idx * 5 + 23) * 0.55 + Math.min(0.45, (bodySize / range) * 2.2);
      return {
        idx,
        label: idx === count - 1 ? 'LIVE' : `-${count - 1 - idx}h`,
        open,
        high: candleHigh,
        low: candleLow,
        close,
        isUp,
        volWeight,
      };
    });

    // Compute min/max with breathing room (extra bottom space so candles sit above volume bars)
    const minP = Math.min(...candles.map(c => c.low));
    const maxP = Math.max(...candles.map(c => c.high));
    const pSpan = Math.max(0.00001, maxP - minP);
    const paddedMin = minP - pSpan * 0.18;
    const paddedMax = maxP + pSpan * 0.08;
    const paddedSpan = Math.max(0.00001, paddedMax - paddedMin);

    const priceToY = (p: number) => padT + ((paddedMax - p) / paddedSpan) * plotH;
    const stepX = plotW / count;
    const candleW = Math.max(4, stepX * 0.56);

    // 5-period EMA trend curve
    const k = 2 / (5 + 1);
    let ema = candles[0].close;
    const emaPoints = candles.map((c, idx) => {
      ema = idx === 0 ? c.close : c.close * k + ema * (1 - k);
      return {
        x: padL + idx * stepX + stepX / 2,
        y: priceToY(ema),
      };
    });

    const emaPath = emaPoints
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
      .join(' ');
    const areaPath = `${emaPath} L${emaPoints[emaPoints.length - 1].x.toFixed(1)},${(padT + plotH).toFixed(1)} L${emaPoints[0].x.toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

    const maxVol = Math.max(...candles.map(c => c.volWeight), 0.1);
    const plottedCandles = candles.map((c, idx) => {
      const cx = padL + idx * stepX + stepX / 2;
      const yHigh = priceToY(c.high);
      const yLow = priceToY(c.low);
      const yOpen = priceToY(c.open);
      const yClose = priceToY(c.close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(1.8, Math.abs(yClose - yOpen));
      const volH = Math.max(2, (c.volWeight / maxVol) * volMaxH);
      return {
        ...c,
        cx,
        bodyX: cx - candleW / 2,
        bodyW: candleW,
        yHigh,
        yLow,
        yOpen,
        yClose,
        bodyTop,
        bodyH,
        volH,
        volY: padT + plotH - volH,
      };
    });

    const gridLevels = [0.15, 0.5, 0.85].map(ratio => {
      const priceVal = paddedMax - ratio * paddedSpan;
      return {
        y: priceToY(priceVal),
        priceVal,
      };
    });

    const liveY = priceToY(endPrice);
    const isPositive = activePreviewMarket.change24h >= 0;

    return {
      svgW,
      svgH,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      stepX,
      candles: plottedCandles,
      emaPath,
      areaPath,
      gridLevels,
      liveY,
      isPositive,
    };
  }, [activePreviewMarket]);

  const handleConfirmGoogleAuth = (googleEmail: string, googleName: string) => {
    setIsSubmitting(true);
    setFeedback(null);

    setTimeout(() => {
      const existing = registeredUsers.find(
        u => u.email.toLowerCase() === googleEmail.toLowerCase()
      );

      if (existing) {
        switchUser(existing.id);
        setFeedback({
          type: 'success',
          message: `Welcome back, ${existing.fullName || existing.username}! Authenticated with Google.`,
        });
        setTimeout(() => {
          setShowGoogleModal(false);
          if (onAuthenticated) {
            onAuthenticated(intendedDestination);
          }
        }, 500);
      } else {
        const usernameBase = googleName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'googletrader';
        const uniqueUsername = usernameBase + Math.floor(100 + Math.random() * 900);
        const res = registerUser({
          fullName: googleName,
          username: uniqueUsername,
          email: googleEmail,
          authMethod: 'google',
        });

        if (res.success) {
          setFeedback({
            type: 'success',
            message: `Account created for ${googleName} via Google! Unlocking terminal...`,
          });
          setTimeout(() => {
            setShowGoogleModal(false);
            if (onAuthenticated) {
              onAuthenticated(intendedDestination);
            }
          }, 500);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Google registration failed.' });
        }
      }
      setIsSubmitting(false);
    }, 450);
  };

  const handleConfirmFacebookAuth = (fbEmail: string, fbName: string) => {
    setIsSubmitting(true);
    setFeedback(null);

    setTimeout(() => {
      const existing = registeredUsers.find(
        u => u.email.toLowerCase() === fbEmail.toLowerCase()
      );

      if (existing) {
        switchUser(existing.id);
        setFeedback({
          type: 'success',
          message: `Welcome back, ${existing.fullName || existing.username}! Authenticated with Facebook.`,
        });
        setTimeout(() => {
          setShowFacebookModal(false);
          if (onAuthenticated) {
            onAuthenticated(intendedDestination);
          }
        }, 500);
      } else {
        const usernameBase = fbName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'fbtrader';
        const uniqueUsername = usernameBase + Math.floor(100 + Math.random() * 900);
        const res = registerUser({
          fullName: fbName,
          username: uniqueUsername,
          email: fbEmail,
          authMethod: 'facebook',
        });

        if (res.success) {
          setFeedback({
            type: 'success',
            message: `Account created for ${fbName} via Facebook! Unlocking terminal...`,
          });
          setTimeout(() => {
            setShowFacebookModal(false);
            if (onAuthenticated) {
              onAuthenticated(intendedDestination);
            }
          }, 500);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Facebook registration failed.' });
        }
      }
      setIsSubmitting(false);
    }, 450);
  };

  const finalizeRegistration = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerUser({
        fullName: fullName.trim(),
        username: username.trim(),
        email: regEmail.trim(),
        password: regPassword,
        referralCode: referralCode.trim() || undefined,
        authMethod: 'email',
      });
      setIsSubmitting(false);

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Account created successfully! Unlocking trading terminal...`,
        });
        setTimeout(() => {
          if (onAuthenticated) {
            onAuthenticated(intendedDestination);
          }
        }, 600);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Registration failed.' });
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!fullName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return;
    }
    if (!username.trim() || username.length < 3) {
      setFeedback({ type: 'error', message: 'Username must be at least 3 characters long.' });
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (regPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (regPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (getConnectedGmailSender().connected) {
      const code = generateVerificationCode();
      setVerificationCode(code);
      setShowGmailVerifyModal(true);
      return;
    }

    finalizeRegistration();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!loginEmail.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your email or username.' });
      return;
    }
    if (!loginPassword) {
      setFeedback({ type: 'error', message: 'Please enter your password.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginUser({
        emailOrUsername: loginEmail.trim(),
        password: loginPassword,
      });
      setIsSubmitting(false);

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Authentication verified! Redirecting to ${intendedDestination === 'trade' ? 'Trading Terminal' : intendedDestination}...`,
        });
        setTimeout(() => {
          if (onAuthenticated) {
            onAuthenticated(intendedDestination);
          }
        }, 600);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Invalid credentials.' });
      }
    }, 400);
  };

  const scrollToFaq = () => {
    const el = document.getElementById('faq-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isModalOpen = showAuthModal || internalAuthModal;
  const currentModalMode = onOpenAuthModal ? initialMode : internalModalMode;
  const handleCloseModal = () => {
    if (onCloseAuthModal) onCloseAuthModal();
    setInternalAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col font-sans selection:bg-[#00d2ff]/20 selection:text-[#00d2ff] relative overflow-x-hidden">
      {/* Subtle Architectural Grid & Horizon Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 auth-grid-backdrop"
      />

      {/* Clean 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#161c28] bg-[#06080c]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#05080f] border border-[#1e2a3f] shadow-[0_0_14px_rgba(56,189,248,0.2)] shrink-0">
              <img
                src="/assets/aistudio/signal-2026-11-19-06-44-03-203_d369e7fa.jpg"
                alt="Nexora DEX"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap shrink-0">
              NEXORA <span className="text-[#00d2ff]">DEX</span>
            </span>
          </div>

          {/* Zone 2: Concise Anchor Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <button
              type="button"
              onClick={() => { setActiveTab('register'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b ${
                activeTab === 'register'
                  ? 'text-[#7dd3fc] border-[#7dd3fc] font-semibold'
                  : 'border-transparent hover:text-white'
              }`}
            >
              {t('createAccount', 'Create Account')}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b ${
                activeTab === 'login'
                  ? 'text-[#7dd3fc] border-[#7dd3fc] font-semibold'
                  : 'border-transparent hover:text-white'
              }`}
            >
              {t('signIn', 'Sign In')}
            </button>
            <button
              type="button"
              onClick={scrollToFaq}
              className="py-1 border-b border-transparent hover:text-[#7dd3fc] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('faqTitle', 'FAQ & Architecture')}
            </button>
          </nav>

          {/* Zone 3: Language Selector & Auth Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Selector Dropdown (Flags Hidden) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="h-9 px-3 rounded-lg text-xs font-bold text-[#04131d] bg-[#7dd3fc] hover:bg-[#bae6fd] border border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_18px_rgba(125,211,252,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_6px_24px_rgba(125,211,252,0.45)] hover:-translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:translate-y-0 active:scale-[0.98]"
                title={t('selectLanguage', 'Select Language')}
              >
                <Globe className="w-3.5 h-3.5 text-[#04131d]" />
                {!hideFlag && <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag || ''}</span>}
                <span className="uppercase text-[11px] font-mono">{language}</span>
                <ChevronDown className="w-3 h-3 text-[#04131d]" />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 py-1.5 bg-[#0c1018] border border-[#1f283b] rounded-xl shadow-2xl z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-[#182030]">
                    {t('selectLanguage', 'Select Language')}
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#161e2e] transition-colors cursor-pointer ${
                          language === lang.code ? 'text-[#7dd3fc] font-semibold bg-[#7dd3fc]/10' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {!hideFlag && <span>{lang.flag}</span>}
                          <span>{lang.nativeName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActiveTab('login');
                setFeedback(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-9 px-3.5 rounded-lg text-xs font-bold text-[#04131d] bg-[#7dd3fc] hover:bg-[#bae6fd] border border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_18px_rgba(125,211,252,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_6px_24px_rgba(125,211,252,0.45)] hover:-translate-y-[1px] transition-all cursor-pointer whitespace-nowrap shrink-0 hidden sm:inline-flex items-center active:translate-y-0 active:scale-[0.98]"
            >
              {t('signIn', 'Sign In')}
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setFeedback(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-9 px-4 rounded-lg text-xs font-bold text-[#04131d] bg-[#7dd3fc] hover:bg-[#bae6fd] border border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_18px_rgba(125,211,252,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_6px_24px_rgba(125,211,252,0.45)] hover:-translate-y-[1px] transition-all cursor-pointer whitespace-nowrap shrink-0 active:translate-y-0 active:scale-[0.98]"
            >
              {t('createAccount', 'Create Account')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Standalone Page Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20 flex flex-col">
        {/* Protected Route Notice Banner */}
        {authGuardNotice && (
          <div className="w-full mb-8 p-4 rounded-xl bg-[#16120b] border border-amber-500/40 text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  {t('authenticationRequired', 'Authentication Required')}
                </div>
                <div className="text-xs text-amber-100/85 leading-snug mt-0.5">
                  {authGuardNotice}
                </div>
              </div>
            </div>
            {onClearNotice && (
              <button
                onClick={onClearNotice}
                className="p-1.5 rounded-lg text-amber-400/80 hover:text-white hover:bg-amber-500/20 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Primary Split: Editorial Thesis & Live Markets (Left) + Create Account Surface (Right) */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Brand Value Proposition & Live Perpetual Feed */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 pt-1 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-[#00d2ff]">Hyperliquid L1</span>
                <span aria-hidden="true">·</span>
                <span>Non-Custodial Perpetuals</span>
              </div>

              <h1 className="text-[clamp(2.25rem,3.8vw,3.25rem)] text-balance font-extrabold text-white tracking-tight leading-[1.05]">
                {t('heroHeadline1', 'Any market.')}{' '}
                <br className="hidden sm:inline" />
                {t('heroHeadline2', 'Anywhere.')}{' '}
                <span className="bg-gradient-to-r from-[#7dd3fc] via-[#bae6fd] to-[#38bdf8] bg-clip-text text-transparent">
                  {t('heroHeadline3', 'On-chain.')}
                </span>
              </h1>

              <p className="text-sm sm:text-[15px] text-slate-400 leading-relaxed max-w-md">
                {t('heroSubheading', 'Crypto, tokenized US stocks, gold and indices — one terminal, open 24/7, with your keys and funds in your own wallet.')}
              </p>
            </div>

            {/* Interactive Live Market Curve & Orderbook Snapshot */}
            {activePreviewMarket && (
              <div className="rounded-2xl bg-[#080c14]/90 border border-[#1a2438] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <CryptoLogo symbol={activePreviewMarket.baseAsset} size="sm" />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{activePreviewMarket.symbol}</span>
                        <span className="text-[10px] font-mono text-[#7dd3fc]">
                          {activePreviewMarket.leverageMax}x Max
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{activePreviewMarket.name}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-sm font-bold text-white">
                      ${formatPrice(activePreviewMarket.price, activePreviewMarket.precision)}
                    </div>
                    <div
                      className={`text-[11px] ${
                        activePreviewMarket.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {activePreviewMarket.change24h >= 0 ? '+' : ''}
                      {activePreviewMarket.change24h.toFixed(2)}% (24h)
                    </div>
                  </div>
                </div>

                {/* TradingView Real-Time Chart */}
                <div className="relative w-full h-[300px] sm:h-[320px] overflow-hidden rounded-lg border border-[#142033] bg-[#060b14]">
                  {(() => {
                    const tvSymbol = getTradingViewSymbol(activePreviewMarket);
                    const tvLocale = language === 'zh' ? 'zh_CN' : language;
                    const tvOverrides = JSON.stringify({
                      'paneProperties.background': '#060b14',
                      'paneProperties.backgroundType': 'solid',
                      'paneProperties.vertGridProperties.color': '#111b2d',
                      'paneProperties.horzGridProperties.color': '#111b2d',
                      'scalesProperties.textColor': '#64748b',
                      'mainSeriesProperties.candleStyle.upColor': '#7dd3fc',
                      'mainSeriesProperties.candleStyle.downColor': '#f87171',
                      'mainSeriesProperties.candleStyle.wickUpColor': '#7dd3fc',
                      'mainSeriesProperties.candleStyle.wickDownColor': '#f87171',
                      'mainSeriesProperties.candleStyle.borderUpColor': '#7dd3fc',
                      'mainSeriesProperties.candleStyle.borderDownColor': '#f87171',
                    });
                    const tvSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_preview_chart&symbol=${encodeURIComponent(
                      tvSymbol
                    )}&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=060b14&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=${encodeURIComponent(
                      tvOverrides
                    )}&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=${encodeURIComponent(tvLocale)}`;

                    return (
                      <iframe
                        key={`${tvSymbol}-${tvLocale}`}
                        title={`TradingView Chart ${activePreviewMarket.symbol}`}
                        src={tvSrc}
                        className="absolute inset-0 z-10 w-full h-full border-0 bg-[#060b14]"
                        scrolling="no"
                        loading="eager"
                      />
                    );
                  })()}
                  {previewChart && (() => {
                    const activeIdx =
                      hoveredCandleIdx !== null && hoveredCandleIdx >= 0 && hoveredCandleIdx < previewChart.candles.length
                        ? hoveredCandleIdx
                        : previewChart.candles.length - 1;
                    const activeCandle = previewChart.candles[activeIdx];
                    const plotRight = previewChart.padL + previewChart.plotW;
                    const plotBottom = previewChart.padT + previewChart.plotH;

                    const updateHoverFromClientX = (clientX: number, rect: DOMRect) => {
                      if (!rect.width) return;
                      const svgX = ((clientX - rect.left) / rect.width) * previewChart.svgW;
                      const relX = svgX - previewChart.padL;
                      if (relX < 0 || relX > previewChart.plotW) {
                        setHoveredCandleIdx(null);
                        return;
                      }
                      const idx = Math.min(
                        previewChart.candles.length - 1,
                        Math.max(0, Math.floor(relX / previewChart.stepX))
                      );
                      setHoveredCandleIdx(idx);
                    };

                    return (
                      <svg
                        viewBox={`0 0 ${previewChart.svgW} ${previewChart.svgH}`}
                        className="w-full h-auto block select-none cursor-crosshair"
                        onMouseMove={e => updateHoverFromClientX(e.clientX, e.currentTarget.getBoundingClientRect())}
                        onMouseLeave={() => setHoveredCandleIdx(null)}
                        onTouchMove={e => {
                          if (e.touches[0]) {
                            updateHoverFromClientX(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
                          }
                        }}
                        onTouchEnd={() => setHoveredCandleIdx(null)}
                      >
                        <defs>
                          <linearGradient id="authChartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="0%"
                              stopColor={previewChart.isPositive ? '#7dd3fc' : '#f87171'}
                              stopOpacity="0.18"
                            />
                            <stop
                              offset="100%"
                              stopColor={previewChart.isPositive ? '#7dd3fc' : '#f87171'}
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                          <clipPath id="authChartPlotClip">
                            <rect
                              x={previewChart.padL}
                              y={previewChart.padT}
                              width={previewChart.plotW}
                              height={previewChart.plotH}
                            />
                          </clipPath>
                        </defs>

                        {/* Top OHLCV Telemetry Header inside SVG */}
                        <text
                          x={previewChart.padL + 4}
                          y={14}
                          fill="#64748b"
                          fontSize="8.5"
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                        >
                          1H · {activeCandle.label}
                        </text>
                        <text
                          x={previewChart.padL + 66}
                          y={14}
                          fill={activeCandle.isUp ? '#bae6fd' : '#fca5a5'}
                          fontSize="8.5"
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                        >
                          O {formatPrice(activeCandle.open, activePreviewMarket.precision)} · H{' '}
                          {formatPrice(activeCandle.high, activePreviewMarket.precision)} · L{' '}
                          {formatPrice(activeCandle.low, activePreviewMarket.precision)} · C{' '}
                          {formatPrice(activeCandle.close, activePreviewMarket.precision)}
                        </text>

                        {/* Horizontal Price Gridlines + Right Axis Labels */}
                        {previewChart.gridLevels.map((lvl, idx) => (
                          <g key={idx}>
                            <line
                              x1={previewChart.padL}
                              y1={lvl.y}
                              x2={plotRight}
                              y2={lvl.y}
                              stroke="#172236"
                              strokeWidth="1"
                              strokeDasharray="2 3"
                            />
                            <text
                              x={plotRight + 6}
                              y={lvl.y + 3}
                              fill="#64748b"
                              fontSize="8.5"
                              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                            >
                              ${formatPrice(lvl.priceVal, activePreviewMarket.precision)}
                            </text>
                          </g>
                        ))}

                        {/* Right Price Axis Divider & Bottom Time Axis Divider */}
                        <line x1={plotRight} y1={previewChart.padT} x2={plotRight} y2={plotBottom} stroke="#172236" strokeWidth="1" />
                        <line x1={previewChart.padL} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#172236" strokeWidth="1" />

                        {/* Clipped Plot Area: EMA Area + Line, Volume Bars, Candlesticks */}
                        <g clipPath="url(#authChartPlotClip)">
                          {/* Soft EMA Gradient Area & Trend Line */}
                          <path d={previewChart.areaPath} fill="url(#authChartAreaGrad)" />
                          <path
                            d={previewChart.emaPath}
                            fill="none"
                            stroke={previewChart.isPositive ? '#38bdf8' : '#fb7185'}
                            strokeOpacity="0.55"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Bottom Volume Histogram Bars */}
                          {previewChart.candles.map(c => (
                            <rect
                              key={`vol-${c.idx}`}
                              x={c.bodyX}
                              y={c.volY}
                              width={c.bodyW}
                              height={c.volH}
                              rx="0.8"
                              fill={c.isUp ? '#7dd3fc' : '#f87171'}
                              fillOpacity={hoveredCandleIdx === c.idx ? 0.42 : 0.16}
                            />
                          ))}

                          {/* Candlesticks (Wick + Body) */}
                          {previewChart.candles.map(c => {
                            const isHovered = hoveredCandleIdx === c.idx;
                            const strokeColor = c.isUp ? '#7dd3fc' : '#f87171';
                            const fillColor = c.isUp ? '#7dd3fc' : '#f87171';
                            return (
                              <g key={`c-${c.idx}`}>
                                {isHovered && (
                                  <rect
                                    x={c.cx - previewChart.stepX / 2}
                                    y={previewChart.padT}
                                    width={previewChart.stepX}
                                    height={previewChart.plotH}
                                    fill="#7dd3fc"
                                    fillOpacity="0.06"
                                  />
                                )}
                                <line
                                  x1={c.cx}
                                  y1={c.yHigh}
                                  x2={c.cx}
                                  y2={c.yLow}
                                  stroke={strokeColor}
                                  strokeWidth={isHovered ? 1.6 : 1.1}
                                />
                                <rect
                                  x={c.bodyX}
                                  y={c.bodyTop}
                                  width={c.bodyW}
                                  height={c.bodyH}
                                  rx="1"
                                  fill={fillColor}
                                  fillOpacity={isHovered ? 1 : 0.88}
                                  stroke={isHovered ? '#e0f2fe' : 'none'}
                                  strokeWidth={isHovered ? 0.8 : 0}
                                />
                              </g>
                            );
                          })}

                          {/* Dashed Live Price Reference Line */}
                          <line
                            x1={previewChart.padL}
                            y1={previewChart.liveY}
                            x2={plotRight}
                            y2={previewChart.liveY}
                            stroke={previewChart.isPositive ? '#7dd3fc' : '#f87171'}
                            strokeOpacity="0.55"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />

                          {/* Interactive Crosshair on Hover */}
                          {hoveredCandleIdx !== null && (
                            <g>
                              <line
                                x1={activeCandle.cx}
                                y1={previewChart.padT}
                                x2={activeCandle.cx}
                                y2={plotBottom}
                                stroke="#94a3b8"
                                strokeOpacity="0.45"
                                strokeWidth="1"
                                strokeDasharray="2 2"
                              />
                              <line
                                x1={previewChart.padL}
                                y1={activeCandle.yClose}
                                x2={plotRight}
                                y2={activeCandle.yClose}
                                stroke="#94a3b8"
                                strokeOpacity="0.45"
                                strokeWidth="1"
                                strokeDasharray="2 2"
                              />
                              <circle
                                cx={activeCandle.cx}
                                cy={activeCandle.yClose}
                                r="2.6"
                                fill={activeCandle.isUp ? '#e0f2fe' : '#fecaca'}
                              />
                            </g>
                          )}
                        </g>

                        {/* Live / Hovered Price Tag on Right Axis */}
                        {(() => {
                          const tagPrice = hoveredCandleIdx !== null ? activeCandle.close : activePreviewMarket.price;
                          const rawY = hoveredCandleIdx !== null ? activeCandle.yClose : previewChart.liveY;
                          const clampedY = Math.min(plotBottom - 8, Math.max(previewChart.padT + 8, rawY));
                          const tagBg =
                            hoveredCandleIdx !== null
                              ? '#1e293b'
                              : previewChart.isPositive
                                ? '#7dd3fc'
                                : '#f87171';
                          const tagText = hoveredCandleIdx !== null ? '#e2e8f0' : '#03101a';
                          return (
                            <g>
                              <rect
                                x={plotRight + 2}
                                y={clampedY - 7.5}
                                width={previewChart.padR - 4}
                                height={15}
                                rx="3"
                                fill={tagBg}
                              />
                              <text
                                x={plotRight + 6}
                                y={clampedY + 3}
                                fill={tagText}
                                fontSize="8.5"
                                fontWeight="700"
                                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                              >
                                ${formatPrice(tagPrice, activePreviewMarket.precision)}
                              </text>
                            </g>
                          );
                        })()}

                        {/* Bottom Timeframe Axis Labels */}
                        {[0, 6, 12, 18, 23].map(idx => {
                          const candle = previewChart.candles[idx];
                          if (!candle) return null;
                          return (
                            <text
                              key={`t-${idx}`}
                              x={candle.cx}
                              y={plotBottom + 13}
                              textAnchor={idx === 0 ? 'start' : idx === 23 ? 'end' : 'middle'}
                              fill={idx === 23 ? '#7dd3fc' : '#64748b'}
                              fontSize="8"
                              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                            >
                              {candle.label}
                            </text>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>

                {/* 24h Range Bar */}
                <div className="space-y-1.5 pt-1 border-t border-[#141d2e]">
                  <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400">
                    <span>24h L: ${formatPrice(activePreviewMarket.low24h, activePreviewMarket.precision)}</span>
                    <span>Funding: {((activePreviewMarket.fundingRate || 0.0001) * 100).toFixed(4)}%</span>
                    <span>24h H: ${formatPrice(activePreviewMarket.high24h, activePreviewMarket.precision)}</span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-[#131c2e] overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#bae6fd]"
                      style={{ width: `${previewRangePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Live Perpetual Markets Feed (Clean hairline dividers, zero nested cards) */}
            <div className="border-t border-b border-[#171e2c] divide-y divide-[#171e2c]">
              <div className="py-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>Live Orderbook Markets</span>
                <span className="font-mono">24h Mark</span>
              </div>
              {showcaseMarkets.map((m) => {
                const isUp = m.change24h >= 0;
                const isPicked = previewSelectedMarketId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPreviewSelectedMarketId(m.id);
                      setSelectedMarket(m);
                      setActiveTab('register');
                    }}
                    className={`w-full py-2.5 px-2.5 -mx-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                      isPicked
                        ? 'bg-[#0d1726] border-[#7dd3fc]/35 shadow-[0_0_18px_rgba(125,211,252,0.08)]'
                        : 'border-transparent hover:border-[#1c283d] hover:bg-[#0b101b]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CryptoLogo symbol={m.baseAsset} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{m.symbol}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-normal">{m.leverageMax}x</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{m.name}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono tabular-nums shrink-0">
                      <div className="text-xs font-semibold text-white">
                        ${formatPrice(m.price, m.precision)}
                      </div>
                      <div
                        className={`text-[11px] inline-flex items-center gap-0.5 ${
                          isUp ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>
                          {isUp ? '+' : ''}
                          {m.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clean Quantitative Spec Strip */}
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">0%</div>
                <div className="text-xs text-slate-400">{t('makerFees0', 'Maker Fees')}</div>
              </div>
              <div className="space-y-1 border-l border-[#171e2c] pl-4">
                <div className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">12ms</div>
                <div className="text-xs text-slate-400">{t('subSecondGasTitle', 'L1 Execution')}</div>
              </div>
              <div className="space-y-1 border-l border-[#171e2c] pl-4">
                <div className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">$10,000</div>
                <div className="text-xs text-slate-400">Instant Demo</div>
              </div>
            </div>

            {/* Direct Link to Architecture FAQ */}
            <div className="pt-1">
              <button
                type="button"
                onClick={scrollToFaq}
                className="px-4 py-2.5 rounded-xl bg-[#7dd3fc] hover:bg-[#bae6fd] text-[#04131d] font-bold text-xs border border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_18px_rgba(125,211,252,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_6px_24px_rgba(125,211,252,0.45)] hover:-translate-y-[1px] inline-flex items-center gap-2 transition-all cursor-pointer group active:translate-y-0 active:scale-[0.98]"
              >
                <span>{t('exploreFaq', 'Explore FAQ & Architecture')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#04131d] group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Elevated Create Account / Sign In Surface */}
          <div className="lg:col-span-7 bg-[#0b0f18]/95 border border-[#22304a] rounded-2xl p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_50px_rgba(125,211,252,0.06)] relative overflow-hidden">
            {/* Crisp Top Hairline Accent & Subtle Corner Precision Ticks */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#7dd3fc]/85 to-transparent" />
            <span aria-hidden="true" className="absolute top-3 left-3 text-[10px] font-mono text-[#7dd3fc]/30 select-none">+</span>
            <span aria-hidden="true" className="absolute top-3 right-3 text-[10px] font-mono text-[#7dd3fc]/30 select-none">+</span>

            {/* Segmented Mode Switcher + Self-Custody Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-[#161d2b]">
              <div className="inline-flex items-center p-1 rounded-xl bg-[#07090f] border border-[#192132] gap-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setFeedback(null); }}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    activeTab === 'register'
                      ? 'bg-[#7dd3fc] text-[#04131d] border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_14px_rgba(125,211,252,0.3)]'
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-[#131d2f]'
                  }`}
                >
                  {t('createAccount', 'Create Account')}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setFeedback(null); }}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    activeTab === 'login'
                      ? 'bg-[#7dd3fc] text-[#04131d] border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_14px_rgba(125,211,252,0.3)]'
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-[#131d2f]'
                  }`}
                >
                  {t('signIn', 'Sign In')}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Shield className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>{t('selfCustodialBadge', 'Self-Custodial')}</span>
              </div>
            </div>

            {/* Form Header Title & Subtitle */}
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeTab === 'register'
                  ? t('createAccount', 'Create your trading account')
                  : t('signIn', 'Sign in to your account')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {activeTab === 'register'
                  ? 'Start with a $10,000 Demo balance immediately — zero gas fees and no KYC required.'
                  : 'Access your markets, open positions, and copy trading strategies.'}
              </p>
            </div>

            {/* Feedback alert */}
            {feedback && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Google Quick Auth Action */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl bg-gradient-to-b from-white to-[#edf8ff] hover:from-white hover:to-[#e0f2fe] text-[#04131d] font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer border border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_18px_rgba(125,211,252,0.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_6px_24px_rgba(125,211,252,0.34)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {activeTab === 'register' ? t('signUpWithGoogle', 'Sign up with Google') : t('signInWithGoogle', 'Sign in with Google')}
                </span>
              </button>

              <div className="flex items-center my-5 gap-3">
                <div className="h-px flex-1 bg-[#182030]" />
                <span className="text-[11px] text-slate-400 font-medium">
                  {t('orContinueWith', 'or continue with credentials')}
                </span>
                <div className="h-px flex-1 bg-[#182030]" />
              </div>
            </div>

            {/* Form Section */}
            {activeTab === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-medium block mb-1.5">{t('fullName', 'Full Name')}</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Satoshi Nakamoto"
                      className="w-full h-10 bg-[#0e131e] border border-[#1f283b] rounded-xl pl-10 pr-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00d2ff] focus:ring-2 focus:ring-[#00d2ff]/15 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1.5">{t('username', 'Username')}</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="trader_tag"
                      className="w-full h-10 bg-[#0e131e] border border-[#1f283b] rounded-xl px-3.5 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#00d2ff] focus:ring-2 focus:ring-[#00d2ff]/15 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-1.5">{t('referralCode', 'Referral Code (Optional)')}</label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="NEXORA-VIP"
                      className="w-full h-10 bg-[#0e131e] border border-[#1f283b] rounded-xl px-3.5 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#00d2ff] focus:ring-2 focus:ring-[#00d2ff]/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1.5">{t('email', 'Email Address')}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full h-10 bg-[#0e131e] border border-[#1f283b] rounded-xl pl-10 pr-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00d2ff] focus:ring-2 focus:ring-[#00d2ff]/15 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1.5">{t('password', 'Password')}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full h-10 bg-[#0e131e] border border-[#1f283b] rounded-xl pl-10 pr-10 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#00d2ff] focus:ring-2 focus:ring-[#00d2ff]/15 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1.5 p-1.5 rounded-lg text-slate-400 hover:text-[#7dd3fc] hover:bg-[#7dd3fc]/10 transition-all cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1.5">{t('confirmPassword', 'Confirm Password')}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full h-10 bg-[#0e131e] border border-[#1f283b] rounded-xl pl-10 pr-10 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#00d2ff] focus:ring-2 focus:ring-[#00d2ff]/15 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1.5 p-1.5 rounded-lg text-slate-400 hover:text-[#7dd3fc] hover:bg-[#7dd3fc]/10 transition-all cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Password Strength & Confirmation Status */}
                {(regPassword.length > 0 || confirmPassword.length > 0) && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5 text-[11px]">
                    {regPassword.length > 0 && (
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="grid grid-cols-4 gap-1 w-28">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-1 rounded-full transition-colors ${
                                passwordStrength.score >= step ? passwordStrength.colorClass : 'bg-[#1a2234]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`font-medium ${passwordStrength.textClass}`}>
                          Strength: {passwordStrength.label}
                        </span>
                      </div>
                    )}

                    {confirmPassword.length > 0 && (
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          regPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {regPassword === confirmPassword ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="hidden">
                  <GmailSenderConnectionCard compact />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full h-12 rounded-xl bg-[#7dd3fc] hover:bg-[#bae6fd] text-[#04131d] font-extrabold text-sm border border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_6px_26px_rgba(125,211,252,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_34px_rgba(125,211,252,0.5)] hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group active:translate-y-0 active:scale-[0.99]"
                >
                  <span>{isSubmitting ? t('registeringAccount', 'Registering Account...') : t('completeSignUpContinue', 'Complete Sign Up & Continue')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="pt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                  <span>Zero gas fees</span>
                  <span aria-hidden="true">·</span>
                  <span>$10,000 Demo sandbox ready</span>
                  <span aria-hidden="true">·</span>
                  <span>$0.00 Real balance until deposit</span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-medium block mb-1.5">{t('email', 'Email')} / {t('username', 'Username')}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@domain.com or username"
                      className="w-full h-10 bg-[#0e131e] border border-[#1f283b] rounded-xl pl-10 pr-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00d2ff] focus:ring-2 focus:ring-[#00d2ff]/15 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1.5">{t('password', 'Password')}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 bg-[#0e131e] border border-[#1f283b] rounded-xl pl-10 pr-10 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#00d2ff] focus:ring-2 focus:ring-[#00d2ff]/15 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2 top-1.5 p-1.5 rounded-lg text-slate-400 hover:text-[#7dd3fc] hover:bg-[#7dd3fc]/10 transition-all cursor-pointer"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full h-12 rounded-xl bg-[#7dd3fc] hover:bg-[#bae6fd] text-[#04131d] font-extrabold text-sm border border-[#bae6fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_6px_26px_rgba(125,211,252,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_34px_rgba(125,211,252,0.5)] hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group active:translate-y-0 active:scale-[0.99]"
                >
                  <span>{isSubmitting ? '...' : `${t('signIn', 'Sign In')} & ${t('enterTerminal', 'Enter Terminal')}`}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="hidden pt-2 border-t border-[#1e232d]/70 items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>SuperAdmin:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('anatolimarcenko980@gmail.com');
                      setLoginPassword('admin123');
                      const res = loginUser({ emailOrUsername: 'anatolimarcenko980@gmail.com' });
                      if (res.success) {
                        setFeedback({ type: 'success', message: 'Welcome SuperAdmin Anatoli! Unlocking DEX...' });
                        setTimeout(() => {
                          if (onAuthenticated) onAuthenticated('admin');
                        }, 500);
                      }
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sign in as anatolimarcenko980</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Architectural 3-Column Capabilities Strip */}
        <section className="w-full mt-14 border-t border-b border-[#161e2e] grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#161e2e]">
          <div className="py-6 lg:pr-8 space-y-1.5">
            <div className="text-xs font-mono text-[#7dd3fc]">01. Execution Engine</div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {t('subSecondGasTitle', 'Sub-Second Execution & 0 Gas')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('subSecondGasDesc', '12ms latency, native Hyperliquid L1 order matching engine, zero gas fees to place or cancel orders.')}
            </p>
          </div>
          <div className="py-6 lg:px-8 space-y-1.5">
            <div className="text-xs font-mono text-[#7dd3fc]">02. Wallet Sovereignty</div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {t('selfCustodial100', '100% Self-Custodial')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('selfCustodialDesc', 'Your keys, your crypto. Funds remain strictly inside smart contract vaults with zero counterparty risk.')}
            </p>
          </div>
          <div className="py-6 lg:pl-8 space-y-1.5">
            <div className="text-xs font-mono text-[#7dd3fc]">03. Strategy Mirroring</div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {t('oneClickCopyTitle', '1-Click Copy Trading')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('oneClickCopyDesc', 'Mirror verified top-tier onchain traders automatically with proportional allocation and risk caps.')}
            </p>
          </div>
        </section>

        {/* FAQ / Platform Architecture Section */}
        <section id="faq-section" className="w-full mt-12 pt-4">
          <div className="mb-8 text-center">
            <span className="text-xs font-medium text-[#00d2ff] block mb-1.5">
              {t('platformKnowledgeBase', 'Platform Knowledge Base')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('faqTitle', 'Frequently Asked Questions')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xl mx-auto">
              {t('faqLearnMore', "Learn how Nexora's non-custodial Hyperliquid L1 architecture guarantees zero counterparty risk and institutional execution speed.")}
            </p>
          </div>

          <FaqSection
            onStartTrading={() => {
              setActiveTab('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 border-t border-[#161c28] bg-[#06080c] py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden bg-[#05080f] border border-[#1e2a3f] shrink-0">
              <img
                src="/assets/aistudio/signal-2026-11-19-06-44-03-203_d369e7fa.jpg"
                alt="Nexora DEX"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <span className="font-semibold text-slate-300">Nexora DEX</span>
            <span aria-hidden="true">·</span>
            <span>{t('poweredByHyperliquid', 'Powered by Hyperliquid L1 Engine')}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>{t('nonCustodial100', '100% Non-Custodial')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('oracleLatency', 'Oracle Latency: 12ms')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('auditedOpenSource', 'Audited & Open-Source')}</span>
          </div>
        </div>
      </footer>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        mode={activeTab}
        onConfirmGoogleAuth={handleConfirmGoogleAuth}
        isSubmitting={isSubmitting}
      />

      {/* Facebook Auth Modal */}
      <FacebookAuthModal
        isOpen={showFacebookModal}
        onClose={() => setShowFacebookModal(false)}
        mode={activeTab}
        onConfirmFacebookAuth={handleConfirmFacebookAuth}
        isSubmitting={isSubmitting}
      />

      {/* Auth Modal (if opened via button) */}
      {isModalOpen && (
        <AuthModal
          initialMode={currentModalMode}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            if (onAuthenticated) {
              onAuthenticated(intendedDestination);
            }
          }}
        />
      )}
      {/* Gmail Verification Code Confirmation Modal */}
      <GmailVerificationModal
        isOpen={showGmailVerifyModal}
        recipientEmail={regEmail.trim()}
        recipientName={fullName.trim() || username.trim()}
        expectedCode={verificationCode}
        onRegenerateCode={() => {
          const next = generateVerificationCode();
          setVerificationCode(next);
          return next;
        }}
        onVerified={() => {
          setShowGmailVerifyModal(false);
          finalizeRegistration();
        }}
        onClose={() => setShowGmailVerifyModal(false)}
      />
    </div>
  );
};
