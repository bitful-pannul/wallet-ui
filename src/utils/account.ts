import { Assets } from "../types/Assets"
import { fromUd } from "./number"

export const displayPubKey = (pubKey: string) => pubKey.slice(0, 6) + '...' + pubKey.slice(-4)

export const getToken = (assets: Assets, account: string, contract: string) => Object.values(assets[account] || {}).find((t) => t.contract === contract)

export const getTokenBalance = (assets: Assets, account: string, contract: string) => fromUd(getToken(assets, account, contract)?.data.balance)
