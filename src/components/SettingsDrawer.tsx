import React, { useState } from 'react';
import { useTrading, AppTheme, CandleColorPalette, BuyButtonColor, LayoutDensity, FiatCurrency, RpcNetwork } from '../context/TradingContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../i18n/translations';
import { MarginMode } from '../types/market';
import { GmailSenderConnectionCard } from './GmailVerificationModal';
import {
  X,
  Shield,
  Key,
  Mail,
  Lock,
  Globe,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  PlusCircle,
  RefreshCw,
  Sparkles,
  User,
  UserPlus,
  Zap,
  Copy,
  Trash2,
  Terminal,
  Code2,
  CheckCheck,
  Palette,
  Sliders,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Flag,
  FlagOff,
  DollarSign,
  Cpu,
  TrendingUp,
} from 'lucide-react';

interface SettingsDrawerProps {
  onClose: () => void;
  onOpenRegister?: () => void;
  onOpenAdmin?: () => void;
}

type SettingsTab = 'appearance' | 'trading' | 'account' | 'apikeys' | 'language';

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ onClose, onOpenRegister, onOpenAdmin }) => {
  const {
    t,
    language,
    setLanguage,
    userEmail,
    updateEmail,
    updatePassword,
    walletAddress,
    currentUser,
    isAdmin,
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
  } = useTrading();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  // Change Email State
  const [newEmail, setNewEmail] = useState<string>('');
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Custom slippage input
  const [customSlippage, setCustomSlippage] = useState<string>(slippageTolerance.toString());

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    const hasNum = /\d/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    if (pass.length >= 10 && hasNum && hasSpecial) {
      return { score: 3, label: 'Strong', color: 'bg-emerald-400' };
    }
    if (pass.length >= 7 && (hasNum || hasSpecial)) {
      return { score: 2, label: 'Good', color: 'bg-[#00d2ff]' };
    }
    return { score: 1, label: 'Weak', color: 'bg-amber-400' };
  };

  const passStrength = getPasswordStrength(newPassword);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus(null);
    const res = updateEmail(newEmail);
    if (res.success) {
      setEmailStatus({ type: 'success', message: t('emailUpdated') });
      setNewEmail('');
    } else {
      setEmailStatus({ type: 'error', message: res.error || t('invalidEmail') });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    const res = updatePassword(currentPassword, newPassword, confirmPassword);
    if (res.success) {
      setPasswordStatus({ type: 'success', message: t('passwordUpdated') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({ type: 'error', message: res.error || t('passwordMismatch') });
    }
  };

  // DEX API Key Management State
  const [apiKeys, setApiKeys] = useState<Array<{
    id: string;
    name: string;
    key: string;
    secret: string;
    createdAt: string;
    canTrade: boolean;
    canRead: boolean;
  }>>(() => {
    try {
      const saved = localStorage.getItem('nexora_dex_api_keys');
      return saved ? JSON.parse(saved) : [
        {
          id: 'key-1',
          name: 'AlgoTrading-Bot-01',
          key: 'nx_live_8f3a9e142b7c0d51f9a8e2b4c6d8e0f2',
          secret: 'sec_7d9a1c3e5f7b0a2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f1a3b',
          createdAt: '2026-10-24',
          canRead: true,
          canTrade: true,
        }
      ];
    } catch {
      return [];
    }
  });

  const [isCreatingKey, setIsCreatingKey] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [keyCanTrade, setKeyCanTrade] = useState<boolean>(true);
  const [keyCanRead, setKeyCanRead] = useState<boolean>(true);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedKeyText, setCopiedKeyText] = useState<string | null>(null);

  const saveApiKeys = (keys: typeof apiKeys) => {
    setApiKeys(keys);
    try {
      localStorage.setItem('nexora_dex_api_keys', JSON.stringify(keys));
    } catch {}
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const hex = (len: number) => {
      const chars = '0123456789abcdef';
      let res = '';
      for (let i = 0; i < len; i++) {
        res += chars[Math.floor(Math.random() * chars.length)];
      }
      return res;
    };

    const newKey = {
      id: 'key-' + Date.now(),
      name: newKeyName.trim() || `API-Key-${apiKeys.length + 1}`,
      key: 'nx_live_' + hex(32),
      secret: 'sec_' + hex(48),
      createdAt: new Date().toISOString().split('T')[0],
      canRead: keyCanRead,
      canTrade: keyCanTrade,
    };

    saveApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setIsCreatingKey(false);
  };

  const handleDeleteApiKey = (id: string) => {
    saveApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyText(label);
    setTimeout(() => setCopiedKeyText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0a0c10] border border-[#1e293b] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl overflow-hidden font-sans max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]/70 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {t('accountSettings')}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {t('preferences')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (5 Clean Categories) */}
        <div className="flex items-center gap-1 bg-[#10131d] p-1 rounded-xl border border-[#1e293b] mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 min-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'appearance'
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span>{t('appearance')}</span>
          </button>

          <button
            onClick={() => setActiveTab('trading')}
            className={`flex-1 min-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'trading'
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('trading')}</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 min-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'account'
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{t('account')}</span>
          </button>

          <button
            onClick={() => setActiveTab('apikeys')}
            className={`flex-1 min-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apikeys'
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('apiKeys')}</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`flex-1 min-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'language'
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('language')}</span>
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* ================= TAB 1: APPEARANCE (CHART COLORS, BUY BUTTON, HIDE FLAG) ================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 1. Chart Color Palette (Blue vs Green) */}
              <div className="p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00d2ff]" />
                    <span className="font-bold text-white text-xs">{t('chartColorPalette')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    <strong className="text-white">{candleColors === 'emerald-ruby' ? t('classicGreenRed') : t('modernCyanCoral')}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t('chartPaletteDesc')}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Option A: Classic Green / Red */}
                  <div
                    onClick={() => setCandleColors('emerald-ruby')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                      candleColors === 'emerald-ruby'
                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40 shadow-md shadow-emerald-500/10'
                        : 'bg-[#141824] border-[#1e293b] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
                        {t('classicGreenRed')}
                      </span>
                      {candleColors === 'emerald-ruby' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-400 text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Visual mini-chart candle swatch */}
                    <div className="flex items-end gap-1.5 h-7 p-1 bg-[#0b0d13] rounded-lg border border-[#1e293b]/70 justify-center">
                      <div className="w-2 h-4 bg-emerald-400 rounded-[1px] relative shadow-sm shadow-emerald-400/30">
                        <div className="w-[1px] h-6 bg-emerald-400 absolute left-1/2 -translate-x-1/2 -top-1" />
                      </div>
                      <div className="w-2 h-3 bg-red-400 rounded-[1px] relative">
                        <div className="w-[1px] h-5 bg-red-400 absolute left-1/2 -translate-x-1/2 -top-1" />
                      </div>
                      <div className="w-2 h-5 bg-emerald-400 rounded-[1px] relative shadow-sm shadow-emerald-400/30">
                        <div className="w-[1px] h-7 bg-emerald-400 absolute left-1/2 -translate-x-1/2 -top-1" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">#10b981</span>
                  </div>

                  {/* Option B: Modern Cyan / Coral */}
                  <div
                    onClick={() => setCandleColors('cyan-coral')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                      candleColors === 'cyan-coral'
                        ? 'bg-[#00d2ff]/10 border-[#00d2ff] ring-1 ring-[#00d2ff]/40 shadow-md shadow-[#00d2ff]/10'
                        : 'bg-[#141824] border-[#1e293b] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff] inline-block shadow-sm shadow-[#00d2ff]/50" />
                        {t('modernCyanCoral')}
                      </span>
                      {candleColors === 'cyan-coral' && (
                        <div className="w-4 h-4 rounded-full bg-[#00d2ff] text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Visual mini-chart candle swatch */}
                    <div className="flex items-end gap-1.5 h-7 p-1 bg-[#0b0d13] rounded-lg border border-[#1e293b]/70 justify-center">
                      <div className="w-2 h-4 bg-[#00d2ff] rounded-[1px] relative shadow-sm shadow-[#00d2ff]/30">
                        <div className="w-[1px] h-6 bg-[#00d2ff] absolute left-1/2 -translate-x-1/2 -top-1" />
                      </div>
                      <div className="w-2 h-3 bg-[#ff4d4d] rounded-[1px] relative">
                        <div className="w-[1px] h-5 bg-[#ff4d4d] absolute left-1/2 -translate-x-1/2 -top-1" />
                      </div>
                      <div className="w-2 h-5 bg-[#00d2ff] rounded-[1px] relative shadow-sm shadow-[#00d2ff]/30">
                        <div className="w-[1px] h-7 bg-[#00d2ff] absolute left-1/2 -translate-x-1/2 -top-1" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">#00d2ff</span>
                  </div>
                </div>
              </div>

              {/* 2. Buy / Long Button Color (Green vs Cyan) */}
              <div className="p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">{t('buyButtonColor')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    <strong className="text-white">{buyButtonColor === 'green' ? t('classicGreen') : t('modernCyan')}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('buyButtonColorDesc')}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Green Buy Button */}
                  <button
                    type="button"
                    onClick={() => setBuyButtonColor('green')}
                    className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer ${
                      buyButtonColor === 'green'
                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm'
                        : 'bg-[#141824] border-[#1e293b] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{t('classicGreen')}</span>
                      {buyButtonColor === 'green' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-400 text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs text-center shadow-md shadow-emerald-500/20">
                      {t('openPositionLong')} ({t('buyLong')})
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">#10b981</span>
                  </button>

                  {/* Cyan Buy Button */}
                  <button
                    type="button"
                    onClick={() => setBuyButtonColor('cyan')}
                    className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer ${
                      buyButtonColor === 'cyan'
                        ? 'bg-[#00d2ff]/10 border-[#00d2ff] ring-1 ring-[#00d2ff]/40 shadow-sm'
                        : 'bg-[#141824] border-[#1e293b] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{t('modernCyan')}</span>
                      {buyButtonColor === 'cyan' && (
                        <div className="w-4 h-4 rounded-full bg-[#00d2ff] text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="py-2 px-3 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe8] text-black font-extrabold text-xs text-center shadow-md shadow-[#00d2ff]/20">
                      {t('openPositionLong')} ({t('buyLong')})
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">#00d2ff</span>
                  </button>
                </div>
              </div>

              {/* 3. Hide Country Flag in Header Toggle (hidden) */}
              <div className="hidden p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {hideFlag ? (
                      <FlagOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Flag className="w-4 h-4 text-[#00d2ff]" />
                    )}
                    <div>
                      <span className="font-bold text-white text-xs block">
                        {t('hideCountryFlag')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {hideFlag ? t('flagHiddenDesc') : t('flagShownDesc')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHideFlag(!hideFlag)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                      hideFlag ? 'bg-[#00d2ff]' : 'bg-[#1e293b]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hideFlag ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 4. App Theme (Dark, Midnight) */}
              <div className="p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white text-xs">{t('interfaceTheme')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono capitalize">
                    {theme === 'dark' ? t('darkTheme') : t('midnightTheme')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dark', label: t('darkTheme'), desc: 'Hyperliquid Gray' },
                    { id: 'midnight', label: t('midnightTheme'), desc: 'OLED Black' },
                  ].map((tOpt) => (
                    <button
                      key={tOpt.id}
                      type="button"
                      onClick={() => setTheme(tOpt.id as AppTheme)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        theme === tOpt.id
                          ? 'bg-[#1e293b] border-[#00d2ff] text-white shadow-sm'
                          : 'bg-[#141824] border-[#1e293b] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{tOpt.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{tOpt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Additional Display Preferences (Layout, Flashes, Balance Privacy, Currency) */}
              <div className="p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-3.5 text-xs">
                <span className="font-bold text-white text-xs block">
                  {t('interfaceDisplayTweaks')}
                </span>

                {/* Layout Density */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white block font-medium">{t('layoutDensity')}</span>
                    <span className="text-[11px] text-slate-400">{t('layoutDensityDesc')}</span>
                  </div>
                  <div className="flex items-center bg-[#141824] p-1 rounded-lg border border-[#1e293b]">
                    <button
                      onClick={() => setLayoutDensity('comfortable')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        layoutDensity === 'comfortable' ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('comfortable')}
                    </button>
                    <button
                      onClick={() => setLayoutDensity('compact')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        layoutDensity === 'compact' ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('compact')}
                    </button>
                  </div>
                </div>

                {/* Price Flash Animations */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/60">
                  <div>
                    <span className="text-white block font-medium">{t('priceFlashing')}</span>
                    <span className="text-[11px] text-slate-400">{t('priceFlashingDesc')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPriceFlashEnabled(!priceFlashEnabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      priceFlashEnabled ? 'bg-[#00d2ff]' : 'bg-[#1e293b]'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        priceFlashEnabled ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto-Hide Balances Privacy */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/60">
                  <div>
                    <span className="text-white block font-medium">{t('privacyMode')}</span>
                    <span className="text-[11px] text-slate-400">{t('privacyModeDesc')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoHideBalances(!autoHideBalances)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      autoHideBalances ? 'bg-[#00d2ff]' : 'bg-[#1e293b]'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        autoHideBalances ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Display Fiat Currency */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/60">
                  <div>
                    <span className="text-white block font-medium">{t('referenceCurrency')}</span>
                    <span className="text-[11px] text-slate-400">{t('baseValuationUnit')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['USD', 'EUR', 'GBP', 'JPY'] as FiatCurrency[]).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setFiatCurrency(curr)}
                        className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                          fiatCurrency === curr
                            ? 'bg-[#00d2ff] text-black shadow-sm'
                            : 'bg-[#141824] text-slate-400 hover:text-white border border-[#1e293b]'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: TRADING & RISK SETTINGS ================= */}
          {activeTab === 'trading' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-4 text-xs">
                <span className="font-bold text-white text-xs block">
                  {t('orderExecutionMarginRules')}
                </span>

                {/* One-Click Instant Orders */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white block font-medium">{t('oneClickTrading')}</span>
                    <span className="text-[11px] text-slate-400">{t('oneClickTradingDesc')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOneClickTrading(!oneClickTrading)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      oneClickTrading ? 'bg-emerald-500' : 'bg-[#1e293b]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        oneClickTrading ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Default Leverage Preset */}
                <div className="pt-2 border-t border-[#1e293b]/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{t('defaultOrderLeverage')}</span>
                    <span className="font-mono text-emerald-400 font-bold">{defaultOrderLeverage}x</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[2, 5, 10, 20, 25, 50].map((lev) => (
                      <button
                        key={lev}
                        type="button"
                        onClick={() => setDefaultOrderLeverage(lev)}
                        className={`flex-1 min-w-[42px] py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          defaultOrderLeverage === lev
                            ? 'bg-[#00d2ff] text-black shadow-sm'
                            : 'bg-[#141824] text-slate-400 hover:text-white border border-[#1e293b]'
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Slippage Tolerance */}
                <div className="pt-2 border-t border-[#1e293b]/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{t('maxSlippageTolerance')}</span>
                    <span className="font-mono text-[#00d2ff] font-bold">{slippageTolerance}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0.1, 0.5, 1.0, 2.0].map((slip) => (
                      <button
                        key={slip}
                        type="button"
                        onClick={() => {
                          setSlippageTolerance(slip);
                          setCustomSlippage(slip.toString());
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          slippageTolerance === slip
                            ? 'bg-[#00d2ff] text-black shadow-sm'
                            : 'bg-[#141824] text-slate-400 hover:text-white border border-[#1e293b]'
                        }`}
                      >
                        {slip}%
                      </button>
                    ))}
                    <div className="relative w-24">
                      <input
                        type="number"
                        step="0.1"
                        min="0.05"
                        max="5.0"
                        value={customSlippage}
                        onChange={(e) => {
                          setCustomSlippage(e.target.value);
                          const parsed = parseFloat(e.target.value);
                          if (!isNaN(parsed) && parsed > 0) setSlippageTolerance(parsed);
                        }}
                        placeholder="%"
                        className="w-full bg-[#141824] border border-[#1e293b] rounded-lg py-1 px-2 text-xs text-white font-mono text-center focus:outline-none focus:border-[#00d2ff]"
                      />
                    </div>
                  </div>
                </div>

                {/* Default Margin Mode */}
                <div className="pt-2 border-t border-[#1e293b]/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{t('defaultMarginMode')}</span>
                    <span className="font-mono text-purple-400 font-bold uppercase">
                      {defaultMarginMode === 'cross' ? t('cross') : t('isolated')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDefaultMarginMode('cross')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        defaultMarginMode === 'cross'
                          ? 'bg-[#1e293b] border-[#00d2ff] text-white'
                          : 'bg-[#141824] border-[#1e293b] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white text-xs">{t('crossMargin')}</div>
                      <div className="text-[10px] text-slate-400">{t('crossMarginDesc')}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultMarginMode('isolated')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        defaultMarginMode === 'isolated'
                          ? 'bg-[#1e293b] border-[#00d2ff] text-white'
                          : 'bg-[#141824] border-[#1e293b] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white text-xs">{t('isolatedMargin')}</div>
                      <div className="text-[10px] text-slate-400">{t('isolatedMarginDesc')}</div>
                    </button>
                  </div>
                </div>

                {/* RPC Network Route */}
                <div className="pt-2 border-t border-[#1e293b]/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{t('rpcConsensusNetwork')}</span>
                    <span className="text-[10px] font-mono text-blue-400 font-bold">{t('subSecondFinality')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'hyperliquid-l1', label: 'Hyperliquid L1', tag: '<50ms' },
                      { id: 'arbitrum-one', label: 'Arbitrum One', tag: 'Gateway' },
                      { id: 'direct-mempool', label: 'Direct Mempool', tag: 'MEV-Free' },
                    ].map((rpc) => (
                      <button
                        key={rpc.id}
                        type="button"
                        onClick={() => setSelectedRpcNetwork(rpc.id as RpcNetwork)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          selectedRpcNetwork === rpc.id
                            ? 'bg-[#1e293b] border-[#00d2ff] text-white'
                            : 'bg-[#141824] border-[#1e293b] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-white leading-tight">{rpc.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rpc.tag}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound & Audio Feedback */}
                <div className="pt-2 border-t border-[#1e293b]/60 flex items-center justify-between">
                  <div>
                    <span className="text-white block font-medium">{t('soundEffects')}</span>
                    <span className="text-[11px] text-slate-400">{t('soundEffectsDesc')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playAudioFeedback('fill')}
                      className="px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] border border-[#1e293b] text-slate-300 text-[10px] font-mono transition-colors"
                    >
                      {t('testAudio')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        soundEnabled ? 'bg-[#00d2ff]' : 'bg-[#1e293b]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: ACCOUNT & SECURITY ================= */}
          {activeTab === 'account' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Registered Account Status Card */}
              {currentUser && (
                <div className="p-4 bg-gradient-to-br from-[#121828] to-[#0a0d16] border border-[#1e293b] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#0077ff] flex items-center justify-center text-black font-extrabold text-sm shadow-md shadow-[#00d2ff]/20">
                        {currentUser.username.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">
                            {currentUser.username}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30 font-bold">
                            {currentUser.vipTier}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: <strong className="text-white">{currentUser.id}</strong> · {currentUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin && onOpenAdmin && (
                        <button
                          onClick={onOpenAdmin}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{t('adminPanel')}</span>
                        </button>
                      )}

                      {onOpenRegister && (
                        <button
                          onClick={onOpenRegister}
                          className="px-3 py-1.5 rounded-lg bg-[#00d2ff]/15 hover:bg-[#00d2ff]/25 border border-[#00d2ff]/40 text-[#00d2ff] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{t('registerNew')}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e293b]/60 text-[10px] font-mono text-slate-400">
                    <div>
                      <span>{t('makerFee')}:</span>
                      <div className="text-emerald-400 font-bold text-xs">0.00% ({t('free')})</div>
                    </div>
                    <div>
                      <span>Taker:</span>
                      <div className="text-white font-bold text-xs">{currentUser.takerFeeRate}%</div>
                    </div>
                    <div>
                      <span>ID:</span>
                      <div className="text-slate-300 font-bold text-xs">{currentUser.registeredAt}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gmail Verification Sender Setup */}
              <div className="hidden">
                <GmailSenderConnectionCard />
              </div>

              {/* Change Email Section */}
              <div className="p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#00d2ff]" />
                    <span className="font-bold text-white text-xs">{t('changeEmail')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {t('currentEmail')}: <strong className="text-white">{userEmail}</strong>
                  </span>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('newEmail')}
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. yourname@domain.com"
                      className="w-full bg-[#161a26] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] font-mono"
                    />
                  </div>

                  {emailStatus && (
                    <div
                      className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                        emailStatus.type === 'success'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {emailStatus.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{emailStatus.message}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!newEmail}
                      className="py-1.5 px-4 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe8] disabled:opacity-40 disabled:pointer-events-none text-black font-bold text-xs transition-colors"
                    >
                      {t('saveEmail')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password Section */}
              <div className="p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00d2ff]" />
                  <span className="font-bold text-white text-xs">{t('updatePassword')}</span>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('currentPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#161a26] border border-[#1e293b] rounded-lg py-2 pl-3 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] text-slate-400">
                        {t('newPassword')}
                      </label>
                      {newPassword && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Strength: <strong className="text-white">{passStrength.label}</strong>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-[#161a26] border border-[#1e293b] rounded-lg py-2 pl-3 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="w-full h-1 bg-[#1e293b] rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full ${passStrength.color} transition-all duration-300`}
                          style={{ width: `${(passStrength.score / 3) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('confirmNewPassword')}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-[#161a26] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] font-mono"
                    />
                  </div>

                  {passwordStatus && (
                    <div
                      className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                        passwordStatus.type === 'success'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {passwordStatus.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{passwordStatus.message}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!newPassword || !confirmPassword}
                      className="py-1.5 px-4 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe8] disabled:opacity-40 disabled:pointer-events-none text-black font-bold text-xs transition-colors"
                    >
                      {t('updatePassword')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= TAB 4: API KEYS ================= */}
          {activeTab === 'apikeys' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-[#10131d] border border-[#1e293b] rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block leading-tight">
                        {t('apiKeys')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Hyperliquid L1
                      </span>
                    </div>
                  </div>

                  {!isCreatingKey && (
                    <button
                      onClick={() => setIsCreatingKey(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#00d2ff] hover:bg-[#38bdf8] text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-[#00d2ff]/20 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{t('createNewApiKey')}</span>
                    </button>
                  )}
                </div>

                {isCreatingKey && (
                  <form
                    onSubmit={handleCreateApiKey}
                    className="p-3.5 bg-[#151926] border border-[#00d2ff]/40 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#00d2ff]" />
                        {t('createNewApiKey')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingKey(false)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {t('apiKeyLabel')}
                      </label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder={t('apiKeyLabel')}
                        required
                        className="w-full bg-[#0c0e15] border border-[#21283b] rounded-lg py-1.5 px-3 text-white text-xs font-mono focus:outline-none focus:border-[#00d2ff]"
                      />
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={keyCanRead}
                          onChange={(e) => setKeyCanRead(e.target.checked)}
                          className="rounded border-[#2a3449] text-[#00d2ff] focus:ring-0"
                        />
                        <span>{t('readOnly')}</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={keyCanTrade}
                          onChange={(e) => setKeyCanTrade(e.target.checked)}
                          className="rounded border-[#2a3449] text-[#00d2ff] focus:ring-0"
                        />
                        <span>{t('tradeExecution')}</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                      <button
                        type="button"
                        onClick={() => setIsCreatingKey(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-[#00d2ff] hover:bg-[#38bdf8] text-black font-bold text-xs transition-all shadow-sm"
                      >
                        {t('generateKey')}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5">
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-4 bg-[#0a0c10] border border-[#1e293b]/60 rounded-xl text-xs text-slate-500">
                      {t('noApiKeys')}
                    </div>
                  ) : (
                    apiKeys.map((k) => {
                      const isRevealed = !!revealedSecrets[k.id];
                      return (
                        <div
                          key={k.id}
                          className="p-3 bg-[#0c0e15] border border-[#1e293b] rounded-xl space-y-2 font-mono text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-xs font-sans">
                                {k.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                                {t('activeVerified')}
                              </span>
                              {k.canTrade && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30">
                                  {t('tradeExecution')}
                                </span>
                              )}
                              {k.canRead && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  {t('readOnly')}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteApiKey(k.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors p-1"
                              title={t('cancel')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                              <span>{t('apiKeys')}:</span>
                              <span className="font-mono text-[9px] text-slate-600">{k.createdAt}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#141824] px-2.5 py-1.5 rounded-lg border border-[#1e293b]">
                              <span className="text-[11px] text-slate-300 truncate flex-1 select-all font-mono">
                                {k.key}
                              </span>
                              <button
                                onClick={() => copyToClipboard(k.key, `key-${k.id}`)}
                                className="text-slate-400 hover:text-white transition-colors shrink-0 p-1 rounded hover:bg-[#1f2638]"
                                title={t('copyText')}
                              >
                                {copiedKeyText === `key-${k.id}` ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-sans block">
                              {t('apiSecretNotice')}
                            </span>
                            <div className="flex items-center gap-1.5 bg-[#141824] px-2.5 py-1.5 rounded-lg border border-[#1e293b]">
                              <span className="text-[11px] text-slate-300 truncate flex-1 select-all font-mono">
                                {isRevealed ? k.secret : '••••••••••••••••••••••••••••••••'}
                              </span>
                              <button
                                onClick={() => setRevealedSecrets(prev => ({ ...prev, [k.id]: !prev[k.id] }))}
                                className="text-slate-400 hover:text-white transition-colors shrink-0 p-1 rounded hover:bg-[#1f2638]"
                              >
                                {isRevealed ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(k.secret, `sec-${k.id}`)}
                                className="text-slate-400 hover:text-white transition-colors shrink-0 p-1 rounded hover:bg-[#1f2638]"
                                title={t('copyText')}
                              >
                                {copiedKeyText === `sec-${k.id}` ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: LANGUAGE ================= */}
          {activeTab === 'language' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-[#10131d] border border-[#1e293b] rounded-xl">
                <span className="text-xs font-bold text-white block mb-1">
                  {t('selectLanguage')}
                </span>
                <p className="text-[11px] text-slate-400 mb-3">
                  {t('chooseLanguageDesc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <div
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#00d2ff]/10 border-[#00d2ff] shadow-md shadow-[#00d2ff]/10'
                            : 'bg-[#141824] border-[#1e293b] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {!hideFlag ? (
                            <span className="text-2xl select-none">{lang.flag}</span>
                          ) : (
                            <Globe className="w-5 h-5 text-slate-400" />
                          )}
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {lang.nativeName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {lang.name}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#00d2ff] text-black flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Done Button */}
        <div className="pt-3 mt-3 border-t border-[#1e293b]/70 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-[#00d2ff] hover:bg-[#00bfe8] text-black font-bold text-xs transition-colors cursor-pointer"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </div>
  );
};
