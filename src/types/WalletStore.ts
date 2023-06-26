import { Urbit } from "@urbit/http-api"
import { Transaction, Transactions } from "./Transaction"
import { ImportedWallet, LegacyHotWallet, EncryptedWallet, WalletType, Seed, AnyWallet } from "./Accounts"
import { TokenMetadataStore } from "./TokenMetadata"
import { Assets } from "./Assets"
import { SendCustomTransactionPayload, SendNftPayload, SendTokenPayload } from "./SendTransaction"
import { SetState } from "zustand"
import { PendingSignedMessage } from "./PendingSigned"

export interface InitOptions {
  assets?: boolean
  transactions?: boolean
  prompt?: boolean
  failOnError?: boolean
  onReceiveTransaction?: (txn: Transaction) => void
}

export type InsetView = 'main' | 'confirm-most-recent' | 'accounts' | 'assets' | 'unsigned' | 'transactions' | 'send-custom' | 'send-nft' | 'send-tokens'

export interface WalletStore {
  api?: Urbit;
  loadingText: string | null;
  insetView?: InsetView;
  legacyAccounts: LegacyHotWallet[];
  encryptedAccounts: EncryptedWallet[];
  importedAccounts: ImportedWallet[];
  selectedAccount?: AnyWallet;
  metadata: TokenMetadataStore;
  assets: Assets;
  selectedTown: number;
  transactions: Transaction[];
  unsignedTransactions: Transactions;
  mostRecentTransaction?: Transaction;
  walletTitleBase: string;
  promptInstall: boolean;
  appInstalled: boolean;
  subscriptions: number[];
  currentChainId?: string;
  connectedAddress?: string | null;
  connectedType?: WalletType;
  pendingSigned: PendingSignedMessage[];
  initWallet: (options: InitOptions, api?: Urbit) => Promise<void>;
  clearSubscriptions: () => Promise<void>;
  setLoading: (loadingText: string | null) => void;
  setPromptInstall: (promptInstall: boolean) => void;
  setInsetView: (insetView?: InsetView) => void;
  getAccounts: (api?: Urbit) => Promise<void>;
  setSelectedAccount: (selectedAccount: AnyWallet) => void;
  getTransactions: (api?: Urbit) => Promise<void>;
  createAccount: (password: string, nick: string, setKey: (address: string, key: string) => void, restoreSeed?: string) => Promise<string>;
  trackAddress: (address: string, nick: string) => Promise<void>;
  getSeed: (address: string, password: string) => string;
  getLegacySeed: () => Promise<Seed | void>;
  editNickname: (address: string, nick: string) => Promise<void>;
  importAccount: (params: { type: WalletType, nick: string, hdpath?: string, address?: string }) => Promise<void>;
  deleteAccount: (address: string) => Promise<void>;
  setNode: (town: number, ship: string) => Promise<void>;
  setIndexer: (ship: string) => Promise<void>;
  sendTokens: (payload: SendTokenPayload) => Promise<void>;
  sendNft: (payload: SendNftPayload) => Promise<void>;
  sendCustomTransaction: (payload: SendCustomTransactionPayload) => Promise<void>;
  getPendingHash: () => Promise<{ hash: string; txn: any; } | void>;
  deleteUnsignedTransaction: (address: string, hash: string) => Promise<void>;
  getUnsignedTransactions: (api?: Urbit) => Promise<{ [hash: string]: Transaction } | void>;
  signHotTransaction: (message: string, privateKey: string) => Promise<string>;
  submitSignedHash: (from: string, hash: string, rate: number, bud: number, ethHash?: string, sig?: { v: number; r: string; s: string; }) => Promise<void>;
  setMostRecentTransaction: (mostRecentTransaction?: Transaction) => void;
  zigFaucet: (address: string) => Promise<void>;
  connectBrowserWallet: (type: WalletType, targetAddress?: string) => Promise<string | undefined>;
  connectEncryptedWallet: (address: string, password: string, setKey: (address: string, key: string) => void) => void;
  connectUqbarNetwork: () => Promise<void>;
  depositEth: (amount: string, town: string, destination: string) => Promise<void>;

  getPendingSignMessages: (api?: Urbit) => Promise<any>;
  submitTypedMessage: (hash: string, from: string, sig: { v: number; r: string; s: string; }) => Promise<void>;

  set: SetState<WalletStore>;
}
