import { useWalletStore } from "../../store/walletStore"

export default function PendingTxnIndicator() {
  const { unsignedTransactions, insetView } = useWalletStore()
  const pendingTxnCount = Object.keys(unsignedTransactions).length

  if (pendingTxnCount <= 0 || insetView === 'confirm-most-recent' || insetView?.includes('send')) {
    return null
  }

  return (
    <div style={{
      position: 'absolute',
      top: -8,
      left: 0,
      width: 20,
      height: 20,
      fontSize: 14,
      color: 'white',
      backgroundColor: 'red',
      borderRadius: 16,
      verticalAlign: 'middle',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>{pendingTxnCount}</div>
  )
}
