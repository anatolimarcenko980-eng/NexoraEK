export interface TokenAsset {
  symbol: string;
  name: string;
  balance: number;
  usdPrice: number;
  usdValue: number;
  change24h: number;
  iconColor: string;
  network: string;
  decimals: number;
}

export type TransactionType = 'deposit' | 'withdraw' | 'swap' | 'trade_pnl';

export interface PortfolioTransaction {
  id: string;
  type: TransactionType;
  title: string;
  description: string;
  asset: string;
  amount: number;
  usdValue: number;
  status: 'completed' | 'pending' | 'failed';
  txHash: string;
  timestamp: number;
  details?: {
    fromAsset?: string;
    toAsset?: string;
    fromAmount?: number;
    toAmount?: number;
    destinationAddress?: string;
    network?: string;
    failureReason?: string;
  };
}
