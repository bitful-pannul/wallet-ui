import React, { useCallback, useEffect, useState } from 'react'
import {  FaArrowRight, FaRegTrashAlt,  } from 'react-icons/fa';
import { useWalletStore } from '../store/walletStore';
import { LegacyHotWallet, ImportedWallet, EncryptedWallet } from '../types/Accounts';
import { displayPubKey, getWalletIcon } from '../utils/account';
import Input from './form/Input';
import Col from './spacing/Col';
import Row from './spacing/Row'
import Text from './text/Text';
import CopyIcon from './text/CopyIcon';
import { ONE_SECOND, PUBLIC_URL } from '../utils/constants';
import HexNum from './text/HexNum';
import CustomLink from './nav/Link'

import './AccountDisplay.css'

interface AccountDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  account: LegacyHotWallet | EncryptedWallet | ImportedWallet
  customLink?: string
  full?: boolean
  onDelete?: () => void
}

const AccountDisplay: React.FC<AccountDisplayProps> = ({
  account,
  customLink,
  full = false,
  onDelete = () => {},
  ...props
}) => {
  const { nick, address, rawAddress, nonces } = account
  const { connectedAddress, deleteAccount, editNickname, setLoading } = useWalletStore()
  const [newNick, setNewNick] = useState(nick)
  const [nickSaved, setNickSaved] = useState(false)

  useEffect(() => {
    setNewNick(nick)
  }, [nick])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (newNick && newNick !== nick) {
        const nickWithType = 'type' in account && account.type ? `${newNick}//${account.type}` : newNick
        editNickname(rawAddress, nickWithType)
        setNickSaved(true)
        setTimeout(() => setNickSaved(false), ONE_SECOND * 2)
      }
    }, ONE_SECOND)
    return () => clearTimeout(delayDebounceFn)
  }, [newNick]) // eslint-disable-line react-hooks/exhaustive-deps

  const onClickDelete = useCallback(async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading('Deleting account...')
    try {
      if (window.confirm('Really delete this account?') && 'rawAddress' in account) {
        await deleteAccount(rawAddress)
        await onDelete()
      }
    } catch {}
    setLoading(null)
  }, [])

  const imported = account as ImportedWallet
  const isImported = Boolean(imported?.type)

  return (
    <Col {...props} className={`account-display ${props.className || ''}`}>
      {(address === connectedAddress || rawAddress === connectedAddress) && Boolean(imported?.type) && <Row style={{ marginBottom: 8 }}>
        <div style={{ height: 16, width: 16, borderRadius: 10, background: 'rgb(50, 255, 50)', marginRight: '1em' }} />
        <Text style={{ marginRight: '1em' }}>Connected</Text>
      </Row>}
      <Row between style={{  }}>
        <Row>
          {isImported && getWalletIcon(imported?.type)}
          <Input
            className={`nick-input ${nickSaved ? 'nick-saved' : ''}`}
            style={{ fontWeight: 600, margin: `0 1em 0 ${isImported ? '1em' : '0'}`, width: '10em'  }}
            onChange={(e: any) => setNewNick(e.target.value)}
            value={newNick}
          />
          <CustomLink href={customLink || `${PUBLIC_URL}/indexer/address/${address}`}>
            <Row>
              <HexNum num={address} displayNum={displayPubKey(address)} mono bold />
              {!full && <FaArrowRight className='ml1' />}
            </Row>
          </CustomLink>
          <CopyIcon text={rawAddress} />
          <CopyIcon text={rawAddress} eth style={{ marginLeft: 6 }} />
        </Row>
        <Row>
          <Row className='icon' onClick={onClickDelete}>
            <FaRegTrashAlt  />
          </Row>
        </Row>
      </Row>
      {full && (
        <Col>
          <h4 style={{ marginTop: 16 }}>Nonces</h4>
          {Object.entries(nonces).length === 0 && <Text className=''>No nonces to display.</Text>}
          {Object.entries(nonces).map(([k, v], i) => (
            <Row key={i}>
              <Text style={{ marginRight: 8, width: 72 }}>Town: {k}</Text>
              <Text>Nonce: {v}</Text>
            </Row>
          ))}
        </Col>
      )}
    </Col>
  )
}

export default AccountDisplay
