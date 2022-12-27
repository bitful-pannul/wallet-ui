import create from "zustand"
import { persist } from "zustand/middleware"
import api from "../api"
import { HotWallet, processAccount, RawAccount, HardwareWallet, HardwareWalletType, Seed } from "../types/Accounts"
import { SendNftPayload, SendCustomTransactionPayload, SendTokenPayload } from "../types/SendTransaction"
import { handleBookUpdate, handleTxnUpdate, handleMetadataUpdate, createSubscription } from "./subscriptions"
import { Transactions, Transaction } from "../types/Transaction"
import { TokenMetadataStore } from "../types/TokenMetadata"
import { deriveLedgerAddress, getLedgerAddress } from "../utils/ledger"
import { deriveTrezorAddress, getTrezorAddress } from "../utils/trezor"
import { addHexDots } from "../utils/format"
import { WALLET_STORAGE_VERSION } from "../utils/constants"
import { Assets } from "../types/Assets"
import { generateSendTokenPayload } from "../utils/wallet"
import { parseRawTransaction, processTransactions } from "../utils/transactions"

const pokeWithAlert = async (json: any) => {
  try {
    await api.poke({ app: 'wallet', mark: 'wallet-poke', json })
  } catch (error) {
    // alert(`Error with transaction: ${String(error)}`)
    alert(`Error with transaction, please check the console.`)
  }
}

interface InitOptions {
  assets?: boolean
  transactions?: boolean
  onReceiveTransaction?: (txn: Transaction) => void
}

export interface WalletStore {
  loadingText: string | null,
  insetView?: string,
  accounts: HotWallet[],
  importedAccounts: HardwareWallet[],
  selectedAccount?: HotWallet | HardwareWallet,
  metadata: TokenMetadataStore,
  assets: Assets,
  selectedTown: number,
  transactions: Transaction[],
  unsignedTransactions: Transactions,
  mostRecentTransaction?: Transaction,
  walletTitleBase: string,
  initWallet: (options: InitOptions) => Promise<void>,
  setLoading: (loadingText: string | null) => void,
  setInsetView: (insetView?: string) => void,
  getAccounts: () => Promise<void>,
  setSelectedAccount: (selectedAccount: HotWallet | HardwareWallet) => void,
  getTransactions: () => Promise<void>,
  createAccount: (password: string, nick: string) => Promise<void>,
  deriveNewAddress: (hdpath: string, nick: string, type?: HardwareWalletType) => Promise<void>,
  trackAddress: (address: string, nick: string) => Promise<void>,
  editNickname: (address: string, nick: string) => Promise<void>,
  restoreAccount: (mnemonic: string, password: string, nick: string) => Promise<void>,
  importAccount: (type: HardwareWalletType, nick: string) => Promise<void>,
  deleteAccount: (address: string) => Promise<void>,
  getSeed: () => Promise<Seed>,
  setNode: (town: number, ship: string) => Promise<void>,
  setIndexer: (ship: string) => Promise<void>,
  sendTokens: (payload: SendTokenPayload) => Promise<void>,
  sendNft: (payload: SendNftPayload) => Promise<void>,
  sendCustomTransaction: (payload: SendCustomTransactionPayload) => Promise<void>,
  getPendingHash: () => Promise<{ hash: string; txn: any; }>
  deleteUnsignedTransaction: (address: string, hash: string) => Promise<void>
  getUnsignedTransactions: () => Promise<{ [hash: string]: Transaction }>
  submitSignedHash: (from: string, hash: string, rate: number, bud: number, ethHash?: string, sig?: { v: number; r: string; s: string; }) => Promise<void>
  setMostRecentTransaction: (mostRecentTransaction?: Transaction) => void
}

