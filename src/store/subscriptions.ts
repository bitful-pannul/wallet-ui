import { GetState, SetState } from "zustand";
import { SubscriptionRequestInterface } from "@urbit/http-api";
import { Assets } from "../types/Assets";
import { Transaction, RawTransaction } from "../types/Transaction";
import { showNotification } from "../utils/notification";
import { WalletStore } from "./walletStore";
import { TokenMetadataStore } from "../types/TokenMetadata";
import { Token } from "../types/Token";
import { SUCCESSFUL_STATUS, UNSIGNED_STATUS } from "../utils/constants";

export interface Subscriptions {
  [project: string]: Promise<number>[]
}

export function createSubscription(app: string, path: string, e: (data: any) => void): SubscriptionRequestInterface {
  const request = {
    app,
    path,
    event: e,
    err: () => console.warn('SUBSCRIPTION ERROR'),
    quit: () => {
      throw new Error('subscription clogged');
    }
  };
  // TODO: err, quit handling (resubscribe?)
  return request;
}

export const handleBookUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => (balanceData: Assets) => {
  console.log('ASSETS:', balanceData)
  const assets: Assets = {}

  Object.keys(balanceData).forEach(holder => {
    assets[holder] = Object.keys(balanceData[holder]).reduce((acc, cur) => {
      acc[cur] = { ...balanceData[holder][cur], holder }
      return acc
    }, {} as { [key: string]: Token })
  })

  set({ assets })
}

export const handleMetadataUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => (metadata: TokenMetadataStore) => {
  console.log('METADATA', metadata)
  set({ metadata })
}

export const handleTxnUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => async (rawTxn: { [key: string]: RawTransaction | Transaction }) => {
  const txnHash = Object.keys(rawTxn)[0]
  const isRaw = 'transaction' in rawTxn[txnHash]
  const txn: Transaction = isRaw ?
  {
    hash: txnHash,
    modified: new Date(),
    town: (rawTxn[txnHash] as RawTransaction).transaction.town,
    contract: (rawTxn[txnHash] as RawTransaction).transaction.contract,
    from: (rawTxn[txnHash] as RawTransaction).transaction.from,
    action: (rawTxn[txnHash] as RawTransaction).transaction.action,
    status: Number((rawTxn[txnHash] as RawTransaction)?.transaction?.status),
    nonce: Number((rawTxn[txnHash] as RawTransaction)?.transaction?.nonce || 0),
    rate: Number((rawTxn[txnHash] as RawTransaction)?.transaction?.rate || 0),
    budget: Number((rawTxn[txnHash] as RawTransaction)?.transaction?.budget || 0),
  } : {
    hash: txnHash,
    modified: new Date(),
    town: (rawTxn[txnHash] as Transaction).town,
    contract: (rawTxn[txnHash] as Transaction).contract,
    from: (rawTxn[txnHash] as Transaction).from,
    action: (rawTxn[txnHash] as Transaction).action,
    status: Number((rawTxn[txnHash] as Transaction).status),
    nonce: Number((rawTxn[txnHash] as Transaction).nonce || 0),
    rate: Number((rawTxn[txnHash] as Transaction).rate || 0),
    budget: Number((rawTxn[txnHash] as Transaction).budget || 0),
  }
  console.log('PARSED TXN UPDATE:', txn)

  const { transactions } = get()

  const exists = transactions.find(({ hash }) => txn.hash === hash)

  if (exists) {
    if (exists.status !== SUCCESSFUL_STATUS && txn.status === SUCCESSFUL_STATUS) {
      showNotification(`Transaction confirmed!`)
    }

    const newTransactions = transactions.map(t => ({ ...t, modified: t.hash === txn.hash ? new Date() : t.modified, status: Number(t.hash === txn.hash ? txn.status : t.status) }))
    set({ transactions: newTransactions, mostRecentTransaction: { ...exists, ...txn } })
  } else if (txn.hash && txn.status !== UNSIGNED_STATUS) {
    // TODO: make sure sent-to-us will show up in getTransactions
    set({ transactions: [{ ...txn, created: new Date(), modified: new Date() } as Transaction].concat(transactions), mostRecentTransaction: txn })
  }
}
