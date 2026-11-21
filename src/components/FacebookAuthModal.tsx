import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { X, ArrowRight, UserPlus, Check, ChevronRight, RefreshCw, ShieldCheck } from 'lucide-react';

interface FacebookAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'register' | 'login';
  onConfirmFacebookAuth: (email: string, name: string) => void;
  isSubmitting?: boolean;
}

export const FacebookAuthModal: React.FC<FacebookAuthModalProps> = ({
  isOpen,
  onClose,
  mode = 'login',
  onConfirmFacebookAuth,
  isSubmitting = false,
}) => {
  const { t } = useTrading();
  const [selectedEmail, setSelectedEmail] = useState<string>('anatoliymarhenkoser1@gmail.com');
  const [selectedName, setSelectedName] = useState<string>('Anatoliy Marchenko');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [customError, setCustomError] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Anatoliy Marchenko',
      email: 'anatoliymarhenkoser1@gmail.com',
      avatarColor: 'from-[#1877F2] to-[#0d5ac1]',
      initial: 'A',
      badge: 'Facebook Profile',
    },
  ];

  const handleSelectAccount = (account: { name: string; email: string }) => {
    setSelectedEmail(account.email);
    setSelectedName(account.name);
    setIsCustomMode(false);
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    const emailTrim = customEmail.trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes('@')) {
      setCustomError('Please enter a valid Facebook email address or phone number.');
      return;
    }
    const nameTrim = customName.trim() || emailTrim.split('@')[0];
    onConfirmFacebookAuth(emailTrim, nameTrim);
  };

  const handleConfirmSelected = () => {
    onConfirmFacebookAuth(selectedEmail, selectedName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0e1118] border border-[#212838] rounded-3xl shadow-2xl overflow-hidden font-sans text-white">
        {/* Top Facebook Blue Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1877F2] via-[#0866FF] to-[#0052cc]" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2130] transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Facebook Identity Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-[#1877F2] flex items-center justify-center shadow-md shrink-0">
              {/* Official Facebook SVG Logo */}
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {mode === 'register' ? t('signUpWithFacebook', 'Sign up with Facebook') : t('logInWithFacebook', 'Log in with Facebook')}
              </h3>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-white">Nexora DEX</span>
              </p>
            </div>
          </div>

          {/* Privacy & Permissions notice */}
          <div className="mb-5 p-3 rounded-2xl bg-[#121622] border border-[#1e2433] flex items-start gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-white">Nexora DEX</span> {t('fbPrivacyNotice', 'will receive your public profile name and email address.')}
            </div>
          </div>

          {!isCustomMode ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                {t('chooseAccount', 'Choose an account')}
              </div>

              {defaultAccounts.map((acc) => {
                const isSelected = selectedEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    disabled={isSubmitting}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1877F2]/10 border-[#1877F2] shadow-[0_0_15px_rgba(24,119,242,0.2)]'
                        : 'bg-[#12151f] border-[#222a3d] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${acc.avatarColor} flex items-center justify-center font-bold text-white text-base shadow`}
                      >
                        {acc.initial}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{acc.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1877F2]/20 text-[#1877F2] font-mono">
                            {acc.badge}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{acc.email}</span>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                );
              })}

              {/* Use another Facebook account */}
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  setCustomError(null);
                }}
                disabled={isSubmitting}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#2a3449] hover:border-[#1877F2] text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#1877F2]" />
                <span>{t('useAnotherFacebook', 'Use another Facebook account')}</span>
              </button>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#1a2130] transition-all cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelected}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] shadow-[0_0_15px_rgba(24,119,242,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('connecting', 'Connecting...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('continueAs', 'Continue as')} {selectedName.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitCustom} className="space-y-4">
              <div className="text-xs font-semibold text-slate-300 mb-2">
                {t('enterFacebookDetails', 'Enter your Facebook Account Details')}
              </div>

              {customError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {customError}
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('yourName', 'Your Name')}</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12151f] border border-[#232c40] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('fbEmailOrPhone', 'Facebook Email or Phone')}</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="alex.rivera@meta.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12151f] border border-[#232c40] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1877F2]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#1a2130] transition-all cursor-pointer"
                >
                  {t('back', 'Back')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] shadow-[0_0_15px_rgba(24,119,242,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('authenticating', 'Authenticating...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('continueWithFacebook', 'Continue with Facebook')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
