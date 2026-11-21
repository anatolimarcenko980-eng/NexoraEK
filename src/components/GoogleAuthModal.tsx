import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { X, ArrowRight, UserPlus, Check, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'register' | 'login';
  onConfirmGoogleAuth: (email: string, name: string) => void;
  isSubmitting?: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  mode = 'login',
  onConfirmGoogleAuth,
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
      avatarColor: 'from-[#4285F4] to-[#34A853]',
      initial: 'A',
      badge: 'Current Account',
    },
    {
      name: 'Anatoli Marchenko',
      email: 'anatolimarcenko980@gmail.com',
      avatarColor: 'from-[#EA4335] to-[#FBBC05]',
      initial: 'A',
      badge: 'SuperAdmin Account',
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
      setCustomError('Please enter a valid Google email address.');
      return;
    }
    const nameTrim = customName.trim() || emailTrim.split('@')[0];
    onConfirmGoogleAuth(emailTrim, nameTrim);
  };

  const handleConfirmSelected = () => {
    onConfirmGoogleAuth(selectedEmail, selectedName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0e1118] border border-[#212838] rounded-3xl shadow-2xl overflow-hidden font-sans text-white">
        {/* Top Google Colors Accent Bar */}
        <div className="grid grid-cols-4 h-1.5 w-full">
          <div className="bg-[#4285F4]" />
          <div className="bg-[#EA4335]" />
          <div className="bg-[#FBBC05]" />
          <div className="bg-[#34A853]" />
        </div>

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
          {/* Google Identity Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {mode === 'register' ? t('registerWithGoogle', 'Register with Google') : t('signInWithGoogle', 'Sign in with Google')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('chooseAccountToContinue', 'Choose an account to continue to')} <span className="text-[#00d2ff] font-semibold">Nexora DEX</span>
              </p>
            </div>
          </div>

          {!isCustomMode ? (
            <>
              {/* Account List */}
              <div className="space-y-2 mb-5">
                {defaultAccounts.map((acc) => {
                  const isSelected = selectedEmail === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectAccount(acc)}
                      disabled={isSubmitting}
                      className={`hidden w-full p-3 rounded-2xl items-center justify-between text-left transition-all border ${
                        isSelected
                          ? 'bg-[#182133] border-[#4285F4] shadow-md shadow-[#4285F4]/10'
                          : 'bg-[#121622] border-[#222a3d] hover:border-slate-500 hover:bg-[#151b2a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${acc.avatarColor} flex items-center justify-center font-bold text-white text-sm shadow-sm`}
                        >
                          {acc.initial}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-white">
                              {acc.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                              {acc.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {acc.email}
                          </span>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#4285F4] flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  );
                })}

                {/* Option to use another Google account */}
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-2xl bg-[#121622] hover:bg-[#151b2a] border border-[#222a3d] hover:border-slate-500 flex items-center justify-between text-left transition-all text-xs text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-medium text-white block">{t('useAnotherGoogleAccount', 'Use another Google account')}</span>
                      <span className="text-[11px] text-slate-400">{t('enterCustomGmail', 'Enter custom Gmail or Workspace')}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmSelected}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#4285F4]" />
                      <span>{t('connectingWithGoogle', 'Connecting with Google...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('continueAs', 'Continue as')} {selectedName.split(' ')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Custom Google Email Form */
            <form onSubmit={handleSubmitCustom} className="space-y-3.5 mb-2 text-xs font-mono">
              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-300 font-semibold font-sans">{t('enterGoogleAccount', 'Enter Google Account')}</span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs text-[#00d2ff] hover:underline font-sans cursor-pointer"
                >
                  {t('backToSuggested', 'Back to suggested')}
                </button>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{t('yourFullName', 'Your Full Name')}</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#141824] border border-[#242e42] rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{t('googleEmailAddress', 'Google Email Address')}</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  className="w-full bg-[#141824] border border-[#242e42] rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              {customError && (
                <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 p-2 rounded-lg">
                  {customError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 font-sans"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('verifyingGoogleAccount', 'Verifying Google Account...')}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'register' ? t('registerWithGoogle', 'Register with Google') : t('signInWithGoogle', 'Sign In with Google')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy & Trust Footnote */}
          <div className="mt-4 pt-3.5 border-t border-[#1b2230] text-[10px] text-slate-500 text-center leading-relaxed font-sans">
            {t('googlePrivacyFootnote', 'To continue, Google will share your verified name, email address, and language preference with Nexora DEX. Zero private key exposure.')}
          </div>
        </div>
      </div>
    </div>
  );
};
