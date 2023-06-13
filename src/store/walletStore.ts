import create, { SetState } from "zustand"
import { persist } from "zustand/middleware"
import { ethers } from "ethers"
import { Urbit } from "@urbit/http-api"

import { LegacyHotWallet, processAccount, RawLegacyAccount, RawEncryptedAccount, ImportedWallet, WalletType, Seed, processEncrypted, EncryptedWallet } from "../types/Accounts"
import { SendNftPayload, SendCustomTransactionPayload, SendTokenPayload } from "../types/SendTransaction"
import { handleBookUpdate, handleTxnUpdate, handleMetadataUpdate, createSubscription, SubParams } from "./subscriptions"
import { Transactions, Transaction } from "../types/Transaction"
import { addHexDots, addHexPrefix, removeDots } from "../utils/format"
import { GOERLI_DEPOSIT_CONTRACT, UQBAR_EXPLORER_URL, UQBAR_NETWORK_HEX, UQBAR_NETWORK_URL, WALLET_STORAGE_VERSION } from "../utils/constants"
import { generateSendTokenPayload } from "../utils/wallet"
import { parseRawTransaction, processTransactions } from "../utils/transactions"
import { GOERLI_DEPOSIT_CONTRACT_ABI } from "../utils/deposit-contract-abi"
import { encrypt, decrypt } from '../utils/account'
import { InitOptions, InsetView, WalletStore } from "../types/WalletStore"

const resetSubscriptions = async (set: SetState<any>, api: Urbit, oldSubs: number[], newSubs: SubParams[]) => {
  await Promise.all(oldSubs.map(os => api.unsubscribe(os)))
  const subscriptions = await Promise.all(newSubs.map(ns => api.subscribe(ns)))
  set({ api, subscriptions })
}

const pokeWithAlert = async (api: Urbit, json: any) => {
  try {
    await api.poke({ app: 'wallet', mark: 'wallet-poke', json })
  } catch (error) {
    window?.alert && window.alert(`Error with transaction, please check the console.`)
  }
}

