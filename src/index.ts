import { useWalletStore } from './store/walletStore'
import { WalletStore } from './types/WalletStore'
import { KeyStore, useKeyStore } from './store/keyStore'

import {
  WalletType,
  RawLegacyAccount,
  Wallet,
  processAccount,
  LegacyHotWallet,
  ImportedWallet,
  EncryptedWallet,
  AnyWallet,
  Seed,
} from './types/Accounts'
import { Assets } from './types/Assets'
import {
  SendTransactionPayload,
  SendCustomTransactionPayload,
  SendAssetPayload,
  SendTokenPayload,
  SendNftPayload,
  Txn
} from './types/SendTransaction'
import {
  TokenData,
  Token
} from './types/Token'
import {
  TokenMetadata,
  TokenMetadataStore
} from './types/TokenMetadata'
import {
  TransactionArgs,
  Transaction,
  Transactions,
  SortedTransactions,
} from './types/Transaction'

import { SendFormValues, SendFormField, SendFormType } from './types/Forms'

import { groupTransactions } from './utils/transactions'
import { getWalletIcon, isBrowserWallet, encrypt, decrypt, getWalletKind } from './utils/account'
import { getStatus } from './utils/constants'
import { displayTokenAmount, numToUd } from './utils/number'
import { displayPubKey } from './utils/account'
import { addHexDots, removeDots, abbreviateHex, addDecimalDots, capitalize } from './utils/format'
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from './utils/colors'

import {
  ZIGS_CONTRACT,
  DEFAULT_TOWN_TEST,
  DEFAULT_TOWN_ID,
  UQBAR_NETWORK_HEX,
  UQBAR_NETWORK_INT,
  DEFAULT_BUDGET,
  ZIG_APP,
  ZIG_HOST,
} from './utils/constants'

import { NON_NUM_REGEX, ADDRESS_REGEX, NON_HEX_REGEX } from './utils/regex'

export {
  useWalletStore,
  useKeyStore,
  
  WalletStore,
  KeyStore,
  WalletType,
  RawLegacyAccount,
  Wallet,
  processAccount,
  LegacyHotWallet,
  EncryptedWallet,
  ImportedWallet,
  AnyWallet,
  SendTransactionPayload,
  SendCustomTransactionPayload,
  SendAssetPayload,
  SendTokenPayload,
  SendNftPayload,
  Txn,
  Assets,
  TokenData,
  Token,
  TokenMetadata,
  TokenMetadataStore,
  TransactionArgs,
  Transaction,
  Transactions,
  SortedTransactions,
  SendFormValues,
  SendFormField,
  SendFormType,
  Seed,

  groupTransactions,
  getWalletIcon,
  getStatus,
  displayTokenAmount,
  numToUd,
  displayPubKey,
  addHexDots,
  removeDots,
  abbreviateHex,
  addDecimalDots,
  capitalize,
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  encrypt,
  decrypt,
  isBrowserWallet,
  getWalletKind,

  ZIGS_CONTRACT,
  DEFAULT_TOWN_TEST,
  DEFAULT_TOWN_ID,
  UQBAR_NETWORK_HEX,
  UQBAR_NETWORK_INT,
  DEFAULT_BUDGET,
  ZIG_APP,
  ZIG_HOST,

  NON_NUM_REGEX,
  ADDRESS_REGEX,
  NON_HEX_REGEX
}
