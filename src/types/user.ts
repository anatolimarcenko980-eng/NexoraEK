export const SUPERADMIN_EMAIL = 'anatolimarcenko980@gmail.com';
export const SUPERADMIN_EMAILS = ['anatolimarcenko980@gmail.com'];

export interface RegisteredUser {
  id: string; // e.g. "NX-78419"
  username: string;
  fullName?: string;
  email: string;
  password?: string;
  registeredAt: string;
  vipTier: 'VIP 0' | 'VIP 1' | 'VIP 2' | 'VIP 3';
  makerFeeDiscount: number; // % off maker fees
  takerFeeRate: number; // e.g. 0.02%
  authMethod: 'email' | 'wallet' | 'google' | 'apple' | 'passkey' | 'facebook';
  walletAddress: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  referralCodeUsed?: string;
  myReferralCode: string;
  avatarSeed?: string;
  balance?: number; // live USDC balance
  demoBalance?: number; // virtual demo USDC balance
  tokenBalances?: Record<string, number>;
  isMasterTrader?: boolean;
  role?: 'admin' | 'user';
}

export interface RegistrationFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
  agreeToTerms: boolean;
}

