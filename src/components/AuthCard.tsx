import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { FacebookAuthModal } from './FacebookAuthModal';
import { GmailSenderConnectionCard, GmailVerificationModal } from './GmailVerificationModal';
import { generateVerificationCode, getConnectedGmailSender } from '../services/gmailService';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import {
  X,
  Mail,
  Lock,
  User,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  QrCode,
  Copy,
  Check,
  Fingerprint,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Gift,
} from 'lucide-react';

interface AuthCardProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialStep?: 'main' | 'email' | 'google' | 'apple' | 'wallet_connect' | 'wallets';
  initialMode?: 'register' | 'login';
  isModal?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onClose,
  onSuccess,
  initialStep = 'main',
  initialMode = 'register',
  isModal = false,
}) => {
  const { registerUser, loginUser, t, registeredUsers, currentUser, switchUser, language, setLanguage, hideFlag } = useTrading();

  // Active step in auth flow:
  // 'main' = The exact "Log in or sign up" menu from the screenshot
  // 'email' = Email registration & login with Name, Email, Password
  // 'google' = Google account selection modal
  // 'apple' = Apple ID sign-in sheet
  // 'wallet_connect' = QR code scanning
  // 'wallets' = Web3 wallet picker
  const [step, setStep] = useState<'main' | 'email' | 'google' | 'apple' | 'wallet_connect' | 'wallets'>(initialStep);
  const [authMode, setAuthMode] = useState<'register' | 'login'>(initialMode);
  const [showFacebookModal, setShowFacebookModal] = useState<boolean>(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState<boolean>(false);

  // Email form fields
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [showReferralInput, setShowReferralInput] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Login form fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Apple sign-in options
  const [appleEmailOption, setAppleEmailOption] = useState<'share' | 'hide'>('share');
  const [appleName, setAppleName] = useState<string>('');

  // Status & Feedback
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showGmailVerifyModal, setShowGmailVerifyModal] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');

  // Password Strength Calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-[#00d2ff]' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
  };

  const passStrength = calculatePasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const finalizeEmailRegister = () => {
    const cleanUsername = username.trim() || fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = registerUser({
        fullName: fullName.trim(),
        username: cleanUsername,
        email: email.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
        authMethod: 'email',
      });

      setIsSubmitting(false);

      if (!res.success) {
        setStatus({ type: 'error', message: res.error || 'Registration failed.' });
      } else {
        setStatus({
          type: 'success',
          message: `Welcome, ${res.user?.fullName || res.user?.username}! Your Nexora DEX account is ready.`,
        });
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 1000);
      }
    }, 600);
  };

  // Handle Email Register
  const handleEmailRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!fullName.trim()) {
      setStatus({ type: 'error', message: 'Please enter your name.' });
      return;
    }

    const cleanUsername = username.trim() || fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanUsername.length < 3) {
      setStatus({ type: 'error', message: 'Username must be at least 3 characters long.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (!agreeTerms) {
      setStatus({ type: 'error', message: 'You must agree to the Terms of Service to register.' });
      return;
    }

    if (getConnectedGmailSender().connected) {
      const code = generateVerificationCode();
      setVerificationCode(code);
      setShowGmailVerifyModal(true);
      return;
    }

    finalizeEmailRegister();
  };

  // Handle Email Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!loginIdentifier.trim()) {
      setStatus({ type: 'error', message: 'Please enter your email or username.' });
      return;
    }

    if (!loginPassword) {
      setStatus({ type: 'error', message: 'Please enter your password.' });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = loginUser({
        emailOrUsername: loginIdentifier.trim(),
        password: loginPassword,
      });

      setIsSubmitting(false);

      if (!res.success) {
        setStatus({ type: 'error', message: res.error || 'Invalid email or password.' });
      } else {
        setStatus({
          type: 'success',
          message: `Welcome back, ${res.user?.username}!`,
        });
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 800);
      }
    }, 500);
  };

  // Handle Google Sign-In Confirmation
  const handleConfirmGoogleAuth = (googleUserEmail: string, googleUserName: string) => {
    setIsSubmitting(true);
    setStatus(null);

    setTimeout(() => {
      // Check if user with this email already exists
      const existing = registeredUsers.find(u => u.email.toLowerCase() === googleUserEmail.toLowerCase());
      if (existing) {
        switchUser(existing.id);
        setStatus({
          type: 'success',
          message: `Welcome back, ${existing.fullName || existing.username}! Signed in with Google.`,
        });
      } else {
        const usernameBase = googleUserName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'googletrader';
        const uniqueUsername = usernameBase + Math.floor(100 + Math.random() * 900);
        const res = registerUser({
          fullName: googleUserName,
          username: uniqueUsername,
          email: googleUserEmail,
          authMethod: 'google',
        });
        if (res.success) {
          setStatus({
            type: 'success',
            message: `Account created! Signed in as ${googleUserName} via Google.`,
          });
        }
      }

      setIsSubmitting(false);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 900);
    }, 600);
  };

  // Handle Facebook Sign-In Confirmation
  const handleConfirmFacebookAuth = (fbUserEmail: string, fbUserName: string) => {
    setIsSubmitting(true);
    setStatus(null);

    setTimeout(() => {
      // Check if user with this email already exists
      const existing = registeredUsers.find(u => u.email.toLowerCase() === fbUserEmail.toLowerCase());
      if (existing) {
        switchUser(existing.id);
        setStatus({
          type: 'success',
          message: `Welcome back, ${existing.fullName || existing.username}! Signed in with Facebook.`,
        });
      } else {
        const usernameBase = fbUserName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'fbtrader';
        const uniqueUsername = usernameBase + Math.floor(100 + Math.random() * 900);
        const res = registerUser({
          fullName: fbUserName,
          username: uniqueUsername,
          email: fbUserEmail,
          authMethod: 'facebook',
        });
        if (res.success) {
          setStatus({
            type: 'success',
            message: `Account created! Signed in as ${fbUserName} via Facebook.`,
          });
        }
      }

      setIsSubmitting(false);
      setTimeout(() => {
        setShowFacebookModal(false);
        onSuccess?.();
        onClose?.();
      }, 900);
    }, 600);
  };

  // Handle Apple Sign-In Confirmation
  const handleConfirmAppleAuth = () => {
    setIsSubmitting(true);
    setStatus(null);

    const appleEmail = appleEmailOption === 'share'
      ? email.trim() || 'anatolimarcenko980@gmail.com'
      : `relay.${Math.random().toString(36).substring(2, 8)}@privaterelay.appleid.com`;

    setTimeout(() => {
      const existing = registeredUsers.find(u => u.email.toLowerCase() === appleEmail.toLowerCase());
      if (existing) {
        switchUser(existing.id);
        setStatus({
          type: 'success',
          message: `Welcome back, ${existing.fullName || existing.username}! Authenticated with Apple ID.`,
        });
      } else {
        const usernameBase = appleName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'appletrader';
        const uniqueUsername = usernameBase + Math.floor(100 + Math.random() * 900);
        const res = registerUser({
          fullName: appleName,
          username: uniqueUsername,
          email: appleEmail,
          authMethod: 'apple',
        });
        if (res.success) {
          setStatus({
            type: 'success',
            message: `Account created! Signed in as ${appleName} via Apple ID.`,
          });
        }
      }

      setIsSubmitting(false);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 900);
    }, 700);
  };

  // Handle Web3 Connect Wallet / WalletConnect
  const handleConnectWalletSuccess = (walletName: string) => {
    setIsSubmitting(true);
    setStatus(null);

    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const mockAddress = `0x7F${randomHex}...b92E`;

    setTimeout(() => {
      const existing = registeredUsers.find(u => u.walletAddress === mockAddress);
      if (existing) {
        switchUser(existing.id);
        setStatus({
          type: 'success',
          message: `Connected with ${walletName} (${mockAddress})!`,
        });
      } else {
        const res = registerUser({
          fullName: `${walletName} Trader`,
          username: `Web3_${randomHex}`,
          email: `trader.${randomHex.toLowerCase()}@nexora.dex`,
          authMethod: 'wallet',
          walletAddress: mockAddress,
        });
        if (res.success) {
          setStatus({
            type: 'success',
            message: `Connected with ${walletName}! Account initialized.`,
          });
        }
      }

      setIsSubmitting(false);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 900);
    }, 600);
  };

  return (
    <div className="w-full text-white font-sans">
      {/* ---------------- STEP 1: MAIN MENU (EXACT SCREENSHOT LAYOUT) ---------------- */}
      {step === 'main' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t('logInOrSignUp', 'Log in or sign up')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                {t('startTradingInSeconds', 'Start trading in seconds. No KYC, funds stay in your wallet.')}
              </p>
            </div>

            {/* Language Selector in AuthCard */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-[#111318] border border-[#212631] hover:border-slate-500 transition-all flex items-center gap-1.5 cursor-pointer"
                title={t('selectLanguage', 'Select Language')}
              >
                <Globe className="w-3.5 h-3.5 text-[#00d2ff]" />
                {!hideFlag && <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag || '🌐'}</span>}
                <span className="uppercase text-[11px] font-mono">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-44 py-1.5 bg-[#0e121a] border border-[#222b3d] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1b2230]">
                    {t('selectLanguage', 'Select Language')}
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-[#1a2233] transition-colors ${
                          language === lang.code ? 'text-[#00d2ff] font-bold bg-[#00d2ff]/10' : 'text-slate-300'
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
          </div>

          {/* Status Alert if any */}
          {status && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">{status.message}</div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="space-y-3">
            {/* 1. Email */}
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setStep('email');
              }}
              className="w-full h-14 px-4 bg-[#111318] hover:bg-[#161a22] border border-[#212631] hover:border-slate-500 rounded-2xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 flex items-center justify-center text-slate-300">
                  <Mail className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="font-semibold text-sm text-white group-hover:text-white transition-colors">
                  {t('continueWithEmail', 'Email')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </button>

            {/* 2. Google */}
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setStep('google');
              }}
              className="w-full h-14 px-4 bg-[#111318] hover:bg-[#161a22] border border-[#212631] hover:border-slate-500 rounded-2xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  {/* Official Google Multicolor Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                </div>
                <span className="font-semibold text-sm text-white group-hover:text-white transition-colors">
                  {t('continueWithGoogle', 'Google')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </button>

            {/* 3. Facebook */}
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setShowFacebookModal(true);
              }}
              className="w-full h-14 px-4 bg-[#111318] hover:bg-[#161a22] border border-[#212631] hover:border-[#1877F2]/60 rounded-2xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-5 h-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="font-semibold text-sm text-white group-hover:text-[#1877F2] transition-colors">
                  {t('continueWithFacebook', 'Facebook')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </button>

            {/* 4. Apple */}
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setStep('apple');
              }}
              className="w-full h-14 px-4 bg-[#111318] hover:bg-[#161a22] border border-[#212631] hover:border-slate-500 rounded-2xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 flex items-center justify-center text-white">
                  {/* Official Apple Logo */}
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.59.69-1.12 1.83-.98 2.95 1.07.08 2.13-.53 2.79-1.29z" />
                  </svg>
                </div>
                <span className="font-semibold text-sm text-white group-hover:text-white transition-colors">
                  {t('continueWithApple', 'Apple')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </button>
          </div>

          {/* Quick SuperAdmin Access (hidden) */}
          <div className="hidden pt-2 border-t border-[#1e232d]/70 items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>SuperAdmin Access:</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const res = loginUser({ emailOrUsername: 'anatolimarcenko980@gmail.com' });
                if (res.success) {
                  setStatus({ type: 'success', message: 'Welcome back SuperAdmin Anatoli!' });
                  setTimeout(() => {
                    onSuccess?.();
                    onClose?.();
                  }, 500);
                } else {
                  handleConfirmGoogleAuth('anatolimarcenko980@gmail.com', 'Anatoli Marchenko');
                }
              }}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline"
              title="Sign in immediately as anatolimarcenko980@gmail.com"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign in as anatolimarcenko980</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 2: EMAIL FORM (NAME, EMAIL, PASSWORD) ---------------- */}
      {step === 'email' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setStep('main');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToAllOptions', 'Back to all options')}</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">{t('emailAuth', 'Email Auth')}</span>
          </div>

          {/* Mode Switcher: Sign Up vs Log In */}
          <div className="flex items-center p-1 bg-[#12151e] rounded-xl border border-[#212631]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setStatus(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-[#00d2ff] text-black shadow-md shadow-[#00d2ff]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('createAccount', 'Create Account')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setStatus(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-[#1e2433] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t('logIn', 'Log In')}</span>
            </button>
          </div>

          {/* Status Alert if any */}
          {status && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">{status.message}</div>
            </div>
          )}

          {/* SIGN UP FORM (Full Name, Username, Email, Password, Confirm Password) */}
          {authMode === 'register' ? (
            <form onSubmit={handleEmailRegister} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>{t('fullName', 'Full Name')}</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (!username) {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  placeholder="e.g. Anatoli Marchenko"
                  className="w-full h-11 bg-[#111318] border border-[#212631] focus:border-[#00d2ff] rounded-xl px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Username & Email in 2 columns on tablet or stacked */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>{t('username', 'Username')}</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. AnatoliM"
                    className="w-full h-11 bg-[#111318] border border-[#212631] focus:border-[#00d2ff] rounded-xl px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>{t('email', 'Email Address')}</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 bg-[#111318] border border-[#212631] focus:border-[#00d2ff] rounded-xl px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>{t('password', 'Password')}</span>
                    <span className="text-red-400">*</span>
                  </label>
                  {password && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {t('strengthLabel', 'Strength')}: <span className="font-bold text-white">{passStrength.label}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('atLeast6Chars', 'At least 6 characters')}
                    className="w-full h-11 bg-[#111318] border border-[#212631] focus:border-[#00d2ff] rounded-xl pl-3.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                {password && (
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4].map((stepIdx) => (
                      <div
                        key={stepIdx}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          passStrength.score >= stepIdx ? passStrength.color : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>{t('confirmPassword', 'Confirm Password')}</span>
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPassword', 'Confirm Password')}
                    className="w-full h-11 bg-[#111318] border border-[#212631] focus:border-[#00d2ff] rounded-xl pl-3.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="text-[10px] font-mono flex items-center gap-1 pt-0.5">
                    {passwordsMatch ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t('passwordsMatch', 'Passwords match')}
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {t('passwordsDoNotMatch', 'Passwords do not match')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Referral Code (Optional) */}
              <div className="pt-1">
                {!showReferralInput ? (
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(true)}
                    className="text-xs text-slate-400 hover:text-[#00d2ff] flex items-center gap-1 transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{t('haveReferralCode', 'Have a referral code? (Optional)')}</span>
                  </button>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('referralCode', 'Referral Code (Optional)')}</span>
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. NX-VIP"
                      className="w-full h-10 bg-[#111318] border border-[#212631] focus:border-[#00d2ff] rounded-xl px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono uppercase"
                    />
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#212631] bg-[#111318] text-[#00d2ff] focus:ring-[#00d2ff]/20"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-slate-400 leading-tight">
                  {t('agreeTermsShort', 'I agree to the Nexora Terms of Service and Privacy Policy. Funds are self-custodied.')}
                </label>
              </div>

              <GmailSenderConnectionCard compact />

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0088ff] hover:brightness-110 text-black font-extrabold text-sm shadow-lg shadow-[#00d2ff]/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('creatingAccount', 'Creating Account...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('createAccount', 'Create Account')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* LOG IN FORM */
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              {/* Email or Username */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>{t('email', 'Email')} / {t('username', 'Username')}</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full h-11 bg-[#111318] border border-[#212631] focus:border-[#00d2ff] rounded-xl px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>{t('password', 'Password')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus({
                        type: 'success',
                        message: 'Password reset link sent to registered email address.',
                      });
                    }}
                    className="text-[11px] text-[#00d2ff] hover:underline"
                  >
                    {t('forgotPassword', 'Forgot password?')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 bg-[#111318] border border-[#212631] focus:border-[#00d2ff] rounded-xl pl-3.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#212631] bg-[#111318] text-[#00d2ff] focus:ring-[#00d2ff]/20"
                  />
                  <span>{t('rememberThisBrowser', 'Remember this browser')}</span>
                </label>
              </div>

              {/* Submit Log In */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-white font-extrabold text-sm border border-[#334155] shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('loggingIn', 'Logging In...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('signInToDex', 'Log In to DEX')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="hidden pt-2 border-t border-[#1e232d]/70 items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>SuperAdmin?</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('anatolimarcenko980@gmail.com');
                    setLoginPassword('admin123');
                    const res = loginUser({ emailOrUsername: 'anatolimarcenko980@gmail.com' });
                    if (res.success) {
                      setStatus({ type: 'success', message: 'Welcome back SuperAdmin Anatoli!' });
                      setTimeout(() => {
                        onSuccess?.();
                        onClose?.();
                      }, 500);
                    }
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Sign In as SuperAdmin</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ---------------- STEP 3: GOOGLE SIGN-IN INTERACTIVE MODAL ---------------- */}
      {step === 'google' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setStep('main');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToAllOptions', 'Back to all options')}</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">{t('googleIdentity', 'Google Identity')}</span>
          </div>

          <div className="text-center space-y-1.5 pt-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 p-2.5 flex items-center justify-center shadow-lg border border-white/20">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
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
            </div>
            <h2 className="text-lg font-bold text-white">{t('signInWithGoogle', 'Sign in with Google')}</h2>
            <p className="text-xs text-slate-400">{t('chooseAccountContinue', 'Choose an account to continue to Nexora DEX')}</p>
          </div>

          {/* Status Alert if any */}
          {status && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">{status.message}</div>
            </div>
          )}

          {/* Account Picker Card */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleConfirmGoogleAuth('anatoliymarhenkoser1@gmail.com', 'Anatoliy Marchenko')}
              className="w-full p-3.5 bg-[#121620] hover:bg-[#181e2b] border border-[#212631] hover:border-[#4285F4] rounded-2xl flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] flex items-center justify-center font-bold text-white text-base shadow-md">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white group-hover:text-[#4285F4] transition-colors">
                      Anatoliy Marchenko
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                      Current
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    anatoliymarhenkoser1@gmail.com
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleConfirmGoogleAuth('anatolimarcenko980@gmail.com', 'Anatoli Marchenko')}
              className="hidden w-full p-3.5 bg-[#121620] hover:bg-[#181e2b] border border-[#212631] hover:border-[#4285F4] rounded-2xl items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#EA4335] to-[#FBBC05] flex items-center justify-center font-bold text-white text-base shadow-md">
                  A
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-[#4285F4] transition-colors">
                    Anatoli Marchenko
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    anatolimarcenko980@gmail.com
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center leading-relaxed">
            {t('googleShareNotice', 'To continue, Google will share your name, email address, and language preference with Nexora DEX.')}
          </div>
        </div>
      )}

      {/* ---------------- STEP 4: APPLE SIGN-IN SHEET ---------------- */}
      {step === 'apple' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setStep('main');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToAllOptions', 'Back to all options')}</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">{t('appleId', 'Apple ID')}</span>
          </div>

          <div className="text-center space-y-1.5 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white text-black p-2.5 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.59.69-1.12 1.83-.98 2.95 1.07.08 2.13-.53 2.79-1.29z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">{t('signInWithApple', 'Sign in with Apple')}</h2>
            <p className="text-xs text-slate-400">{t('signInWithAppleSubtitle', 'Create an account for Nexora DEX using your Apple ID')}</p>
          </div>

          {/* Status Alert if any */}
          {status && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">{status.message}</div>
            </div>
          )}

          {/* Apple ID Configuration Form */}
          <div className="space-y-3.5 bg-[#12141c] border border-[#212631] rounded-2xl p-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                {t('fullName', 'Name')}
              </label>
              <input
                type="text"
                value={appleName}
                onChange={(e) => setAppleName(e.target.value)}
                className="w-full h-10 bg-[#0a0c10] border border-[#212631] rounded-xl px-3 text-xs text-white focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                {t('emailPreference', 'Email Preference')}
              </label>

              {/* Share My Email */}
              <div
                onClick={() => setAppleEmailOption('share')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  appleEmailOption === 'share'
                    ? 'bg-[#181c28] border-white text-white'
                    : 'bg-[#0a0c10] border-[#212631] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{t('shareMyEmail', 'Share My Email')}</div>
                  <div className="text-[11px] font-mono text-slate-400">anatolimarcenko980@gmail.com</div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    appleEmailOption === 'share' ? 'border-white bg-white text-black' : 'border-slate-600'
                  }`}
                >
                  {appleEmailOption === 'share' && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
              </div>

              {/* Hide My Email */}
              <div
                onClick={() => setAppleEmailOption('hide')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  appleEmailOption === 'hide'
                    ? 'bg-[#181c28] border-white text-white'
                    : 'bg-[#0a0c10] border-[#212631] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{t('hideMyEmail', 'Hide My Email')}</div>
                  <div className="text-[11px] font-mono text-slate-400">{t('forwardPersonalEmail', 'Forward to your personal email')}</div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    appleEmailOption === 'hide' ? 'border-white bg-white text-black' : 'border-slate-600'
                  }`}
                >
                  {appleEmailOption === 'hide' && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
              </div>
            </div>
          </div>

          {/* Continue with Touch ID / Face ID */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmAppleAuth}
            className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 text-black font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>{t('verifyingAppleId', 'Verifying Apple ID...')}</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-5 h-5 text-black" />
                <span>{t('continueWithPasskey', 'Continue with Passkey / Face ID')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ---------------- STEP 5: WALLETCONNECT QR CODE ---------------- */}
      {step === 'wallet_connect' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setStep('main');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToAllOptions', 'Back to all options')}</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">WalletConnect</span>
          </div>

          <div className="text-center space-y-1 pt-1">
            <h2 className="text-lg font-bold text-white">{t('scanWithWalletConnect', 'Scan with WalletConnect')}</h2>
            <p className="text-xs text-slate-400">
              {t('scanQrInstruction', 'Scan this code with a WalletConnect-compatible mobile wallet app')}
            </p>
          </div>

          {/* Status Alert if any */}
          {status && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">{status.message}</div>
            </div>
          )}

          {/* High Fidelity QR Code Container */}
          <div className="p-5 bg-white rounded-2xl mx-auto w-64 h-64 flex flex-col items-center justify-center shadow-2xl relative group">
            {/* Real SVG QR Pattern */}
            <svg className="w-52 h-52 text-black" viewBox="0 0 100 100" fill="currentColor">
              {/* Outer top-left corner */}
              <rect x="5" y="5" width="28" height="28" rx="4" />
              <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
              <rect x="13" y="13" width="12" height="12" rx="2" />

              {/* Outer top-right corner */}
              <rect x="67" y="5" width="28" height="28" rx="4" />
              <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
              <rect x="75" y="13" width="12" height="12" rx="2" />

              {/* Outer bottom-left corner */}
              <rect x="5" y="67" width="28" height="28" rx="4" />
              <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
              <rect x="13" y="75" width="12" height="12" rx="2" />

              {/* Center decorative logo */}
              <rect x="38" y="38" width="24" height="24" rx="5" fill="#3b82f6" />
              <circle cx="50" cy="50" r="6" fill="white" />

              {/* Data points */}
              <rect x="38" y="10" width="8" height="6" />
              <rect x="52" y="10" width="6" height="8" />
              <rect x="38" y="24" width="10" height="6" />
              <rect x="54" y="22" width="6" height="10" />

              <rect x="10" y="38" width="6" height="10" />
              <rect x="22" y="42" width="10" height="6" />
              <rect x="10" y="54" width="10" height="6" />
              <rect x="24" y="54" width="8" height="6" />

              <rect x="68" y="40" width="8" height="6" />
              <rect x="80" y="44" width="10" height="8" />
              <rect x="68" y="52" width="6" height="10" />
              <rect x="78" y="56" width="12" height="6" />

              <rect x="40" y="68" width="8" height="10" />
              <rect x="52" y="70" width="10" height="8" />
              <rect x="38" y="82" width="12" height="8" />
              <rect x="54" y="84" width="8" height="8" />

              <rect x="70" y="68" width="10" height="8" />
              <rect x="84" y="72" width="6" height="12" />
              <rect x="72" y="84" width="18" height="6" />
            </svg>

            {/* Glowing scan line animation */}
            <div className="absolute inset-x-4 h-0.5 bg-[#3b82f6] shadow-[0_0_12px_#3b82f6] animate-bounce top-1/2 opacity-70 pointer-events-none" />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('wc:94718c2a-9413-4191-815a-9da2dae21f16@2?relay-protocol=irn&symKey=7f41e0');
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="py-2.5 px-3 bg-[#12151e] hover:bg-[#1a202d] border border-[#212631] rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? t('copiedUri', 'Copied URI!') : t('copyToClipboard', 'Copy to Clipboard')}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleConnectWalletSuccess('WalletConnect Mobile')}
              className="py-2.5 px-3 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 border border-[#3b82f6]/50 text-[#3b82f6] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('simulateScan', 'Simulate Scan')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 6: WEB3 WALLETS LIST ---------------- */}
      {step === 'wallets' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setStep('main');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToAllOptions', 'Back to all options')}</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">{t('web3Wallets', 'Web3 Wallets')}</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">{t('chooseWeb3Wallet', 'Choose a Web3 Wallet')}</h2>
            <p className="text-xs text-slate-400">{t('connectArbitrumHl', 'Connect to Arbitrum / Hyperliquid L1 directly')}</p>
          </div>

          {/* Wallets Grid */}
          <div className="space-y-2">
            {[
              { name: 'MetaMask', emoji: '🦊', desc: 'Popular Ethereum & EVM wallet', tag: 'Detected' },
              { name: 'Phantom', emoji: '👻', desc: 'Solana, Bitcoin & EVM multi-chain', tag: 'Popular' },
              { name: 'Coinbase Wallet', emoji: '🛡️', desc: 'Self-custody smart wallet' },
              { name: 'Rabby Wallet', emoji: '🐰', desc: 'Game-changing security for DeFi' },
              { name: 'Rainbow', emoji: '🌈', desc: 'Fun, simple, and secure Ethereum wallet' },
            ].map((w) => (
              <button
                key={w.name}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleConnectWalletSuccess(w.name)}
                className="w-full p-3 bg-[#111318] hover:bg-[#161a22] border border-[#212631] hover:border-[#00d2ff]/40 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#181d28] flex items-center justify-center text-base shadow-sm">
                    {w.emoji}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-white group-hover:text-[#00d2ff] transition-colors">
                      {w.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{w.desc}</div>
                  </div>
                </div>
                {w.tag && (
                  <span className="text-[10px] font-mono text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded border border-[#00d2ff]/20">
                    {w.tag}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Facebook Auth Modal */}
      <FacebookAuthModal
        isOpen={showFacebookModal}
        onClose={() => setShowFacebookModal(false)}
        mode={authMode}
        onConfirmFacebookAuth={handleConfirmFacebookAuth}
        isSubmitting={isSubmitting}
      />

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
          finalizeEmailRegister();
        }}
        onClose={() => setShowGmailVerifyModal(false)}
      />
    </div>
  );
};
