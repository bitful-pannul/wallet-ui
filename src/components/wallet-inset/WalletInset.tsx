import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FaArrowLeft, FaArrowRight, FaHistory, FaRegTrashAlt } from 'react-icons/fa';
import Text from '../text/Text';
import Col from '../spacing/Col';
import CopyIcon from '../text/CopyIcon';
import Button from '../form/Button';
import Row from '../spacing/Row';
import { displayTokenAmount } from '../../utils/number';
import { ZIGS_CONTRACT } from '../../utils/constants';
import { removeDots } from '../../utils/format';
import { displayPubKey } from '../../utils/account';
import { useWalletStore } from '../../store/walletStore';
import { HardwareWallet, HotWallet } from '../../types/Accounts';
import SendTransactionForm, { BLANK_FORM_VALUES, SendFormField, SendFormType } from '../form/SendTransactionForm';
import TransactionShort from '../TransactionShort';
import TokenDisplay from '../TokenDisplay';
import HexNum from '../text/HexNum';
import HexIcon from '../text/HexIcon';
import Loader from '../popups/Loader';

import './WalletInset.css'

interface WalletInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedAccount: HotWallet | HardwareWallet
  onSelectAccount: (account: HotWallet | HardwareWallet) => void
  hideActions?: boolean
}

