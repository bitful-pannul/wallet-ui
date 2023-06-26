export const PUBLIC_URL = '/apps/uqbar'
export const ZIGS_ACCOUNT_ID = '0x7606.5857.3281.e401.e302.1994.b290.0c32.a17b.cc89.c5d9.d78a.4b5e.4938.ee05.af06'
export const MY_CONTRACT_ID = '0xfafa.fafa'
export const METADATA_GRAIN_ID = '0xdada.dada'
export const DUMMY_METADATA = {
  id: METADATA_GRAIN_ID,
  holder: MY_CONTRACT_ID,
  source: MY_CONTRACT_ID,
  town_id: '0x0',
  label: 'token-metadata',
  salt: '3859435834985',
  data: `['ZOG' 'ZIG' 18 1.000.000 ~ | ~ 0x0 385.9435.834.985]`
}

export const DEFAULT_TOWN_ID = '0x0'
export const BURN_ADDRESS = '0x0'
export const DEFAULT_USER_ADDRESS = '0xdead.beef'
export const DEFAULT_RATE = 1
export const DEFAULT_BUDGET = 1000000 // 1 million

export const ZIGGURAT_STORAGE_VERSION = 2
export const INDEXER_STORAGE_VERSION = 2
export const WALLET_STORAGE_VERSION = 2

export const ORIGIN = window?.location?.origin
export const BASENAME = '/apps/uqbar'
export const WEBTERM_PATH = '/apps/webterm'

export const DEFAULT_TXN_COST = 0.000000000001000000

export const STATUS_CODES : { [key: number] : string } = {
  // 100: 'transaction pending in wallet',
  // 101: 'transaction submitted to sequencer',
  // 102: 'transaction received by sequencer',
  // 103: 'failure: transaction rejected by sequencer',
  100: 'pending in wallet',
  101: 'submitted to sequencer',
  102: 'received by sequencer',
  103: 'failure: rejected by sequencer',

  // ::  200-class refers to codes that come from a completed transaction
  // ::  that sequencer has given us a receipt for,
  // ::  informed by status codes in smart.hoon
  // ::
  // ::  300-class are equivalent, but the transaction has been officially
  // ::  included in a batch.
  200: 'successfully performed',
  201: 'bad signature',
  202: 'incorrect nonce',
  203: 'lack zigs to fulfill budget',
  204: 'couldn\'t find contract',
  205: 'data was under contract ID',
  206: 'crash in contract execution',
  207: 'validation of diff failed',
  208: 'ran out of gas while executing',
  209: 'dedicated burn transaction failed',

  300: 'successfully performed',
  301: 'bad signature',
  302: 'incorrect nonce',
  303: 'lack zigs to fulfill budget',
  304: 'couldn\'t find contract',
  305: 'data was under contract ID',
  306: 'crash in contract execution',
  307: 'validation of diff failed',
  308: 'ran out of gas while executing',
  309: 'dedicated burn transaction failed',
}

export const STATUS_CODES_RAW : { [key: number] : string } = {
  0: 'successfully performed',
  1: 'bad signature',
  2: 'incorrect nonce',
  3: 'lack zigs to fulfill budget',
  4: 'couldn\'t find contract',
  5: 'data was under contract ID',
  6: 'crash in contract execution',
  7: 'validation of diff failed',
  8: 'ran out of gas while executing',
  9: 'dedicated burn transaction failed',
}

export const UNSIGNED_STATUS = 100
export const SUCCESSFUL_STATUS = 200

export const getStatus = (status: number) => STATUS_CODES[status] || 'unknown'

export const getRawStatus = (status: number) => STATUS_CODES_RAW[status] || 'unknown'

export const ONE_SECOND = 1000
export const THIRTY_SECONDS = 30 * ONE_SECOND

export const DEFAULT_TOWN_TEST = '0x0'
export const ZIGS_CONTRACT = '0x74.6361.7274.6e6f.632d.7367.697a'

export const ZIG_HOST = '~dister-dozzod-bacdun'
export const ZIG_APP = 'zig'

export const GOERLI_DEPOSIT_CONTRACT = '0xAB85B98aff89a7567aC364fB9Ab22fd1E8e6b403'

export const UQBAR_NETWORK_URL = 'https://chain-id.uqbar.network/uqbar-chain-id'
export const UQBAR_EXPLORER_URL = `${ORIGIN}/apps/uqbar/indexer`
export const UQBAR_NETWORK_HEX = '0x7261627175'
export const UQBAR_NETWORK_INT = 491260113269
export const BROWSER_WALLET_TYPES = ['brave', 'metamask', 'other-browser']

export const BLANK_FORM_VALUES = { to: '', rate: '1', bud: '1000000', amount: '', contract: '', town: '', action: '' }

export const WALLETCONNECT_METADATA = {
  name: 'Uqbar Wallet',
  description: 'The wallet app for Uqbar',
  url: 'https://uqbar.network',
  icons: ['data:image/png;base64,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']
}
export const WALLETCONNECT_PROJECT_ID = "52b13e3ea7ac7c6b94fd0fc6d4064cce"
export const WALLETCONNECT_CONNECT_PARAMS = {
  requiredNamespaces: {
    eip155: {
      methods: ['eth_sendTransaction', 'personal_sign'],
      chains: ['eip155:1'],
      events: ['chainChanged', 'accountsChanged']
    }
  }
}