export const useWalletStore = create<WalletStore>(
  persist<WalletStore>((set, get) => ({
    loadingText: 'Loading...',
    accounts: [],
    importedAccounts: [],
    metadata: {},
    assets: {},
    selectedTown: 0,
    transactions: [],
    unsignedTransactions: {},
    walletTitleBase: 'Wallet:',
    initWallet: async ({ assets = true, transactions = true, onReceiveTransaction }: InitOptions) => {
      const { getAccounts, getTransactions, getUnsignedTransactions } = get()
      
      set({ loadingText: 'Loading...' })

      try {
        if (assets) {
          api.subscribe(createSubscription('wallet', '/book-updates', handleBookUpdate(get, set))) // get asset list
          api.subscribe(createSubscription('wallet', '/metadata-updates', handleMetadataUpdate(get, set)))
        }
        if (transactions) {
          getTransactions()
          getUnsignedTransactions()
          api.subscribe(createSubscription('wallet', '/tx-updates', handleTxnUpdate(get, set, onReceiveTransaction)))
        }
        await getAccounts()
      } catch (error) {
        console.warn('INIT ERROR:', error)
      }

      set({ loadingText: null })
    },
    setSelectedAccount: (selectedAccount?: HotWallet | HardwareWallet) => set({ selectedAccount }),
    setLoading: (loadingText: string | null) => set({ loadingText }),
    setInsetView: (insetView?: string) => set({ insetView }),
    getAccounts: async () => {
      const accountData = await api.scry<{[key: string]: RawAccount}>({ app: 'wallet', path: '/accounts' }) || {}
      const allAccounts = Object.values(accountData).map(processAccount).sort((a, b) => a.nick.localeCompare(b.nick))

      const { accounts, importedAccounts } = allAccounts.reduce(({ accounts, importedAccounts }, cur) => {
        if (cur.imported) {
          const [nick, type] = cur.nick.split('//')
          importedAccounts.push({ ...cur, type: type as HardwareWalletType, nick })
        } else {
          accounts.push(cur)
        }
        return { accounts, importedAccounts }
      }, { accounts: [] as HotWallet[], importedAccounts: [] as HardwareWallet[] })

      set({ accounts, importedAccounts, loadingText: null })

      if (!get().selectedAccount) set({ selectedAccount: (accounts as any[]).concat(importedAccounts)[0] })
    },
    getTransactions: async () => {
      const result = await api.scry<any>({ app: 'wallet', path: `/transactions` })
      console.log('TXNS:', result)

      const rawTransactions = processTransactions(result)
      const transactions = rawTransactions.sort((a, b) => a.nonce - b.nonce)
      console.log({ transactions })
      set({ transactions })
    },
    createAccount: async (password: string, nick: string) => {
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'generate-hot-wallet': { password, nick } } })
      get().getAccounts()
    },
    deriveNewAddress: async (hdpath: string, nick: string, type?: HardwareWalletType) => {
      set({ loadingText: 'Deriving address, this could take up to 60 seconds...' })
      try {
        if (type) {
          let deriveAddress: ((path: string) => Promise<string>) | undefined
          if (type === 'ledger') {
            deriveAddress = deriveLedgerAddress
          }
          else if (type === 'trezor') {
            deriveAddress = deriveTrezorAddress
          }

          if (deriveAddress !== undefined) {
            const importedAddress = await deriveAddress(hdpath)
            if (importedAddress) {
              const { importedAccounts } = get()
              if (!importedAccounts.find(({ address }) => importedAddress === address)) {
                await api.poke({
                  app: 'wallet',
                  mark: 'wallet-poke',
                  json: {
                    'add-tracked-address': { address: addHexDots(importedAddress), nick: `${nick}//${type}` }
                  }
                })
              } else {
                alert('You have already imported this address.')
              }
            }
          }
        } else {
          await api.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'derive-new-address': { hdpath, nick } } })
        }
        get().getAccounts()
      } catch (error) {
        console.warn('ERROR DERIVING ADDRESS:', error)
        window.alert('There was an error deriving the address, please check the HD path and try again.')
      }
      set({ loadingText: null })
    },
    trackAddress: async (address: string, nick: string) => {
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'add-tracked-address': { address, nick } } })
      get().getAccounts()
    },
    editNickname: async (address: string, nick: string) => {
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'edit-nickname': { address, nick } } })
      get().getAccounts()
    },
    restoreAccount: async (mnemonic: string, password: string, nick: string) => {
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'import-seed': { mnemonic, password, nick } } })
      get().getAccounts()
    },
    importAccount: async (type: HardwareWalletType, nick: string) => {
      set({ loadingText: 'Importing...' })

      let importedAddress: string | undefined = ''

      if (type === 'ledger'){

        importedAddress = await getLedgerAddress()
      } else if (type === 'trezor') {
        importedAddress = await getTrezorAddress()
      }

      if (importedAddress) {
        // TODO: get nonce info
        const { importedAccounts } = get()

        if (!importedAccounts.find(({ address }) => importedAddress === address)) {
          await api.poke({
            app: 'wallet',
            mark: 'wallet-poke',
            json: {
              'add-tracked-address': { address: addHexDots(importedAddress), nick: `${nick}//${type}` }
            }
          })
          get().getAccounts()
        } else {
          set({ loadingText: null })
          alert('You have already imported this address.')
        }
      }
      set({ loadingText: null })
    },
    deleteAccount: async (address: string) => {
      if (window.confirm(`Are you sure you want to remove this address?\n\n${addHexDots(address)}`)) {
        await api.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'delete-address': { address } } })
        get().getAccounts()
      }
    },
    getSeed: async () => {
      const seedData = await api.scry<Seed>({ app: 'wallet', path: '/seed' })
      return seedData
    },
    setNode: async (town: number, ship: string) => {
      const json = { 'set-node': { town, ship } }
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json  })
      set({ selectedTown: town })
    },
    setIndexer: async (ship: string) => {
      const json = { 'set-indexer': { ship } }
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json })
    },
    sendTokens: async (payload: SendTokenPayload) => {
      const json = generateSendTokenPayload(payload)
      await pokeWithAlert(json)
    },
    sendNft: async (payload: SendNftPayload) => {
      const json = generateSendTokenPayload(payload)
      await pokeWithAlert(json)
    },
    sendCustomTransaction: async ({ from, contract, town, action }: SendCustomTransactionPayload) => {
      const json = { 'transaction': { from, contract, town, action: { text: action } } }
      await pokeWithAlert(json)
    },
    getPendingHash: async () => {
      const { hash, txn } = await api.scry<{ hash: string; txn: any }>({ app: 'wallet', path: '/pending' }) || {}
      return { hash, txn }
    },
    deleteUnsignedTransaction: async (address: string, hash: string) => {
      const json = { 'delete-pending': { from: address, hash } }
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json })
      get().getUnsignedTransactions()
    },
    getUnsignedTransactions: async () => {
      const { accounts, importedAccounts } = get()
      const unsigned: any = await Promise.all(
        accounts
          .map(({ rawAddress }) => rawAddress)
          .concat(importedAccounts.map(({ rawAddress }) => rawAddress))
          .map(address => api.scry<Transactions>({ app: 'wallet', path: `/pending/${address}` }))
      )
      const unsignedMap = unsigned.reduce((acc: Transactions, cur: Transactions) => ({ ...acc, ...cur }), {})
      const unsignedTransactions = Object.keys(unsignedMap).reduce((acc, hash) => {
        acc[hash] = parseRawTransaction(unsignedMap[hash])
        return acc
      }, {} as Transactions)
      
      set({ unsignedTransactions })
      return unsignedTransactions
    },
    submitSignedHash: async (from: string, hash: string, rate: number, bud: number, ethHash?: string, sig?: { v: number; r: string; s: string; }) => {
      console.log('ETH HASH & SIG:', ethHash, sig)
      const json = ethHash && sig ?
        { 'submit-signed': { from, hash, gas: { rate, bud }, 'eth-hash': ethHash, sig } } :
        { 'submit': { from, hash, gas: { rate, bud } } }
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json })
      get().getUnsignedTransactions()
    },
    setMostRecentTransaction: (mostRecentTransaction?: Transaction) => set({ mostRecentTransaction })
  }),
  {
    name: `${(window as any).ship}-walletStore`,
    version: WALLET_STORAGE_VERSION,
    getStorage: () => sessionStorage,
  })
)
