import React, { useState, useEffect } from 'react';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  RefreshCw,
  LogOut,
  KeyRound,
} from 'lucide-react';
import {
  connectGmailSender,
  disconnectGmailSender,
  getConnectedGmailSender,
  initGmailAuth,
  sendVerificationCodeViaGmail,
} from '../services/gmailService';

interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Official Google Identity-styled Sign in with Google button
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
  disabled = false,
  label = 'Sign in with Google',
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-lg bg-white hover:bg-[#f8f9fa] active:bg-[#eee] text-[#1f1f1f] border border-[#747775]/40 font-medium text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 select-none"
    style={{ fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
  >
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
    <span>{label}</span>
  </button>
);

interface GmailSenderConnectionCardProps {
  compact?: boolean;
  onStatusChange?: (connected: boolean, email: string | null) => void;
}

export const GmailSenderConnectionCard: React.FC<GmailSenderConnectionCardProps> = ({
  compact = false,
  onStatusChange,
}) => {
  const [senderInfo, setSenderInfo] = useState(() => getConnectedGmailSender());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = initGmailAuth(
      (user) => {
        const next = {
          connected: true,
          email: user.email,
          displayName: user.displayName,
        };
        setSenderInfo(next);
        onStatusChange?.(true, user.email);
      },
      () => {
        const next = getConnectedGmailSender();
        setSenderInfo(next);
        onStatusChange?.(next.connected, next.email);
      }
    );
    return () => unsub();
  }, [onStatusChange]);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const { user } = await connectGmailSender();
      setSenderInfo({
        connected: true,
        email: user.email,
        displayName: user.displayName,
      });
      onStatusChange?.(true, user.email);
    } catch (err: any) {
      setError(err?.message || 'Could not connect Gmail account.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    await disconnectGmailSender();
    setSenderInfo({ connected: false, email: null, displayName: null });
    onStatusChange?.(false, null);
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        senderInfo.connected
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : 'bg-[#101420] border-[#1e2638]'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              senderInfo.connected
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/25'
            }`}
          >
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white">
                Gmail Verification Sender
              </span>
              {senderInfo.connected ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Connected
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Optional
                </span>
              )}
            </div>
            {senderInfo.connected && senderInfo.email ? (
              <p className="text-[11px] font-mono text-emerald-300 truncate mt-0.5">
                Sending codes from: <strong>{senderInfo.email}</strong>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Connect your Gmail (e.g. nexoradex1@gmail.com) to email 6-digit signup verification codes.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {senderInfo.connected ? (
            <>
              <GoogleSignInButton
                onClick={handleConnect}
                disabled={isConnecting}
                label={isConnecting ? 'Switching...' : 'Switch Gmail'}
              />
              <button
                type="button"
                onClick={handleDisconnect}
                className="p-2 rounded-lg bg-[#161c2c] hover:bg-red-500/15 border border-[#232b40] hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Disconnect Gmail sender"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <GoogleSignInButton
              onClick={handleConnect}
              disabled={isConnecting}
              label={isConnecting ? 'Connecting...' : 'Sign in with Google'}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-[11px] text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface GmailVerificationModalProps {
  isOpen: boolean;
  recipientEmail: string;
  recipientName: string;
  expectedCode: string;
  onRegenerateCode: () => string;
  onVerified: () => void;
  onClose: () => void;
}

export const GmailVerificationModal: React.FC<GmailVerificationModalProps> = ({
  isOpen,
  recipientEmail,
  recipientName,
  expectedCode,
  onRegenerateCode,
  onVerified,
  onClose,
}) => {
  const [step, setStep] = useState<'confirm-send' | 'enter-code'>('confirm-send');
  const [senderInfo, setSenderInfo] = useState(() => getConnectedGmailSender());
  const [isSending, setIsSending] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('confirm-send');
      setEnteredCode('');
      setError(null);
      setSentNotice(null);
      setSenderInfo(getConnectedGmailSender());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectInsideModal = async () => {
    setError(null);
    try {
      const { user } = await connectGmailSender();
      setSenderInfo({
        connected: true,
        email: user.email,
        displayName: user.displayName,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google.');
    }
  };

  // Explicit user confirmation before calling Gmail API to send email
  const handleConfirmAndSend = async () => {
    setError(null);
    setSentNotice(null);
    setIsSending(true);
    try {
      const res = await sendVerificationCodeViaGmail({
        toEmail: recipientEmail,
        recipientName,
        code: expectedCode,
      });
      setSentNotice(`Verification code sent from ${res.fromEmail} to ${recipientEmail}.`);
      setStep('enter-code');
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification email via Gmail.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (enteredCode.trim() !== expectedCode.trim()) {
      setError('Invalid verification code. Please check your inbox and try again.');
      return;
    }
    onVerified();
  };

  const handleRequestResend = () => {
    onRegenerateCode();
    setEnteredCode('');
    setError(null);
    setSentNotice(null);
    setStep('confirm-send');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0b0e14] border border-[#1f293d] rounded-2xl p-6 shadow-2xl font-sans text-white">
        <button
          type="button"
          onClick={onClose}
          disabled={isSending}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2234] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'confirm-send' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff] shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Sending Verification Email
                </h3>
                <p className="text-xs text-slate-400">
                  Review details before sending via your Gmail account
                </p>
              </div>
            </div>

            <div className="bg-[#111622] border border-[#1f293d] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">From (Connected Gmail):</span>
                <span className="font-mono font-semibold text-emerald-400 truncate">
                  {senderInfo.email || 'Not connected'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">To (New Account):</span>
                <span className="font-mono font-semibold text-white truncate">
                  {recipientEmail}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Email Subject:</span>
                <span className="font-medium text-slate-200 truncate">
                  Nexora DEX Verification Code
                </span>
              </div>
            </div>

            {!senderInfo.connected && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <p className="text-xs text-amber-300">
                  Connect your Gmail account (e.g. nexoradex1@gmail.com) to send the verification code:
                </p>
                <GoogleSignInButton
                  onClick={handleConnectInsideModal}
                  label="Sign in with Google"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2.5 rounded-xl bg-[#141a27] hover:bg-[#1d2538] border border-[#222a3d] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSend}
                disabled={isSending || !senderInfo.connected}
                className="px-5 py-2.5 rounded-xl bg-[#00d2ff] hover:bg-[#38bdf8] text-black font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Send Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Enter Verification Code
                </h3>
                <p className="text-xs text-slate-400">
                  Sent to <span className="text-white font-mono">{recipientEmail}</span>
                </p>
              </div>
            </div>

            {sentNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{sentNotice}</span>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-mono">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full bg-[#121622] border border-[#222b40] focus:border-[#00d2ff] rounded-xl py-3 px-4 text-center text-xl font-mono font-bold tracking-[0.5em] text-white focus:outline-none"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleRequestResend}
                className="text-xs text-[#00d2ff] hover:underline font-medium cursor-pointer"
              >
                Resend Code
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#141a27] hover:bg-[#1d2538] border border-[#222a3d] text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enteredCode.length < 6}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Create Account</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
