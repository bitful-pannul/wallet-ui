import CryptoJS from "crypto-js"
import { FaWallet } from 'react-icons/fa'
import metamask from '../assets/img/wallets/metamask.png'
import brave from '../assets/img/wallets/brave.png'
import walletconnect from '../assets/img/wallets/walletconnect.png'
import ledger from '../assets/img/wallets/ledger.png'
import trezor from '../assets/img/wallets/trezor.png'
import { Assets } from "../types/Assets"
import { fromUd } from "./number"
import { AnyWallet, EncryptedWallet, ImportedWallet, LegacyHotWallet, WalletKind, WalletType } from '../types/Accounts'
import { addHexDots } from "./format"

export const displayPubKey = (pubKey: string) => pubKey.slice(0, 6) + '...' + pubKey.slice(-4)

export const getToken = (assets: Assets, account: string, contract: string) => Object.values(assets[account] || {}).find((t) => t.contract === contract)

export const getTokenBalance = (assets: Assets, account: string, contract: string) => fromUd(getToken(assets, account, contract)?.data.balance)

export const getWalletIcon = (type: WalletType) => {
  switch (type) {
    case 'metamask':
      return <img src={metamask} style={{ height: 24, width: 24, margin: '-2px 0' }} alt='metamask' />
    case 'brave':
      return <img src={brave} style={{ height: 24, width: 24, margin: '-2px 0' }} alt='brave' />
    case 'walletconnect':
      return <img src={walletconnect} style={{ height: 20, width: 24, margin: '-2px 0' }} alt='walletconnect' />
    case 'ledger':
      return <img src={ledger} style={{ height: 24, width: 24, margin: '-2px 0' }} alt='ledger' />
    case 'trezor':
      return <img src={trezor} style={{ height: 24, width: 24, margin: '-2px 0' }} alt='trezor' />
    default:
      return <FaWallet size={20} style={{ marginRight: 2 }} />
  }
}

export const encrypt = (data: string, password: string) => CryptoJS.AES.encrypt(data, password).toString()
export const decrypt = (data: string, password: string) => CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8)

export const isBrowserWallet = (type: WalletType) => ['metamask', 'brave', 'other-browser'].includes(type)
export const getWalletKind = (address: string, hot: LegacyHotWallet[], encrypted: EncryptedWallet[], imported: ImportedWallet[]) : WalletKind =>
  imported.find(({ rawAddress }) => rawAddress === address) ? 'imported' :
  hot.find(({ rawAddress }) => rawAddress === address) ? 'hot' :
  encrypted.find(({ rawAddress }) => rawAddress === address) ? 'encrypted' : null

export const findAccount = (address: string, accounts: AnyWallet[]) : AnyWallet | undefined => accounts.find(a => a.rawAddress === addHexDots(address))