export const useWalletStore = create<WalletStore>(
  persist<WalletStore>((set, get) => ({
    loadingText: 'Loading...',
    legacyAccounts: [],
    encryptedAccounts: [],
    importedAccounts: [],
    metadata: {},
    assets: {},
    selectedTown: 0,
    transactions: [],
    unsignedTransactions: {},
    walletTitleBase: 'Wallet:',
    promptInstall: false,
    appInstalled: true,
    subscriptions: [],
    initWallet: async ({ assets = true, transactions = true, prompt = false, failOnError = false, onReceiveTransaction }: InitOptions, api?: Urbit) => {
      const { getAccounts, getTransactions, getUnsignedTransactions } = get()
      set({ loadingText: 'Loading...', connectedAddress: undefined, connectedType: undefined, wcTopic: undefined })

      const apiToUse = api || (window as any)?.api

      if (!apiToUse) throw new Error('No api provided or available on window object')

      if (prompt) {
        try {
          await apiToUse.scry({ app: 'wallet', path: '/accounts' })
        } catch (err) {
          // TODO: change the install logic from promptInstall
          return set({ promptInstall: true, appInstalled: false, loadingText: null })
        }
      }

      const newSubs: SubParams[] = []

      try {
        if (assets) {
          newSubs.push(createSubscription('wallet', '/book-updates', handleBookUpdate(get, set))) // get asset list
          newSubs.push(createSubscription('wallet', '/metadata-updates', handleMetadataUpdate(get, set)))
        }
        if (transactions) {
          getTransactions(apiToUse)
          getUnsignedTransactions(apiToUse)
          newSubs.push(createSubscription('wallet', '/tx-updates', handleTxnUpdate(get, set, onReceiveTransaction)))
        }
        await getAccounts(apiToUse)
      } catch (error) {
        console.warn('INIT ERROR:', error)
        if (failOnError) {
          throw new Error('init error')
        }
      }

      resetSubscriptions(set, apiToUse, get().subscriptions, newSubs)

      if (window.ethereum) {
        try {
          const networkId = await window.ethereum.request({ method: 'net_version' })
          const currentChainId = networkId && `0x${Number(networkId).toString(16)}`
          set({ currentChainId, connectedAddress: window.ethereum.selectedAddress })
        } catch {}
      }

      set({ loadingText: null })
    },
    clearSubscriptions: async () => {
      const { api, subscriptions } = get()
      if (api && subscriptions.length) {
        resetSubscriptions(set, api, subscriptions, [])
      }
    },
    setPromptInstall: (promptInstall: boolean) => set({ promptInstall }),
    setSelectedAccount: (selectedAccount?: LegacyHotWallet | EncryptedWallet | ImportedWallet) => set({ selectedAccount }),
    setLoading: (loadingText: string | null) => set({ loadingText }),
    setInsetView: (insetView?: InsetView) => set({ insetView }),
    getAccounts: async (api?: Urbit) => {
      const apiToUse = api || get().api
      if (apiToUse) {
        const accountData = await apiToUse.scry<{[key: string]: RawLegacyAccount}>({ app: 'wallet', path: '/accounts' }) || {}
        const legacyAndImported = Object.values(accountData).map(processAccount).sort((a, b) => a.nick.localeCompare(b.nick))
        const encryptedAccountsData = await apiToUse.scry<{[key: string]: RawEncryptedAccount}>({ app: 'wallet', path: '/encrypted-accounts' }) || {}
        const encryptedAccounts = Object.keys(encryptedAccountsData).map(pubkey => processEncrypted({ ...encryptedAccountsData[pubkey], pubkey }))
  
        const { legacyAccounts, importedAccounts } = legacyAndImported.reduce(({ legacyAccounts, importedAccounts }, cur) => {
          if (cur.imported) {
            const [nick, type] = cur.nick.split('//')
            importedAccounts.push({ ...cur, type: type as WalletType, nick })
          } else {
            legacyAccounts.push(cur)
          }
          return { legacyAccounts, importedAccounts }
        }, { legacyAccounts: [] as LegacyHotWallet[], importedAccounts: [] as ImportedWallet[] })
  
        set({ legacyAccounts, encryptedAccounts, importedAccounts, loadingText: null })
  
        if (!get().selectedAccount) set({ selectedAccount: (legacyAccounts as any[]).concat(importedAccounts)[0] })
      }
    },
    getTransactions: async (api?: Urbit) => {
      const result = await (api || get().api)?.scry<any>({ app: 'wallet', path: `/transactions` })
      const rawTransactions = processTransactions(result)
      const transactions = rawTransactions.sort((a, b) => b.nonce - a.nonce)
      set({ transactions })
    },
    createAccount: async (password: string, nick: string, addKey: (address: string, key: string) => void, restoreSeed?: string) => {
      const seed = restoreSeed || ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16))
      const wallet = ethers.Wallet.fromMnemonic(seed)
      const privateKey = wallet.privateKey
      const address = wallet.address
      const hoonHexAddress = addHexDots(address)
      addKey(hoonHexAddress, privateKey)

      const encryptedPrivateKey = encrypt(privateKey, password)
      const encryptedSeed = encrypt(seed, password)

      const json = { 'store-hot-wallet': { nick, address: hoonHexAddress, priv: encryptedPrivateKey, seed: encryptedSeed } }
      await get().api?.poke({ app: 'wallet', mark: 'wallet-poke', json })

      get().getAccounts()
      set({ connectedAddress: address, connectedType: 'hot' })
      return seed
    },
    trackAddress: async (address: string, nick: string) => {
      await get().api?.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'add-tracked-address': { address, nick } } })
      get().getAccounts()
    },
    getSeed: (encryptedSeed: string, password: string) => decrypt(encryptedSeed, password),
    getLegacySeed: async () => {
      const { api } = get()
      if (!api) return
      const seedData = await api.scry<Seed>({ app: 'wallet', path: '/seed' })
      return seedData
    },
    editNickname: async (address: string, nick: string) => {
      await get().api?.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'edit-nickname': { address, nick } } })
      get().getAccounts()
    },
    importAccount: async ({ type, nick, hdpath = "44'/60'/0'/0/0", address } : { type: WalletType, nick: string, hdpath?: string, address?: string }) => {
      const { api } = get()
      if (!api) return

      set({ loadingText: 'Importing...' })

      let importedAddress: string | undefined = ''

      if (address) {
        importedAddress = address
      } else {
        const ethereum = (window as any).ethereum // default is to use Metamask
        await ethereum.request({ method: 'eth_requestAccounts' });
        importedAddress = ethereum.selectedAddress
        set({ connectedAddress: importedAddress })
      }

      if (importedAddress) {
        // TODO: get nonce info
        const { importedAccounts } = get()

        if (!importedAccounts.find(({ address }) => importedAddress === address)) {
          await get().api?.poke({
            app: 'wallet',
            mark: 'wallet-poke',
            json: {
              'add-tracked-address': { address: addHexDots(importedAddress), nick: `${nick}//${type}` }
            }
          })
          get().getAccounts()

          await Promise.all((get().subscriptions || []).map(sub => api.unsubscribe(sub)))
          const subscriptions = await Promise.all([
            api.subscribe(createSubscription('wallet', '/book-updates', handleBookUpdate(get, set))), // get asset list
            api.subscribe(createSubscription('wallet', '/metadata-updates', handleMetadataUpdate(get, set))),
          ])

          set({ subscriptions })
        } else {
          set({ loadingText: null })
        }
      }
      set({ loadingText: null })
    },
    deleteAccount: async (address: string) => {
      if (window.confirm(`Are you sure you want to remove this address?\n\n${addHexDots(address)}`)) {
        await get().api?.poke({ app: 'wallet', mark: 'wallet-poke', json: { 'delete-address': { address } } })
        // TODO: remove assests
        get().getAccounts()
        const newAssets = { ...get().assets }
        delete newAssets[address]
        set({ assets: newAssets })
      }
    },
    setNode: async (town: number, ship: string) => {
      const json = { 'set-node': { town, ship } }
      await get().api?.poke({ app: 'wallet', mark: 'wallet-poke', json  })
      set({ selectedTown: town })
    },
    setIndexer: async (ship: string) => {
      const json = { 'set-indexer': { ship } }
      await get().api?.poke({ app: 'wallet', mark: 'wallet-poke', json })
    },
    sendTokens: async (payload: SendTokenPayload) => {
      const { api } = get()
      if (!api) return
      const json = generateSendTokenPayload(payload)
      await pokeWithAlert(api, json)
    },
    sendNft: async (payload: SendNftPayload) => {
      const { api } = get()
      if (!api) return
      const json = generateSendTokenPayload(payload)
      await pokeWithAlert(api, json)
    },
    sendCustomTransaction: async ({ from, contract, town, action, unsigned }: SendCustomTransactionPayload) => {
      const { api } = get()
      if (!api) return
      const json = unsigned ?
        {  "unsigned-transaction": { contract, town, action: { text: action } } } :
        { 'transaction': { from, contract, town, action: { text: action } } }
      await pokeWithAlert(api, json)
    },
    getPendingHash: async () => {
      const { api } = get()
      if (!api) return
      const { hash, txn } = await api.scry<{ hash: string; txn: any }>({ app: 'wallet', path: '/pending' }) || {}
      return { hash, txn }
    },
    deleteUnsignedTransaction: async (address: string, hash: string) => {
      const json = { 'delete-pending': { from: address, hash } }
      await get().api?.poke({ app: 'wallet', mark: 'wallet-poke', json })
      get().getUnsignedTransactions()
    },
    getUnsignedTransactions: async (api?: Urbit) => {
      const apiToUse = api || get().api
      if (!apiToUse) return
      const { legacyAccounts, encryptedAccounts, importedAccounts } = get()
      const unsigned: any = await Promise.all(
        legacyAccounts
          .map(({ rawAddress }) => rawAddress)
          .concat(importedAccounts.map(({ rawAddress }) => rawAddress))
          .concat(encryptedAccounts.map(({ rawAddress }) => rawAddress))
          .map(address => apiToUse.scry<Transactions>({ app: 'wallet', path: `/pending/${address}` }))
      )
      const unsignedMap = unsigned.reduce((acc: Transactions, cur: Transactions) => ({ ...acc, ...cur }), {})
      const unsignedTransactions = Object.keys(unsignedMap).reduce((acc, hash) => {
        acc[hash] = parseRawTransaction(unsignedMap[hash])
        return acc
      }, {} as Transactions)
      
      set({ unsignedTransactions })
      return unsignedTransactions
    },
    signHotTransaction: async (message: string, privateKey: string) => {
      const wallet = new ethers.Wallet(privateKey)
      return wallet.signMessage(message)
    },
    submitSignedHash: async (from: string, hash: string, rate: number, bud: number, ethHash?: string, sig?: { v: number; r: string; s: string; }) => {
      const json = ethHash && sig ?
        { 'submit-signed': { from, hash, gas: { rate, bud }, 'eth-hash': ethHash, sig: { r: addHexDots(sig.r), s: addHexDots(sig.s), v: sig.v } } } :
        { 'submit': { from, hash, gas: { rate, bud } } }
      await get().api?.poke({ app: 'wallet', mark: 'wallet-poke', json })
      get().getUnsignedTransactions()
    },
    setMostRecentTransaction: (mostRecentTransaction?: Transaction) => set({ mostRecentTransaction }),

    zigFaucet: async (address: string) => {
      try {
        await get().api?.poke({ app: 'uqbar', mark: 'uqbar-action', json: { 'open-faucet': { town: '0x0', 'send-to': address } } })
      } catch (err) {
        alert('An error occurred. Note that you can only request zigs from the faucet once per hour.')
      }
    },

    connectBrowserWallet: async (connectedType: WalletType, targetAddress?: string) => {
      if (window.ethereum) {
        let address
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

        if (targetAddress && !accounts.includes(removeDots(targetAddress))) {
          alert('Please allow access to address ' + targetAddress + ' in your wallet and try again.')
          throw new Error('Address not found in wallet')
        } 

        try {
          address = targetAddress ? removeDots(targetAddress) : accounts[0]
          set({ connectedAddress: address, connectedType })

          const networkId = String(await window.ethereum.request({ method: 'net_version' }).catch(() => '0x1'))

          if (networkId === '1' || addHexPrefix(networkId) === '0x1') {
            set({ currentChainId: '0x1' }) // Ethereum Mainnet
          } else if (networkId === '5' || addHexPrefix(networkId) === '0x5') {
            set({ currentChainId: '0x5' }) // Goerli
          } else if (networkId === '491260113269' || addHexPrefix(networkId) === '0x7261627175') {
            set({ currentChainId: '0x7261627175' }) // Uqbar
          } else {
            get().connectUqbarNetwork()
          }
        } catch (err) {
          console.error('ERROR CONNECTING WALLET:', err)
          if (address) {
            set({ currentChainId: '0x7261627175' })
          }
        }
        return address
      }
    },
    connectEncryptedWallet: (address: string, password: string, setKey: (address: string, key: string) => void) => {
      const account = get().encryptedAccounts.find(({ rawAddress }) => rawAddress === address)
      if (account) {
        const privateKey = decrypt(account.encryptedPk, password)
        if (privateKey)  {
          setKey(address, privateKey)
        } else {
          throw new Error('Incorrect password')
        }
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
    connectUqbarNetwork: async () => {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: UQBAR_NETWORK_HEX,
            chainName: 'Uqbar',
            nativeCurrency: { name: 'ZIG', symbol: 'ZIG', decimals: 18 },
            rpcUrls: [UQBAR_NETWORK_URL],
            blockExplorerUrls: [UQBAR_EXPLORER_URL],
          }]
        })
      }
    },
    set,
  }),
  {
    name: `${(window as any).ship}-walletStore`,
    version: WALLET_STORAGE_VERSION,
    getStorage: () => sessionStorage,
  })
)
