import React, { useState, useEffect } from 'react';
import { PhoneMockup } from './PhoneMockup';
import { FaqSection } from './FaqSection';
import { DownloadAppModal } from './DownloadAppModal';
import { AuthCard } from './AuthCard';
import { AuthModal } from './AuthModal';
import { GoogleAuthModal } from './GoogleAuthModal';
import { GmailSenderConnectionCard, GmailVerificationModal } from './GmailVerificationModal';
import { generateVerificationCode, getConnectedGmailSender } from '../services/gmailService';
import { useTrading } from '../context/TradingContext';
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  Shield,
  Zap,
  Globe,
  LogIn,
  UserPlus,
  TrendingUp,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ArrowUpRight,
  ExternalLink,
  Users,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export type AuthTargetView = 'auth' | 'trade' | 'copytrading' | 'markets' | 'portfolio' | 'calendar' | 'admin';

interface AuthPageProps {
  onBackToMarkets: () => void;
  onNavigateToPage?: (targetView: AuthTargetView) => void;
  initialMode?: 'register' | 'login';
  intendedDestination?: AuthTargetView;
  authGuardNotice?: string | null;
  onClearNotice?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToMarkets,
  onNavigateToPage,
  initialMode = 'register',
  intendedDestination = 'trade',
  authGuardNotice = null,
  onClearNotice,
}) => {
  const {
    isLoggedIn,
    currentUser,
    logoutUser,
    registerUser,
    loginUser,
    registeredUsers,
    switchUser,
    setSelectedMarket,
    markets,
    availableBalance,
    t,
  } = useTrading();

  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);

  // Active sub-view on AuthPage: 'form' (direct sign up / login) or 'overview'
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'overview'>(
    authGuardNotice ? (initialMode || 'register') : 'overview'
  );

  // Destination after successful sign up or login
  const [targetDestination, setTargetDestination] = useState<AuthTargetView>(
    intendedDestination || 'trade'
  );

  // Sync intended destination and auth guard notice
  useEffect(() => {
    if (intendedDestination) {
      setTargetDestination(intendedDestination);
    }
    if (authGuardNotice || initialMode) {
      setActiveTab(initialMode || 'register');
    }
  }, [intendedDestination, authGuardNotice, initialMode]);

  // Modal for logging in or signing up when clicking Start Trading
  const [showTradeAuthModal, setShowTradeAuthModal] = useState<boolean>(false);
  const [tradeAuthInitialMode, setTradeAuthInitialMode] = useState<'register' | 'login'>('register');

  // Form states
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Feedback states
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showGmailVerifyModal, setShowGmailVerifyModal] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');

  const handleRouteToTarget = (dest = targetDestination) => {
    if (onNavigateToPage) {
      onNavigateToPage(dest);
    } else {
      onBackToMarkets();
    }
  };

  // Mandatory Auth Check for Start Trading
  const handleStartTrading = () => {
    if (!isLoggedIn) {
      setTargetDestination('trade');
      setTradeAuthInitialMode('register');
      setShowTradeAuthModal(true);
    } else {
      handleRouteToTarget('trade');
    }
  };

  // Mandatory Auth Check for Copy Trading
  const handleCopyTrading = () => {
    if (!isLoggedIn) {
      setTargetDestination('copytrading');
      setTradeAuthInitialMode('register');
      setShowTradeAuthModal(true);
    } else {
      handleRouteToTarget('copytrading');
    }
  };

  const finalizeEmailRegistration = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerUser({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
        authMethod: 'email',
      });
      setIsSubmitting(false);

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Account created for ${res.user?.fullName || res.user?.username}! Redirecting to ${
            targetDestination === 'copytrading' ? 'Copy Trading' : targetDestination === 'trade' ? 'Trading Terminal' : 'Markets'
          }...`,
        });
        setTimeout(() => {
          handleRouteToTarget(targetDestination);
        }, 900);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Registration failed.' });
      }
    }, 500);
  };

  const handleEmailRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!fullName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return;
    }
    if (!username.trim() || username.length < 3) {
      setFeedback({ type: 'error', message: 'Username must be at least 3 characters.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (getConnectedGmailSender().connected) {
      const code = generateVerificationCode();
      setVerificationCode(code);
      setShowGmailVerifyModal(true);
      return;
    }

    finalizeEmailRegistration();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
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
          message: `Logged in as ${res.user?.fullName || res.user?.username}! Redirecting to ${
            targetDestination === 'copytrading' ? 'Copy Trading' : targetDestination === 'trade' ? 'Trading Terminal' : 'Markets'
          }...`,
        });
        setTimeout(() => {
          handleRouteToTarget(targetDestination);
        }, 900);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Login failed.' });
      }
    }, 500);
  };

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
          handleRouteToTarget(targetDestination);
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
            handleRouteToTarget(targetDestination);
          }, 500);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Google registration failed.' });
        }
      }
      setIsSubmitting(false);
    }, 450);
  };

  const scrollToFaq = () => {
    const el = document.getElementById('faq-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col items-center font-sans selection:bg-[#00d2ff]/20 selection:text-[#00d2ff] animate-in fade-in duration-200">
      {/* Top Floating Ticker Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between py-2 px-1 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
          <span className="font-mono text-slate-300">Hyperliquid L1 Engine</span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline">{t('makerFees0', '0% Maker Fees')}</span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-emerald-400 hidden sm:inline">{t('subSecondFinality', 'Sub-Second Finality')}</span>
        </div>

        {/* Quick View Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#1e293b] text-white shadow-sm border border-[#273550]'
                : 'text-slate-400 hover:text-white bg-[#0e111a] border border-[#1e293b]'
            }`}
          >
            {t('viewAuth', 'Overview & FAQ')}
          </button>
          {!isLoggedIn && (
            <>
              <button
                onClick={() => { setActiveTab('register'); setFeedback(null); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'register'
                    ? 'bg-[#00d2ff] text-black shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white bg-[#0e111a] border border-[#1e293b]'
                }`}
              >
                {t('signUp', 'Sign Up')}
              </button>
              <button
                onClick={() => { setActiveTab('login'); setFeedback(null); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-black shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white bg-[#0e111a] border border-[#1e293b]'
                }`}
              >
                {t('signIn', 'Sign In')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mandatory Protected Route Notification Banner */}
      {authGuardNotice && !isLoggedIn && (
        <div className="w-full max-w-4xl mt-3 mb-2 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1a150e] to-amber-500/10 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-3 shadow-xl shadow-amber-500/5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">{t('protectedRouteActive', 'Protected Route Active')}</div>
              <div className="text-xs text-amber-100/90 leading-snug">{authGuardNotice}</div>
            </div>
          </div>
          {onClearNotice && (
            <button
              onClick={onClearNotice}
              className="p-1 rounded-lg text-amber-400/80 hover:text-white hover:bg-amber-500/20 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* If User is Already Logged In: Show Banner with Instant Transition to Other Page */}
      {isLoggedIn && currentUser && (
        <div className="w-full max-w-4xl mt-4 mb-2 p-4 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#090e18] to-[#0c1422] border border-[#00d2ff]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center font-bold font-mono">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>{t('signedInAs', 'Signed in as')} {currentUser.fullName || currentUser.username}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentUser.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRouteToTarget('copytrading')}
              className="px-4 py-2 rounded-full bg-[#e2e8f0] text-black font-extrabold text-xs hover:bg-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('goToCopyTrading', 'Go to Copy Trading')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleRouteToTarget('trade')}
              className="px-4 py-2 rounded-full bg-[#182030] text-white font-semibold text-xs hover:bg-[#222c42] border border-[#273550] transition-all cursor-pointer"
            >
              {t('tradeTerminal', 'Trading Terminal')}
            </button>
            <button
              onClick={() => {
                setTradeAuthInitialMode('login');
                setShowTradeAuthModal(true);
              }}
              className="px-3 py-2 rounded-full bg-[#141a29] hover:bg-[#1e273d] text-slate-300 text-xs font-mono transition-colors border border-[#273550]"
              title={t('switchAccount', 'Switch Account')}
            >
              {t('switchAccount', 'Switch Account')}
            </button>
            <button
              onClick={logoutUser}
              className="px-3 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono transition-colors"
              title={t('logOut', 'Log Out')}
            >
              {t('logOut', 'Log Out')}
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEW: SIGN UP & LOG IN CARD OR HERO SECTION */}
      {activeTab === 'register' || activeTab === 'login' ? (
        <div className="w-full max-w-4xl py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Card */}
          <div className="lg:col-span-7 bg-[#0b0e14] border border-[#1b2130] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent opacity-80" />

            {/* Mode Tabs */}
            <div className="flex items-center justify-between border-b border-[#181d2a] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setFeedback(null); }}
                  className={`text-lg font-extrabold tracking-tight pb-1 transition-colors ${
                    activeTab === 'register'
                      ? 'text-white border-b-2 border-[#00d2ff]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t('createAccount', 'Create Account')}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setFeedback(null); }}
                  className={`text-lg font-extrabold tracking-tight pb-1 transition-colors ${
                    activeTab === 'login'
                      ? 'text-white border-b-2 border-[#00d2ff]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t('logIn', 'Log In')}
                </button>
              </div>

              {/* Destination selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>{t('goTo', 'Go to:')}</span>
                <select
                  value={targetDestination}
                  onChange={(e) => setTargetDestination(e.target.value as any)}
                  className="bg-[#131924] text-white border border-[#222c40] rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#00d2ff]"
                >
                  <option value="copytrading">{t('copytrading', 'Copy Trading')}</option>
                  <option value="trade">{t('tradeTerminal', 'Trading Terminal')}</option>
                  <option value="markets">{t('markets', 'Markets')}</option>
                </select>
              </div>
            </div>

            {/* Feedback notification */}
            {feedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <Shield className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Google Registration & Log In Button */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer border border-neutral-200 active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

              <div className="flex items-center my-4 gap-3">
                <div className="h-px flex-1 bg-[#1a2130]" />
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  {t('orContinueWith', 'or continue with credentials')}
                </span>
                <div className="h-px flex-1 bg-[#1a2130]" />
              </div>
            </div>

            {/* Sign Up Form */}
            {activeTab === 'register' ? (
              <form onSubmit={handleEmailRegister} className="flex flex-col gap-3.5 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">{t('fullName', 'Full Name')}</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Satoshi Nakamoto"
                      className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2 pl-9 pr-3 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">{t('username', 'Username')}</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="trader_name"
                      className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('referralCode', 'Referral Code (Optional)')}</label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="NEXORA-VIP"
                      className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{t('email', 'Email Address')}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2 pl-9 pr-3 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">{t('password', 'Password')}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2 pl-9 pr-9 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('confirmPassword', 'Confirm Password')}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2 pl-9 pr-9 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <GmailSenderConnectionCard compact />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full py-3 rounded-full bg-[#e2e8f0] text-black font-extrabold text-xs sm:text-sm hover:bg-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? t('creatingAccount', 'Creating Account...') : t('completeSignUpContinue', 'Complete Sign Up & Continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Log In Form */
              <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">{t('email', 'Email')} / {t('username', 'Username')}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@domain.com or username"
                      className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2.5 pl-9 pr-3 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{t('password', 'Password')}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#121622] border border-[#21283b] rounded-xl py-2.5 pl-9 pr-9 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-[#00d2ff]" />
                    <span>{t('rememberThisDevice', 'Remember this device')}</span>
                  </label>
                  <span className="text-[#00d2ff] hover:underline cursor-pointer">{t('forgotPassword', 'Forgot password?')}</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full py-3 rounded-full bg-[#e2e8f0] text-black font-extrabold text-xs sm:text-sm hover:bg-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? t('verifying', 'Verifying...') : t('logInAndContinue', 'Log In & Continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Key Benefits & Features Card */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-left">
            <div className="bg-[#0b0e14] border border-[#1b2130] rounded-3xl p-6">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {t('whyTradeOnNexora', 'Why Trade on Nexora?')}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t('whyTradeSubtitle', 'Hyperliquid L1 high-frequency decentralized perpetual DEX with 100% self-custody.')}
              </p>

              <div className="flex flex-col gap-3.5 mt-5 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#00d2ff]/10 text-[#00d2ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{t('oneClickCopyTitle', '1-Click Copy Trading')}</span>
                    <span className="text-[11px] text-slate-400">{t('copyBenefitDesc', 'Mirror verified leaders with +90% 30D PnL automatically.')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{t('zeroGasBenefitTitle', '0% Maker Fees & Zero Gas')}</span>
                    <span className="text-[11px] text-slate-400">{t('zeroGasBenefitDesc', 'Raw institutional orderbook without high transaction fees.')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{t('nonCustodial100', '100% Non-Custodial')}</span>
                    <span className="text-[11px] text-slate-400">{t('nonCustodialBenefitDesc', 'Your keys, your crypto. Withdraw anytime without KYC approvals.')}</span>
                  </div>
                </div>
              </div>

              {/* Mandatory Auth Protection Note */}
              <div className="mt-6 pt-4 border-t border-[#171c28] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('mandatoryAuthProtection', 'Mandatory Auth Protection')}</span>
                </div>
                <span className="text-[11px] text-slate-500">{t('hyperliquidSecured', 'Hyperliquid L1 Secured')}</span>
              </div>
            </div>

            {/* Quick App Download Box */}
            <div className="bg-[#0b0e14] border border-[#1b2130] rounded-3xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-[#00d2ff]" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{t('nexoraMobileApp', 'Nexora Mobile App')}</span>
                  <span className="text-[11px] text-slate-400">{t('iosAndroidBeta', 'iOS TestFlight & Android APK')}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-xs text-white"
              >
                {t('downloadApp', 'Download')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* HERO SECTION MATCHING SCREENSHOT WITH PHONE MOCKUP */
        <section className="w-full max-w-7xl pt-8 pb-14 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Bold Typography & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 pr-0 lg:pr-6 text-left">
            {/* Main Hero Headline */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
                {t('heroHeadline1', 'Any market.')}<br />
                {t('heroHeadline2', 'Anywhere.')}<br />
                {t('heroHeadline3', 'On-chain.')}
              </h1>
            </div>

            {/* Subheading / Value Proposition */}
            <p className="text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed">
              {t('heroSubheading', 'Crypto, tokenized US stocks, gold and indices — one terminal, open 24/7, with your keys and funds in your own wallet.')}
            </p>

            {/* Primary Action Button Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Start Trading / Enter Page */}
              <button
                onClick={handleStartTrading}
                className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm sm:text-base hover:bg-neutral-200 transition-all shadow-xl hover:shadow-white/20 active:scale-95 flex items-center gap-2 group cursor-pointer"
              >
                <span>{t('startTrading', 'Start Trading')}</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Copy Trading Button */}
              <button
                onClick={handleCopyTrading}
                className="px-8 py-3.5 rounded-full border border-[#00d2ff]/60 hover:border-[#00d2ff] text-white font-bold text-sm sm:text-base bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Users className="w-4 h-4 text-[#00d2ff]" />
                <span>{t('copytrading', 'Copy Trading')}</span>
              </button>
            </div>

            {/* Social Proof Counter */}
            <div className="pt-1 flex items-center gap-2 text-sm sm:text-base font-sans">
              <span className="text-white font-extrabold tracking-tight">
                +1,252
              </span>
              <span className="text-neutral-400">
                {t('peopleJoinedToday', 'people joined onchain trading today!')}
              </span>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-6 border-t border-[#1e293b]/50 grid grid-cols-3 gap-4 text-xs font-mono text-slate-400">
              <div>
                <span className="text-white font-bold block text-sm sm:text-base font-sans">{t('selfCustodial100', '100% Self-Custodial')}</span>
                <span className="text-[11px] text-slate-400">{t('zeroCounterpartyRisk', 'Zero counterparty risk')}</span>
              </div>
              <div>
                <span className="text-white font-bold block text-sm sm:text-base font-sans">{t('makerFees0', '0% Maker Fees')}</span>
                <span className="text-[11px] text-slate-400">Hyperliquid L1</span>
              </div>
              <div>
                <span className="text-white font-bold block text-sm sm:text-base font-sans">{t('noKycRequired', 'No KYC Required')}</span>
                <span className="text-[11px] text-slate-400">{t('instantOnChainAccess', 'Instant on-chain access')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Smartphone Mockup */}
          <div className="lg:col-span-5 flex justify-center items-center w-full">
            <PhoneMockup onSelectMarket={handleStartTrading} />
          </div>
        </section>
      )}

      {/* Downward Scroll Anchor to FAQ */}
      <div className="w-full flex justify-center py-4">
        <button
          onClick={scrollToFaq}
          className="flex flex-col items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-[#00d2ff] transition-colors group cursor-pointer"
        >
          <span>{t('faqBelow', 'Frequently Asked Questions Below')}</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-slate-400 group-hover:text-[#00d2ff]" />
        </button>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS SECTION */}
      <div className="w-full border-t border-[#1e293b]/60">
        <FaqSection onStartTrading={handleStartTrading} />
      </div>

      {/* Interactive Download App Modal */}
      {showDownloadModal && (
        <DownloadAppModal onClose={() => setShowDownloadModal(false)} />
      )}

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        mode={activeTab === 'login' ? 'login' : 'register'}
        onConfirmGoogleAuth={handleConfirmGoogleAuth}
        isSubmitting={isSubmitting}
      />

      {/* Auth Modal Triggered on Start Trading / Copy Trading / Protected Route Intercept */}
      {showTradeAuthModal && (
        <AuthModal
          initialMode={tradeAuthInitialMode}
          onClose={() => setShowTradeAuthModal(false)}
          onSuccess={() => {
            setShowTradeAuthModal(false);
            handleRouteToTarget(targetDestination);
          }}
        />
      )}
      {/* Gmail Verification Code Confirmation Modal */}
      <GmailVerificationModal
        isOpen={showGmailVerifyModal}
        recipientEmail={email.trim()}
        recipientName={fullName.trim() || username.trim()}
        expectedCode={verificationCode}
        onRegenerateCode={() => {
          const next = generateVerificationCode();
          setVerificationCode(next);
          return next;
        }}
        onVerified={() => {
          setShowGmailVerifyModal(false);
          finalizeEmailRegistration();
        }}
        onClose={() => setShowGmailVerifyModal(false)}
      />
    </div>
  );
};
