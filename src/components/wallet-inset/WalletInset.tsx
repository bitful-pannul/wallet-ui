import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FaArrowLeft, FaArrowRight, FaHistory, FaRegTrashAlt } from 'react-icons/fa';
import { useConnect } from '@web3modal/sign-react';

import Text from '../text/Text';
import Col from '../spacing/Col';
import CopyIcon from '../text/CopyIcon';
import Button from '../form/Button';
import Row from '../spacing/Row';
import { displayTokenAmount } from '../../utils/number';
import { BLANK_FORM_VALUES, BROWSER_WALLET_TYPES, UQBAR_NETWORK_HEX, ZIGS_CONTRACT } from '../../utils/constants';
import { removeDots } from '../../utils/format';
import { displayPubKey, getWalletIcon } from '../../utils/account';
import { useWalletStore } from '../../store/walletStore';
import { AnyWallet, EncryptedWallet, ImportedWallet, LegacyHotWallet, WalletType } from '../../types/Accounts';
import SendTransactionForm from '../form/SendTransactionForm';
import TransactionShort from '../TransactionShort';
import TokenDisplay from '../TokenDisplay';
import HexNum from '../text/HexNum';
import HexIcon from '../text/HexIcon';
import Loader from '../popups/Loader';
import PendingTxnIndicator from './PendingTxnIndicator';
import Input from '../form/Input';
import { SendFormField, SendFormType } from '../../types/Forms';

import './WalletInset.css'

interface WalletInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedAccount: AnyWallet
  onSelectAccount: (account: AnyWallet) => void
  hideActions?: boolean
}

