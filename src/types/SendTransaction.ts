export interface SendTransactionPayload {
  from: string
  contract: string
  town: string
}

export interface SendCustomTransactionPayload extends SendTransactionPayload {
  action: string
  unsigned?: boolean
}

export interface SendAssetPayload extends SendTransactionPayload {
  to: string
  item: string
}

export interface SendTokenPayload extends SendAssetPayload {
  amount: number
}

export interface SendNftPayload extends SendAssetPayload {}

export interface Txn {
  to: string
  rate: number
  budget: number
  nonce: number
  town: string
}
