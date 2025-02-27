export interface Wallet {
    address: string;
    credentialId: string;
    type: string;
}

export enum WalletType {
    Ethereum = "evm-smart-wallet",
    Solana = "solana-smart-wallet",
}

export interface WalletSelectorProps {
    value: WalletType;
    onChange: (value: WalletType) => void;
}
