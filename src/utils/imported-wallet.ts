import { ethers } from "ethers"
import { keccak256 } from "ethers/lib/utils";

import { WalletType } from "../types/Accounts";
import { Txn } from "../types/SendTransaction";
import { addHexDots, removeDots } from "./format";
// import { signLedgerTransaction } from "./ledger";
// import { signTrezorTransaction } from "./trezor";

export const generateMessage = (hash: string, txn: Txn) => {
  const cleanHash = removeDots(hash)
  const data = cleanHash.length % 2 === 0 ? cleanHash : '0x0' + cleanHash.slice(2)
  // const ethHash = ethers.utils.serializeTransaction({
  return JSON.stringify({
    contract: removeDots(txn.to),
    gasPrice: '0x' + txn.rate.toString(16),
    gasLimit: ethers.utils.hexlify(txn.budget),
    nonce: txn.nonce,
    chainId: parseInt(txn.town, 16),
    data,
    // value: ethers.utils.parseUnits(1, "ether")._hex
  })
}

export const generateEthHash = (message: string) => {
  const utf8Encode = new TextEncoder();
  const encodedHash = utf8Encode.encode("\x19Ethereum Signed Message:\n" + message.length + message);
  return keccak256(Buffer.from(encodedHash))
}

export const signWithImportedWallet = async (type: WalletType, address: string, hash: string, txn: Txn) => {
  let sig
  const message = generateMessage(hash, txn)
  const ethHash = generateEthHash(message)
  
  switch (type) {
    case 'metamask':
    case 'brave':
    case 'other-browser':
      await (window as any).ethereum?.request({ method: 'eth_requestAccounts' })
      const sigHex = await (window as any).ethereum
        .request({
          method: 'personal_sign',
          params: [message, address, message],
        })
        .catch((error: string) => {
          console.error(error)
          const notAuthorizedMessage = 'You must be logged in and then authorize this site to sign messages with your wallet.'
          window.alert(notAuthorizedMessage)
          throw new Error(notAuthorizedMessage)
        });
      sig = ethers.utils.splitSignature(sigHex)
      break
    case 'walletconnect':

      break
    // case 'ledger':
    //   sig = await signLedgerTransaction(ethHash)
    //   break
    // case 'trezor':
    //   sig = await signTrezorTransaction(hash, txn)
    //   break
  }

  return { ethHash, sig }
}
