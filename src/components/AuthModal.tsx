import React from 'react';
import { AuthCard } from './AuthCard';
import { X } from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'register' | 'login';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'register',
  onClose,
  onSuccess,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090b10] border border-[#212631] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden font-sans flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Top subtle highlight */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent opacity-70" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161a22] transition-colors z-10"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Auth Card Content */}
        <AuthCard
          initialMode={initialMode}
          onClose={onClose}
          onSuccess={onSuccess}
          isModal={true}
        />
      </div>
    </div>
  );
};