const WalletInset: React.FC<WalletInsetProps> = ({
  selectedAccount,
  onSelectAccount,
  hideActions = false,
  ...props
}) => {
  const { insetView, accounts, importedAccounts, assets, transactions, mostRecentTransaction: txn, unsignedTransactions,
    deleteAccount, setInsetView } = useWalletStore()
  const allAccounts = useMemo(() => (accounts as any[]).concat(importedAccounts), [accounts, importedAccounts])

  const { address, nick, rawAddress } = selectedAccount

  const [formValues, setFormValues] = useState(BLANK_FORM_VALUES)
  const [tokenId, setTokenId] = useState<string>('')
  const [nftIndex, setNftIndex] = useState<number | undefined>()
  const [from, setFrom] =  useState(address)
  const [formType, setFormType] = useState<SendFormType | undefined>()
  const [unsignedTransactionHash, setUnsignedTransactionHash] = useState<string | undefined>()

  useEffect(() => setFrom(address), [address])

  useEffect(() => {
    if (insetView?.includes('send-')) {
      const [, ft] = insetView.split('-')
      setFormType(ft as SendFormType)
    }
  }, [insetView])

  useEffect(() => {
    if (insetView === 'confirm-most-recent' && Number(txn?.status) === 100) {
      if (txn) {
        setUnsignedTransactionHash(txn.hash)
        setInsetView('send-custom')
      }
    }
  }, [insetView, unsignedTransactions, txn])

  const setFormValue = useCallback((key: SendFormField, value: string) => {
    const newValues = { ...formValues }
    newValues[key] = value
    setFormValues(newValues)
  }, [formValues, setFormValues])

  const zigsBalance = useMemo(
    () => Object.values(assets[rawAddress] || {})
      .reduce((zigsBalance, token) => 
        zigsBalance + (token.contract === ZIGS_CONTRACT ? +removeDots(String(token.data.balance || '0')) : 0)
      , 0),
    [assets, rawAddress]
  )
  
  const goBack = useCallback(() => {
    if (Boolean(formType)) {
      setFormValues(BLANK_FORM_VALUES)
    }

    setInsetView('main')
    setFormType(undefined)
  }, [formType])

  const renderHeader = () => (
    <Row className='detail-header'>
      <Row>
        <div onClick={goBack} style={{ padding: 4, cursor: 'pointer', marginBottom: -6 }}>
          <FaArrowLeft />
        </div>
        <Text bold style={{ padding: 4, marginTop: 4 }}>{
          insetView === 'accounts' ? 'Select Address' :
          insetView === 'assets' ? 'Account Assets' :
          insetView === 'confirm-most-recent' ? 'Confirm Transaction' :
          insetView?.includes('send-') ? 'Send Transaction' :
          insetView === 'unsigned' ? 'Unsigned Transactions' :
          'Transactions'
        }</Text>
      </Row>
      <div className='close-button' onClick={() => setInsetView()}>&#215;</div>
    </Row>
  )

  const renderContent = () => {
    const content = insetView === 'accounts' ? allAccounts.map(a => (
      <Row className='account' key={a.rawAddress}>
        <Col style={{ alignItems: 'flex-start' }} onClick={() => { onSelectAccount(a); goBack(); }}>
          <Text style={{ marginLeft: 32 }} bold>{a.nick}</Text>
          <HexNum num={a.address} displayNum={displayPubKey(a.address)} copyText={a.rawAddress} copy />
        </Col>
        <Col className='delete'>
          <FaRegTrashAlt onClick={e => { e.stopPropagation(); deleteAccount(a.address) }} />
        </Col>
      </Row>
    )) :
    insetView === 'assets' ? (
      !assets[rawAddress] ? <Text style={{ margin: '0 12px' }}>No assets</Text> :
        Object.values(assets[rawAddress]).map(t => (
        <Row key={t.id}>
          <TokenDisplay token={t} small selectToken={(tokenId, nftIndex) => {
            setTokenId(tokenId)
            setNftIndex(nftIndex)
            setInsetView(`send-${nftIndex ? 'nft' : 'tokens'}`)
          }} />
        </Row>
      ))
    ) :
    insetView?.includes('send-') ? <div>
      <SendTransactionForm
        {...{ id: tokenId, nftIndex, formType, from, unsignedTransactionHash, onDone: () => setInsetView('main'), formValues, setFormValue, setFormValues }}
      />
    </div>  :
    insetView === 'confirm-most-recent' ? (
      <Col style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Loader size='large' dark />
      </Col>
    ) :
    insetView === 'unsigned' ? (
      !Object.keys(unsignedTransactions).length ? <Text style={{ margin: 12 }}>No transactions</Text> :
        Object.values(unsignedTransactions).map(t => <TransactionShort key={t.hash} external txn={t} selectHash={(hash: string) => {
          setUnsignedTransactionHash(hash)
          setInsetView('send-custom')
        }} vertical />)
    ) : (
      !transactions.length ? <Text style={{ margin: 12 }}>No transactions</Text> :
        transactions.map(t => <TransactionShort key={t.hash} external txn={t} selectHash={() => null} vertical />)
    )

    return (
      <Col className='sub-menu-content'>
        {content}
      </Col>
    )
  }

  if (insetView !== 'main') {
    return (
      <Col {...props} className={`wallet-inset sub-menu ${props.className || ''}`}>
        {renderHeader()}
        {renderContent()}
      </Col>
    )
  }

  return (
    <Col {...props} className={`wallet-inset ${props.className || ''}`}>
      <Row className='main-header'>
        <Text style={{ margin: '0 auto' }}>Uqbar Wallet</Text>
      </Row>
      <Col style={{ alignItems: 'center' }}>
        <Col {...props} className={`hex-color-circle ${props.className || ''} colors`}>
          <HexIcon size='2.5em' hexNum={rawAddress} onClick={() => setInsetView('accounts')} style={{ margin: '0.75em auto' }} />
          <Text bold>{nick}</Text>
          <Row>
            <Text breakAll className='hex-text' mono> 
              {displayPubKey(address)}
            </Text>
            <CopyIcon text={rawAddress} />
          </Row>
        </Col>
        <Text bold style={{ fontSize: 20, marginTop: 16 }}>{displayTokenAmount(zigsBalance, 18, 8)} ZIG</Text>
        <Button variant='unstyled' className='assets-button' onClick={() => setInsetView('assets')}>View account assets</Button>
      </Col>
      {!hideActions && (
        <Row className='buttons'>
          <div className='lower-button' onClick={() => setInsetView('assets')}>Send</div>
          <div className='lower-button' onClick={() => setInsetView('send-custom')}>Custom</div>
          <div className='lower-button' onClick={() => setInsetView('unsigned')}>Sign</div>
          <div className='lower-button' onClick={() => setInsetView('transactions')}>
            <FaHistory />
          </div>
        </Row>
      )}
    </Col>
  )
}

export default WalletInset
