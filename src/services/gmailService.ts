import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach((scope) => provider.addScope(scope));
  // Prompt account picker so user can connect any Gmail sender (e.g. nexoradex1@gmail.com)
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
};

// In-memory token caching ONLY (never stored in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedSenderUser: User | null = null;

export const initGmailAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user && cachedAccessToken) {
      cachedSenderUser = user;
      onAuthSuccess?.(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      cachedSenderUser = null;
      onAuthFailure?.();
    }
  });
};

export const connectGmailSender = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const provider = createGoogleProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Gmail access token from Google sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    cachedSenderUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const disconnectGmailSender = async (): Promise<void> => {
  cachedAccessToken = null;
  cachedSenderUser = null;
  await auth.signOut();
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getConnectedGmailSender = (): {
  connected: boolean;
  email: string | null;
  displayName: string | null;
} => {
  return {
    connected: Boolean(cachedAccessToken && cachedSenderUser),
    email: cachedSenderUser?.email || null,
    displayName: cachedSenderUser?.displayName || null,
  };
};

// UTF-8 safe base64url encoding for RFC 2822 MIME payload
const toBase64Url = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Encode MIME header with RFC 2047 UTF-8 Base64 if non-ASCII
const encodeMimeHeader = (value: string): string => {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export interface SendVerificationEmailParams {
  toEmail: string;
  recipientName: string;
  code: string;
}

export const sendVerificationCodeViaGmail = async ({
  toEmail,
  recipientName,
  code,
}: SendVerificationEmailParams): Promise<{ messageId: string; fromEmail: string }> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Gmail sender is not connected. Please sign in with Google first.');
  }

  const fromEmail = cachedSenderUser?.email || 'me';
  const subject = `Nexora DEX — Your Verification Code: ${code}`;
  const htmlBody = [
    `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0a0c12; color: #e2e8f0; border: 1px solid #1e293b; border-radius: 16px; padding: 28px;">`,
    `  <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">NEXORA <span style="color: #00d2ff;">DEX</span></div>`,
    `  <p style="font-size: 14px; color: #94a3b8; margin: 0 0 18px 0;">Hello ${recipientName || 'Trader'},</p>`,
    `  <p style="font-size: 14px; color: #cbd5e1; margin: 0 0 18px 0;">Use the verification code below to complete creating your Nexora DEX account:</p>`,
    `  <div style="background: #111827; border: 1px solid #00d2ff; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">`,
    `    <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #00d2ff;">${code}</span>`,
    `  </div>`,
    `  <p style="font-size: 12px; color: #64748b; margin: 0;">This code expires in 10 minutes. If you did not request this account creation, you can ignore this email.</p>`,
    `</div>`,
  ].join('\n');

  const rawMime = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${encodeMimeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    (() => {
      const bytes = new TextEncoder().encode(htmlBody);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    })(),
  ].join('\r\n');

  const encodedMessage = toBase64Url(rawMime);

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    }
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const errMsg =
      errBody?.error?.message || `Gmail API request failed (${response.status})`;
    if (response.status === 401) {
      cachedAccessToken = null;
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  return {
    messageId: data.id || 'sent',
    fromEmail,
  };
};
