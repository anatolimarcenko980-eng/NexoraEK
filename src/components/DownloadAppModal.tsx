import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  X,
  Smartphone,
  QrCode,
  Download,
  Share2,
  PlusSquare,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface DownloadAppModalProps {
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ onClose }) => {
  const { t } = useTrading();
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('ios');
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleSimulatedDownload = () => {
    setDownloadStarted(true);
    setTimeout(() => {
      setDownloadStarted(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#090b10] border border-[#212631] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden font-sans flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Subtle cyan glow line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent opacity-80" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161a22] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121624] border border-[#1e293b] text-xs font-mono text-[#00d2ff]">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('nexoraMobileTerminal', 'Nexora Mobile Terminal')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t('tradeOnChainAnywhere', 'Trade On-Chain Anywhere')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {t('downloadModalDesc', 'Install the native-performance PWA or native beta build with biometric authentication and 12ms execution.')}
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0e111a] border border-[#1e293b] rounded-2xl mb-6">
          <button
            onClick={() => setActivePlatform('ios')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activePlatform === 'ios'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{t('appleIos', 'Apple iOS')}</span>
          </button>
          <button
            onClick={() => setActivePlatform('android')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activePlatform === 'android'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{t('android', 'Android')}</span>
          </button>
        </div>

        {/* Platform Instructions */}
        {activePlatform === 'ios' ? (
          <div className="space-y-4">
            <div className="bg-[#0e121a] border border-[#1e293b] rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#00d2ff]" />
                <span>{t('iosOption1Title', 'Option 1: Instant Safari PWA (Recommended)')}</span>
              </span>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal pl-4">
                <li>{t('iosStep1', 'Open Safari on your iPhone or iPad.')}</li>
                <li>{t('iosStep2', 'Tap the Share button at the bottom navigation bar.')}</li>
                <li>{t('iosStep3', 'Scroll down and tap "Add to Home Screen".')}</li>
                <li>{t('iosStep4', 'Launch Nexora from your home screen for full-screen Face ID trading.')}</li>
              </ol>
            </div>

            <div className="bg-[#0e121a] border border-[#1e293b] rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{t('iosOption2Title', 'Option 2: TestFlight Native iOS Beta')}</span>
              </span>
              <p className="text-xs text-slate-400">
                {t('iosOption2Desc', 'Join our private TestFlight developer build for native HFT order routing and lockscreen widgets.')}
              </p>
              <button
                onClick={handleSimulatedDownload}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#171c28] hover:bg-[#202738] border border-[#2b3548] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
              >
                {downloadStarted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t('inviteDispatched', 'Invitation Dispatched to Your Device!')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('requestTestflight', 'Request TestFlight Access')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#0e121a] border border-[#1e293b] rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <PlusSquare className="w-4 h-4 text-[#00d2ff]" />
                <span>{t('androidOption1Title', 'Option 1: Chrome Direct Install')}</span>
              </span>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal pl-4">
                <li>{t('androidStep1', 'Open Chrome on your Android smartphone.')}</li>
                <li>{t('androidStep2', 'Tap the three dots (⋮) in the top-right menu.')}</li>
                <li>{t('androidStep3', 'Select "Install App" or "Add to Home Screen".')}</li>
                <li>{t('androidStep4', 'Enjoy native Android push notifications and fingerprint biometric login.')}</li>
              </ol>
            </div>

            <div className="bg-[#0e121a] border border-[#1e293b] rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{t('androidOption2Title', 'Option 2: Verified APK Download (v2.8.4)')}</span>
              </span>
              <p className="text-xs text-slate-400">
                {t('androidOption2Desc', 'Direct release APK with sha256 checksum verification for independent sideloading.')}
              </p>
              <button
                onClick={handleSimulatedDownload}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-xs font-bold text-black flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {downloadStarted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>{t('downloadingApk', 'Downloading nexora-v2.8.4-arm64.apk...')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-black" />
                    <span>{t('downloadApkBtn', 'Download Nexora Android APK (18.4 MB)')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-6 pt-5 border-t border-[#1e293b]/60 grid grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('selfCustodial100', '100% Self-Custodial')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span>{t('zeroGasEngine', 'Zero Gas Execution')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
