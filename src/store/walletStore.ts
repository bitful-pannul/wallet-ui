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
import { GOERLI_DEPOSIT_CONTRACT, WALLET_STORAGE_VERSION } from "../utils/constants"
import { Assets } from "../types/Assets"
import { generateSendTokenPayload } from "../utils/wallet"
import { parseRawTransaction, processTransactions } from "../utils/transactions"
import { ethers } from "ethers"
import { GOERLI_DEPOSIT_CONTRACT_ABI } from "../utils/deposit-contract-abi"

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
  prompt?: boolean
  onReceiveTransaction?: (txn: Transaction) => void
}

export type InsetView = 'main' | 'confirm-most-recent' | 'accounts' | 'assets' | 'unsigned' | 'transactions' | 'send-custom' | 'send-nft' | 'send-tokens'

export interface WalletStore {
  loadingText: string | null;
  insetView?: InsetView;
  accounts: HotWallet[];
  importedAccounts: HardwareWallet[];
  selectedAccount?: HotWallet | HardwareWallet;
  metadata: TokenMetadataStore;
  assets: Assets;
  selectedTown: number;
  transactions: Transaction[];
  unsignedTransactions: Transactions;
  mostRecentTransaction?: Transaction;
  walletTitleBase: string;
  promptInstall: boolean;
  appInstalled: boolean;
  initWallet: (options: InitOptions) => Promise<void>;
  setLoading: (loadingText: string | null) => void;
  setPromptInstall: (promptInstall: boolean) => void;
  setInsetView: (insetView?: InsetView) => void;
  getAccounts: () => Promise<void>;
  setSelectedAccount: (selectedAccount: HotWallet | HardwareWallet) => void;
  getTransactions: () => Promise<void>;
  createAccount: (password: string, nick: string) => Promise<void>;
  deriveNewAddress: (hdpath: string, nick: string, type?: HardwareWalletType) => Promise<void>;
  trackAddress: (address: string, nick: string) => Promise<void>;
  editNickname: (address: string, nick: string) => Promise<void>;
  restoreAccount: (mnemonic: string, password: string, nick: string) => Promise<void>;
  importAccount: (type: HardwareWalletType, nick: string, hdpath?: string) => Promise<void>;
  deleteAccount: (address: string) => Promise<void>;
  getSeed: () => Promise<Seed>;
  setNode: (town: number, ship: string) => Promise<void>;
  setIndexer: (ship: string) => Promise<void>;
  sendTokens: (payload: SendTokenPayload) => Promise<void>;
  sendNft: (payload: SendNftPayload) => Promise<void>;
  sendCustomTransaction: (payload: SendCustomTransactionPayload) => Promise<void>;
  getPendingHash: () => Promise<{ hash: string; txn: any; }>;
  deleteUnsignedTransaction: (address: string, hash: string) => Promise<void>;
  getUnsignedTransactions: () => Promise<{ [hash: string]: Transaction }>;
  submitSignedHash: (from: string, hash: string, rate: number, bud: number, ethHash?: string, sig?: { v: number; r: string; s: string; }) => Promise<void>;
  setMostRecentTransaction: (mostRecentTransaction?: Transaction) => void;
  zigFaucet: (address: string) => Promise<void>;
  connectMetamask: () => Promise<string | undefined>;
  depositEth: (amount: string, town: string, destination: string) => Promise<void>;
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
    promptInstall: false,
    appInstalled: true,
    initWallet: async ({ assets = true, transactions = true, prompt = false, onReceiveTransaction }: InitOptions) => {
      const { getAccounts, getTransactions, getUnsignedTransactions } = get()

      set({ loadingText: 'Loading...' })

      if (prompt) {
        try {
          await api.scry<{[key: string]: RawAccount}>({ app: 'wallet', path: '/accounts' })
        } catch (err) {
          return set({ promptInstall: true, appInstalled: false, loadingText: null })
        }
      }

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
    setPromptInstall: (promptInstall: boolean) => set({ promptInstall }),
    setSelectedAccount: (selectedAccount?: HotWallet | HardwareWallet) => set({ selectedAccount }),
    setLoading: (loadingText: string | null) => set({ loadingText }),
    setInsetView: (insetView?: InsetView) => set({ insetView }),
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
      const rawTransactions = processTransactions(result)
      const transactions = rawTransactions.sort((a, b) => b.nonce - a.nonce)
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
    importAccount: async (type: HardwareWalletType, nick: string, hdpath = "44'/60'/0'/0/0") => {
      set({ loadingText: 'Importing...' })

      let importedAddress: string | undefined = ''

      if (type === 'ledger'){
        importedAddress = await getLedgerAddress(hdpath)
      } else if (type === 'trezor') {
        importedAddress = await getTrezorAddress(hdpath)
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
      const json = ethHash && sig ?
        { 'submit-signed': { from, hash, gas: { rate, bud }, 'eth-hash': ethHash, sig } } :
        { 'submit': { from, hash, gas: { rate, bud } } }
      await api.poke({ app: 'wallet', mark: 'wallet-poke', json })
      get().getUnsignedTransactions()
    },
    setMostRecentTransaction: (mostRecentTransaction?: Transaction) => set({ mostRecentTransaction }),

    zigFaucet: async (address: string) => {
      try {
        await api.poke({ app: 'uqbar', mark: 'uqbar-action', json: { 'open-faucet': { town: '0x0', 'send-to': address } } })
      } catch (err) {
        alert('An error occurred. Note that you can only request zigs from the faucet once per hour.')
      }
    },

    connectMetamask: async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
          return accounts[0]
        } catch {}
      }
    },
    depositEth: async (amount: string, town: string, destination: string) => {
      try {
        // set({ loadingText: 'Generating transaction...' })
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' })

          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x5' }] });

          if (window.ethereum?.selectedAddress) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const depositContract = new ethers.Contract(GOERLI_DEPOSIT_CONTRACT, GOERLI_DEPOSIT_CONTRACT_ABI, signer)

            try {
              const txn = await depositContract.populateTransaction.depositEth(parseInt(town.replace('0x', ''), 16), destination)
              const transactionRequest = {
                ...txn,
                value: ethers.utils.parseEther(amount),
              }

              const receipt = await signer.sendTransaction(transactionRequest)
              alert('Your deposit has started, please check the status in your wallet. Hash: ' + receipt.hash)
            } catch (err) {
              console.warn(err)
              alert('There was an error with the deposit, please check your wallet and try again.')
            }
          } else {
            alert('Please connect one of your accounts and try again.')
          }
        } else {
          alert('Please install MetaMask, Brave Wallet, or any browser-based Ethereum client and confirm you are on the Goerli network to continue.')
        }
      } catch (err) {
        console.warn(err)
        alert('There was an error, please try again.')
      }

      set({ loadingText: null })
    },
  }),
  {
    name: `${(window as any).ship}-walletStore`,
    version: WALLET_STORAGE_VERSION,
    getStorage: () => sessionStorage,
  })
)
