export interface NetworkDepositAddress {
  networkId: string;
  networkName: string;
  address: string;
  memoOrTag?: string;
  explorerUrl?: string;
}

// User-specified deposit addresses mapped by Token Symbol -> Network ID -> Deposit Info
export const TOKEN_NETWORK_DEPOSIT_ADDRESSES: Record<string, NetworkDepositAddress[]> = {
  USDC: [
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'SOL', networkName: 'Solana (SPL)', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
    { networkId: 'BNB', networkName: 'BNB Smart Chain (BEP-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'APT', networkName: 'Aptos Network', address: '0x67b15fcad096dea6c09a4a18cd92d9733175edaa292c65cf85e9bfd08f646b1d' },
    { networkId: 'BASE', networkName: 'Base Mainnet', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'ARB', networkName: 'Arbitrum One', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'AVAX', networkName: 'Avalanche C-Chain', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'HYPE', networkName: 'Hyperliquid L1 Native', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  USDT: [
    { networkId: 'TRON', networkName: 'Tron (TRC-20)', address: 'TLkfZHVDKwxfsfDebFBJA85wjKEy6GEE36' },
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'SOL', networkName: 'Solana (SPL)', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
    { networkId: 'BASE', networkName: 'Base Mainnet', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'ARB', networkName: 'Arbitrum One', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'BNB', networkName: 'BNB Smart Chain (BEP-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  SOL: [
    { networkId: 'SOL', networkName: 'Solana Native', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
  ],
  BTC: [
    { networkId: 'BTC', networkName: 'Bitcoin Native (SegWit)', address: 'bc1q7sadlat9k99x8jpv8m8jl0q7daqflrc7qaesq2' },
  ],
  ETH: [
    { networkId: 'ETH', networkName: 'Ethereum Mainnet', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'ARB', networkName: 'Arbitrum One L2', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'BASE', networkName: 'Base Mainnet L2', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  XRP: [
    { networkId: 'XRP', networkName: 'XRP Ledger (Ripple)', address: 'rMSK2kf4k8cVtvNtpLP2wDDavrRD4R88pY' },
  ],
  HYPE: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1 Native', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'SOL', networkName: 'Solana (Wrapped)', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
  ],
  SUI: [
    { networkId: 'SUI', networkName: 'Sui Network Native', address: '0xc2d72c495c4cacf0747a7feca6ffdf3059a578bc4b6a2cc579b1b9cf6caa45d2' },
  ],
  BNB: [
    { networkId: 'BNB', networkName: 'BNB Smart Chain (BEP-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  DOGE: [
    { networkId: 'DOGE', networkName: 'Dogecoin Native Network', address: 'DHsEFK6RWE6JUvJ7Xn9GraP3UWPWe6t9ax' },
  ],
  AVAX: [
    { networkId: 'AVAX', networkName: 'Avalanche C-Chain', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'HYPE', networkName: 'Hyperliquid Bridge', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'BNB', networkName: 'BNB Smart Chain (BEP-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  LINK: [
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'HYPE', networkName: 'Hyperliquid Bridge', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  ADA: [
    { networkId: 'ADA', networkName: 'Cardano Native (Shelley)', address: 'addr1q9q326vrccxk9rwcy6tsnjkjnnxvwxk9rm7476fwz5rdkqgyq50rxcanpwutwc2lfxk9xelszmxv0p0tzjmguwgtna8s4ny205' },
  ],
  NEAR: [
    { networkId: 'NEAR', networkName: 'NEAR Protocol Native', address: '5bdd73d791d5f7783957760715b9e5413480cd64d33ac6126963840df08cc90c' },
  ],
  AAVE: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'SOL', networkName: 'Solana (SPL)', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
  ],
  TON: [
    { networkId: 'TON', networkName: 'The Open Network (TON)', address: 'UQBIorDGeUqhAb6d4Mr5qwJw40xRxjzdyqWjnQDVY8BAiqPy' },
  ],
  ARB: [
    { networkId: 'ARB', networkName: 'Arbitrum One Native', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  PEPE: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  TRX: [
    { networkId: 'TRON', networkName: 'Tron (TRC-20)', address: 'TLkfZHVDKwxfsfDebFBJA85wjKEy6GEE36' },
  ],
  TRON: [
    { networkId: 'TRON', networkName: 'Tron (TRC-20)', address: 'TLkfZHVDKwxfsfDebFBJA85wjKEy6GEE36' },
  ],
  UNI: [
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  OP: [
    { networkId: 'OP', networkName: 'Optimism (OP Mainnet)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  APT: [
    { networkId: 'APT', networkName: 'Aptos Native', address: '0x67b15fcad096dea6c09a4a18cd92d9733175edaa292c65cf85e9bfd08f646b1d' },
  ],
  INJ: [
    { networkId: 'INJ', networkName: 'Injective Native', address: 'inj16d8jw4e268nq5hx0vk5p4wr2qtxucdvrju7ywg' },
  ],
  TIA: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  RENDER: [
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  SHIB: [
    { networkId: 'SOL', networkName: 'Solana (SPL)', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  WIF: [
    { networkId: 'SOL', networkName: 'Solana (SPL)', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  BONK: [
    { networkId: 'SOL', networkName: 'Solana (SPL)', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
  ],
  FLOKI: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'SOL', networkName: 'Solana (SPL)', address: '7H3SN4MDj6i5H1MPoCGq9Tw222nrgLb4hHKEBewtPeMS' },
  ],
  KAS: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  FET: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  LDO: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  MKR: [
    { networkId: 'ETH', networkName: 'Ethereum (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  TAO: [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  SEI: [
    { networkId: 'SEI', networkName: 'Sei Network Native', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
  BASE: [
    { networkId: 'BASE', networkName: 'Base Mainnet', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ],
};

// Default fallback address resolver for any asset and network combo
export function getDepositAddressForAsset(assetSymbol: string, networkIdOrName?: string): string {
  const sym = (assetSymbol || '').toUpperCase().trim();
  const list = TOKEN_NETWORK_DEPOSIT_ADDRESSES[sym];
  if (list && list.length > 0) {
    if (networkIdOrName) {
      const target = networkIdOrName.toUpperCase();
      const match = list.find(
        (n) =>
          n.networkId.toUpperCase() === target ||
          n.networkName.toUpperCase().includes(target) ||
          target.includes(n.networkId.toUpperCase())
      );
      if (match) return match.address;
    }
    return list[0].address;
  }
  // EVM default for unknown assets
  return '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583';
}

export function getAvailableDepositNetworks(assetSymbol: string): NetworkDepositAddress[] {
  const sym = (assetSymbol || '').toUpperCase().trim();
  const list = TOKEN_NETWORK_DEPOSIT_ADDRESSES[sym];
  if (list && list.length > 0) {
    return list;
  }
  return [
    { networkId: 'HYPE', networkName: 'Hyperliquid L1 Native', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'ARB', networkName: 'Arbitrum One', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
    { networkId: 'ETH', networkName: 'Ethereum Mainnet (ERC-20)', address: '0xD34f27572AD1e60a5CCf65A81ab86A02cdcc3583' },
  ];
}
