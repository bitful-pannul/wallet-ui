import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { displayPubKey } from '../../utils/account';
import WalletInset from './WalletInset';
import { useWalletStore } from '../../store/walletStore';
import { HardwareWallet, HotWallet } from '../../types/Accounts';
import Button from '../form/Button';
import HexNum from '../text/HexNum';
import Row from '../spacing/Row';

import './AccountSelector.scss'
import HexIcon from '../text/HexIcon';
import Text from '../text/Text';

interface AccountSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectAccount?: (account: HotWallet | HardwareWallet) => void
  hideActions?: boolean
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  onSelectAccount,
  hideActions = false,
  ...props
}) => {
  const { accounts, importedAccounts, insetView, selectedAccount, setInsetView, setSelectedAccount } = useWalletStore()
  const allAccounts = useMemo(() => (accounts as any[]).concat(importedAccounts), [accounts, importedAccounts])

  const selectAccount = useCallback((account: HotWallet | HardwareWallet) => {
    setSelectedAccount(account)
    if (onSelectAccount) onSelectAccount(account)
  }, [setSelectedAccount, onSelectAccount])

  if (!selectedAccount) {
    return null
  }

  const { address } = selectedAccount

  return (
    <Row {...props} className={`account-selector ${props.className || ''}`} >
      <Button className='selector' onClick={() => setInsetView('main')}>
        <Row>
          <HexIcon hexNum={address} />
          <Text mono bold>{displayPubKey(address)}</Text>
        </Row>
      </Button>
      {Boolean(insetView) && (
        <>
          <div className='inset-background' onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            setInsetView(undefined)
          }} />
          <div className='inset-container' onClick={e => e.stopPropagation()}>
            <WalletInset {...{ selectedAccount, onSelectAccount: selectAccount }} />
          </div>
        </>
      )}
    </Row>
  )
}

export default AccountSelector
