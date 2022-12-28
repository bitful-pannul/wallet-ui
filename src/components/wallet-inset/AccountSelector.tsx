import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { displayPubKey } from '../../utils/account';
import WalletInset from './WalletInset';
import { useWalletStore } from '../../store/walletStore';
import { HardwareWallet, HotWallet, RawAccount } from '../../types/Accounts';
import Button from '../form/Button';
import Row from '../spacing/Row';
import HexIcon from '../text/HexIcon';
import Text from '../text/Text';
import useDocketState from '../../store/docketStore';
import { ONE_SECOND, ZIG_APP, ZIG_HOST } from '../../utils/constants';
import Modal from '../popups/Modal';
import Col from '../spacing/Col';
import LoadingOverlay from '../popups/LoadingOverlay';
import api from '../../api';

import './AccountSelector.scss'

interface AccountSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectAccount?: (account: HotWallet | HardwareWallet) => void
  hideActions?: boolean
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  onSelectAccount,
  hideActions = false,
  ...props
}) => {
  const { allies, addAlly, requestTreaty, installDocket } = useDocketState();
  const { insetView, selectedAccount, promptInstall, loadingText,
    setInsetView, setSelectedAccount, setPromptInstall, setLoading } = useWalletStore()

  const selectAccount = useCallback((account: HotWallet | HardwareWallet) => {
    setSelectedAccount(account)
    if (onSelectAccount) onSelectAccount(account)
  }, [setSelectedAccount, onSelectAccount])

  const installZiggurat = useCallback(async () => {
    setLoading('Installing Uqbar Suite and syncing the Uqbar chain, this could take up to 10 minutes...')
    try {
      if (!allies[ZIG_HOST]) {
        await addAlly(ZIG_HOST)
      }
      await requestTreaty(ZIG_HOST, ZIG_APP)
      await installDocket(ZIG_HOST, ZIG_APP)
      setPromptInstall(false)

      const interval = setInterval(async () => {
        try {
          await api.scry<{[key: string]: RawAccount}>({ app: 'wallet', path: '/accounts' })
          clearInterval(interval)
          setLoading(null)
        } catch (err) {}
      }, 5 * ONE_SECOND)
    } catch (err) {
      alert(`There was an error installing the Uqbar suite, please try again or type "|install ${ZIG_HOST} %${ZIG_APP}" (without quotes) in the dojo.`)
      setLoading(null)
    }
  }, [])

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

  if (!selectedAccount) {
    return (
      <Row {...props} className={`account-selector ${props.className || ''}`}>
        <Button className='selector' onClick={e => e.preventDefault()}>
          <Row style={{ padding: '6px 10px' }}>
            No Accounts
          </Row>
        </Button>
      </Row>
    )
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
