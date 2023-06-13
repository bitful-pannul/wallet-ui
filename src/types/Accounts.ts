import { removeDots } from "../utils/format"

export type WalletType = 'hot' | 'ledger' | 'trezor' | 'metamask' | 'brave' | 'other-browser' | 'walletconnect'

export interface RawLegacyAccount {
  nick: string
  pubkey: string
  privkey: string
  nonces: { [key:string]: number }
}

export interface RawEncryptedAccount {
  nick: string
  seed: string
  priv: string
  nonces: { [key:string]: number }
}

export interface RawEncryptedAccountPub extends RawEncryptedAccount {
  pubkey: string
}

export interface Wallet {
  nick: string
  address: string
  rawAddress: string
  imported: boolean
  nonces: { [key:string]: number }
}

export const processAccount = (raw: RawLegacyAccount): LegacyHotWallet => ({
  nick: raw.nick,
  address: removeDots(raw.pubkey),
  rawAddress: raw.pubkey,
  privateKey: removeDots(raw.privkey),
  rawPrivateKey: raw.privkey,
  nonces: raw.nonces || {},
  imported: !raw.privkey
})

export const processEncrypted = (raw: RawEncryptedAccountPub): EncryptedWallet => ({
  nick: raw.nick,
  address: removeDots(raw.pubkey),
  rawAddress: raw.pubkey,
  nonces: raw.nonces || {},
  imported: false,
  encryptedPk: raw.priv,
  encryptedSeed: raw.seed
})

export interface LegacyHotWallet extends Wallet {
  privateKey: string
  rawPrivateKey: string
}

export interface EncryptedWallet extends Wallet {
  encryptedPk: string
  encryptedSeed: string
}

export interface ImportedWallet extends Wallet {
  type: WalletType
}

export type WalletKind = 'hot' | 'encrypted' | 'imported' | null

export interface Seed {
  mnemonic: string
  password?: string
}

export type AnyWallet = LegacyHotWallet | EncryptedWallet | ImportedWallet