const WalletInset: React.FC<WalletInsetProps> = ({
  selectedAccount,
  onSelectAccount,
  hideActions = false,
  ...props
}) => {
  const { insetView, legacyAccounts, encryptedAccounts, importedAccounts, assets, transactions, mostRecentTransaction: txn, unsignedTransactions, connectedAddress,
    deleteAccount, setInsetView, connectBrowserWallet, importAccount, set } = useWalletStore()

  const { connect, data, error: wcError, loading } = useConnect({
    requiredNamespaces: {
      eip155: {
        methods: ['personal_sign'],
        chains: ['eip155:1', 'eip155:5'],
        events: ['chainChanged', 'accountsChanged']
      }
    }
  })

  const allAccounts = useMemo(() => [...legacyAccounts, ...encryptedAccounts, ...importedAccounts], [legacyAccounts, encryptedAccounts, importedAccounts])

  const { address, nick, rawAddress } = selectedAccount

  const [formValues, setFormValues] = useState(BLANK_FORM_VALUES)
  const [tokenId, setTokenId] = useState<string>('')
  const [nftIndex, setNftIndex] = useState<number | undefined>()
  const [from, setFrom] =  useState(address)
  const [formType, setFormType] = useState<SendFormType | undefined>()
  const [unsignedTransactionHash, setUnsignedTransactionHash] = useState<string | undefined>()
  const [showConnect, setShowConnect] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importType, setImportType] = useState<WalletType | null>(null)
  const [newNick, setNewNick] = useState('')
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (importType) {
      if (BROWSER_WALLET_TYPES.includes(importType)) {
        connectBrowserWallet(importType).then(address => {
          if (address && importedAccounts.find(a => a.address === address?.toLowerCase())) {
            setImportType(null)
            setShowImport(false)
          } else if (address) {
            setShowImport(true)
          }
          setShowConnect(false)
        })
      } else if (importType === 'walletconnect') {
        connect()
          .then(data => {
            // console.log('WALLETCONNECT: ', data)
            // TODO: give user the option to select one of these addresses rather than just using the first one
            const address = data.namespaces.eip155.accounts[0].replace(/eip155\:[0-9]+?\:/, '').toLowerCase()
            set({ connectedAddress: address, connectedType: importType, wcTopic: data.topic })
            if (!importedAccounts.find(a => a.address === address?.toLowerCase())) {
              setShowImport(true)
            } else {
              setImportType(null)
              setShowImport(false)
            }
            setShowConnect(false)
          })
          .catch(err => {
            console.error(err)
            setImportType(null)
            setShowImport(false)
          })
      }
    }
  }, [importType])

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
    if (showConnect) {
      setShowConnect(false)
    } else {
      if (Boolean(formType)) {
        setFormValues(BLANK_FORM_VALUES)
      }
  
      setInsetView('main')
      setFormType(undefined)
    }
  }, [formType, showConnect])

  const doImport = useCallback(async () => {
    if (!newNick) {
      return setError('Please enter a nickname')
    }
    if (importType) {
      await importAccount({ address: connectedAddress ? connectedAddress : undefined, nick: newNick, type: importType })
      setNewNick('')
      setImportType(null)
      setShowConnect(false)
      setShowImport(false)
    }
  }, [connectedAddress, newNick, importType, importAccount])

  const renderHeader = () => (
    <Row className='detail-header'>
      <Row>
        <div onClick={goBack} style={{ padding: 4, cursor: 'pointer', marginBottom: -6 }}>
          <FaArrowLeft />
        </div>
        <Text bold style={{ padding: 4, marginTop: 4 }}>{
          insetView === 'accounts' ? showConnect ? 'Connect Account' : 'Select Address' :
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

  const importButtonStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%' }
  const disableImport = useMemo(() => BROWSER_WALLET_TYPES.includes(importType || '') && !connectedAddress, [importType, connectedAddress])

  const renderContent = () => {
    const content = insetView === 'accounts' ? <Col>
      {showConnect ? (
        <>
          <Col style={{ justifyContent: 'space-evenly', alignItems: 'center', height: '100%', width: '100%' }}>
            <Text style={{ fontSize: 14, margin: '1em 0.5em' }}>Select your account type to continue:</Text>
            <Button small mb1 style={importButtonStyle} onClick={() => setImportType('metamask')}>
              Metamask
              {getWalletIcon('metamask')}
            </Button>
            <Button small mb1 style={importButtonStyle} onClick={() => setImportType('brave')}>
              Brave
              {getWalletIcon('brave')}
            </Button>
            <Button small mb1 style={importButtonStyle} onClick={() => setImportType('other-browser')}>
              Other Browser Wallet
              {getWalletIcon('other-browser')}
            </Button>
            <Button small mb1 style={importButtonStyle} onClick={() => setImportType('walletconnect')}>
              WalletConnect
              {getWalletIcon('walletconnect')}
            </Button>
          </Col>
        </>
      ) : showImport ? (
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '90%', margin: '1em 5% 0' }}>
          {Boolean(connectedAddress) && 
          <>
            <Text style={{ marginBottom: 4, wordBreak: 'break-all' }}>Please enter a nickname for</Text>
            <Text style={{ marginBottom: 16, wordBreak: 'break-all' }} mono>{connectedAddress}</Text>
          </>}
          <Input
            label='Nickname'
            onChange={(e: any) => { setNewNick(e.target.value) ; setError('') }}
            placeholder={`i.e. Browser primary`}
            style={{ width: '100%' }}
            containerStyle={{ width: '100%', marginBottom: '1em' }}
            value={newNick}
            required
          />
          {Boolean(error) && <Text style={{ color: 'red', marginBottom: 16 }}>{error}</Text>}
          <Button small onClick={doImport} disabled={disableImport} dark style={{ width: '100%', marginBottom: '1em' }}>
            Import
          </Button>
          <Button small onClick={() => { setImportType(null); setShowImport(false); setShowConnect(false) }} dark style={{ width: '100%' }}>
            No Thanks
          </Button>
        </Col>
      ) : (
        <>
          {allAccounts.map(a => (
            <Row className='account' key={a.rawAddress}>
              <Col style={{ alignItems: 'flex-start' }} onClick={() => { onSelectAccount(a); goBack(); }}>
                <Text style={{ marginLeft: 32 }} bold>{a.nick}</Text>
                <HexNum num={a.address} displayNum={displayPubKey(a.address)} copyText={a.rawAddress} copy />
              </Col>
              <Col className='delete'>
                <FaRegTrashAlt onClick={e => { e.stopPropagation(); deleteAccount(a.address) }} />
              </Col>
            </Row>
          ))}
          <Button small style={{ margin: '1em auto' }} onClick={() => setShowConnect(true)}>Connect Account</Button>
        </>
      )}
    </Col> :
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
        Object.values(unsignedTransactions).map(t => <TransactionShort key={t.hash} txn={t} selectHash={(hash: string) => {
          setUnsignedTransactionHash(hash)
          setInsetView('send-custom')
        }} vertical />)
    ) : (
      !transactions.length ? <Text style={{ margin: 12 }}>No transactions</Text> :
        transactions.map(t => <TransactionShort key={t.hash} txn={t} selectHash={() => null} vertical />)
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
            <CopyIcon text={rawAddress} style={{ marginLeft: 8 }} eth />
          </Row>
        </Col>
        <Text bold style={{ fontSize: 20, marginTop: 16 }}>{displayTokenAmount(zigsBalance, 18, 12)} ZIG</Text>
        <Button variant='unstyled' className='assets-button' onClick={() => setInsetView('assets')}>View account assets</Button>
      </Col>
      {!hideActions && (
        <Row className='buttons'>
          <div className='lower-button' onClick={() => setInsetView('assets')}>Send</div>
          <div className='lower-button' onClick={() => setInsetView('send-custom')}>Custom</div>
          <div style={{ position: 'relative' }} className='lower-button' onClick={() => setInsetView('unsigned')}>
            Sign
            <PendingTxnIndicator />
          </div>
          <div className='lower-button' onClick={() => setInsetView('transactions')}>
            <FaHistory />
          </div>
        </Row>
      )}
    </Col>
  )
}

export default WalletInset
