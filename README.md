# Uqbar Wallet UI Library

Contains the API, components, and store for the uqbar wallet.

This package is meant to be used in a React app.

## useWalletStore

The `useWalletStore` hook will import the store and the `init` function will initiate subscriptions and load accounts, assets, transactions, and token metadata.

You can choose to not load all info by passing options `{ assets: false, transactions: false }` to `init`. The `assets` option includes the metadata subscription.

### Generating and Signing Transactions

New transactions are valided on the ship and saved in `unsignedTransactions`. The gas price, gas budget, and signature is then added in the signing step. There are thus two steps required to send a transaction.

### useWalletStore

#### Properties

- `loadingText: string | null,`
- `accounts: HotWallet[],`
- `importedAccounts: HardwareWallet[],`
- `metadata: TokenMetadataStore,`
- `assets: Assets,`
- `selectedTown: number,`
- `transactions: Transaction[],`
- `unsignedTransactions: Transactions,`
- `mostRecentTransaction?: Transaction,`

#### Methods

- `initWallet: (options: InitOptions) => Promise<void>,`
- `setLoading: (loadingText: string | null) => void,`
- `getAccounts: () => Promise<void>,`
- `getTransactions: () => Promise<void>,`
- `createAccount: (password: string, nick: string) => Promise<void>,`
- `deriveNewAddress: (hdpath: string, nick: string, type?: HardwareWalletType) => Promise<void>,`
- `trackAddress: (address: string, nick: string) => Promise<void>,`
- `editNickname: (address: string, nick: string) => Promise<void>,`
- `restoreAccount: (mnemonic: string, password: string, nick: string) => Promise<void>,`
- `importAccount: (type: HardwareWalletType, nick: string) => Promise<void>,`
- `deleteAccount: (address: string) => Promise<void>,`
- `getSeed: () => Promise<Seed>,`
- `setNode: (town: number, ship: string) => Promise<void>,`
- `setIndexer: (ship: string) => Promise<void>,`
- `sendTokens: (payload: SendTokenPayload) => Promise<void>,`
- `sendNft: (payload: SendNftPayload) => Promise<void>,`
- `sendCustomTransaction: (payload: SendCustomTransactionPayload) => Promise<void>,`
- `getPendingHash: () => Promise<{ hash: string; txn: any; }>`
- `deleteUnsignedTransaction: (address: string, hash: string) => Promise<void>`
- `getUnsignedTransactions: () => Promise<{ [hash: string]: Transaction }>`
- `submitSignedHash: (from: string, hash: string, rate: number, bud: number, ethHash?: string, sig?: { v: number; r: string; s: string; }) => Promise<void>`
- `setMostRecentTransaction: (mostRecentTransaction?: Transaction) => void`

## Development

Clone this repo, update the dependency in the downstream repo to a relative dependency, run `yarn run dev` from this repo.
