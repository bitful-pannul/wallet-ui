import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Web3ModalSign } from '@web3modal/sign-react';

import { displayPubKey } from '../../utils/account';
import WalletInset from './WalletInset';
import { useWalletStore } from '../../store/walletStore';
import { AnyWallet, EncryptedWallet, ImportedWallet, LegacyHotWallet, RawLegacyAccount } from '../../types/Accounts';
import Button from '../form/Button';
import Row from '../spacing/Row';
import HexIcon from '../text/HexIcon';
import Text from '../text/Text';
import { ONE_SECOND, ZIG_APP, ZIG_HOST } from '../../utils/constants';
import Modal from '../popups/Modal';
import Col from '../spacing/Col';
import LoadingOverlay from '../popups/LoadingOverlay';
import PendingTxnIndicator from './PendingTxnIndicator';

import './AccountSelector.css'

interface AccountSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectAccount?: (account: AnyWallet) => void
  hideActions?: boolean
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  onSelectAccount,
  hideActions = false,
  ...props
}) => {
  const { api, insetView, selectedAccount, promptInstall, appInstalled, loadingText, unsignedTransactions,
    setInsetView, setSelectedAccount, setPromptInstall, setLoading, initWallet } = useWalletStore()

  const selectAccount = useCallback((account: AnyWallet) => {
    setSelectedAccount(account)
    if (onSelectAccount) onSelectAccount(account)
  }, [setSelectedAccount, onSelectAccount])

  const installZiggurat = useCallback(async () => {
    if (!api) {
      alert && alert('You can only install the Uqbar Suite from a web page served from your urbit.')
      return
    }

    setLoading('Installing Uqbar Suite and syncing the Uqbar chain, this could take up to 10 minutes...')
    try {
      await (window as any).api?.poke({ app: 'hood', mark: 'kiln-install', json: { local: ZIG_APP, desk: ZIG_APP, ship: ZIG_HOST } })
      setPromptInstall(false)

      const interval = setInterval(async () => {
        try {
          await api.scry<{[key: string]: RawLegacyAccount}>({ app: 'wallet', path: '/accounts' })
          clearInterval(interval)
          setLoading(null)
        } catch (err) {}
      }, 5 * ONE_SECOND)
    } catch (err) {
      alert(`There was an error installing the Uqbar suite, please try again or type "|install ${ZIG_HOST} %${ZIG_APP}" (without quotes) in the dojo.`)
      setLoading(null)
    }
  }, [api])

  if (promptInstall) {
    if (loadingText) {
      return <LoadingOverlay loading text={loadingText} />
    }

    return (
      <Modal show hide={() => setPromptInstall(false)}>
        <Col style={{ alignItems: 'center' }}>
          <h4>Please install the Uqbar app suite to continue.</h4>
          <Button variant='dark' style={{ fontWeight: 700, fontSize: 20 }} onClick={installZiggurat}>Install</Button>
        </Col>
      </Modal>
    )
  }

  if (!appInstalled) {
    return (
      <Row {...props} className={`account-selector ${props.className || ''}`}>
        <Button className='selector' onClick={() => setPromptInstall(true)}>
          <Row style={{ padding: '6px 10px' }}>
            Uqbar Wallet
          </Row>
        </Button>
      </Row>
    )
  }

  if (!selectedAccount) {
    return (
      <Row {...props} className={`account-selector ${props.className || ''}`}>
        <Button className='selector' onClick={(e: any) => e.preventDefault()}>
          <Row style={{ padding: '6px 10px' }}>
            No Accounts
          </Row>
        </Button>
      </Row>
    )
  }

  const { address } = selectedAccount
  const pendingTxnCount = Object.keys(unsignedTransactions).length

  return (
    <Row {...props} className={`account-selector ${props.className || ''}`} >
      <Button className='selector' onClick={() => setInsetView(pendingTxnCount ? 'unsigned' : 'main')}>
        <Row>
          <HexIcon hexNum={address} />
          <Text mono bold>{displayPubKey(address)}</Text>
        </Row>
        <PendingTxnIndicator />
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
      <Web3ModalSign
        projectId="52b13e3ea7ac7c6b94fd0fc6d4064cce"
        metadata={{
          name: 'Uqbar Wallet',
          description: 'The wallet app for Uqbar',
          url: 'https://uqbar.network',
          icons: ['data:image/png;base64,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']
        }}
      />
    </Row>
  )
}

export default AccountSelector
