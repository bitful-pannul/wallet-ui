import React, { useCallback, useEffect, useState } from 'react'
import AccountDisplay from '../components/accounts/AccountDisplay'
import Button from '../components/form/Button'
import Form from '../components/form/Form'
import Input from '../components/form/Input'
import TextArea from '../components/form/TextArea'
import Modal from '../components/popups/Modal'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Divider from '../components/spacing/Divider'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'
import { DerivedAddressType, HardwareWalletType, Seed } from '../types/Accounts'
import { capitalize } from '../utils/format'

import './AccountsView.scss'

const AccountsView = () => {
  const { accounts, importedAccounts, getAccounts, createAccount, restoreAccount, importAccount, getSeed, deriveNewAddress } = useWalletStore()
  const [showCreate, setShowCreate] = useState(false)
  const [showAddWallet, setShowAddWallet] = useState<'create' | 'restore' | undefined>()
  const [showImport, setShowImport] = useState(false)
  const [mnemonic, setMnemonic] = useState('')
  const [password, setPassword] = useState('')
  const [seedData, setSeed] = useState<Seed | null>(null)
  const [addAddressType, setAddAddressType] = useState<DerivedAddressType | null>(null)
  const [nick, setNick] = useState('')
  const [hdpath, setHdpath] = useState('')
  const [importType, setImportType] = useState<HardwareWalletType | null>(null)

  const addHardwareAddress = addAddressType && addAddressType !== 'hot'

  useEffect(() => {
    getAccounts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showImport && !showAddWallet && !addAddressType) {
      setNick('')
    }
  }, [showImport, showAddWallet, addAddressType])

  const showSeed = useCallback(async () => {
    if (window.confirm('Are you sure you want to display your seed phrase? Anyone viewing this will have access to your account.')) {
      const seed = await getSeed()
      setSeed(seed)
    }
  }, [getSeed, setSeed])

  const clearForm = useCallback(() => {
    setNick('')
    setHdpath('')
    setPassword('')
    setAddAddressType(null)
  }, [setNick, setHdpath, setPassword, setAddAddressType])

  const create = useCallback(async (e) => {
    e.preventDefault()
    if (window.confirm('Please make sure you have backed up your seed phrase and password. This will overwrite your existing account(s), are you sure?')) {
      if (showAddWallet === 'restore') {
        if (!mnemonic) {
          return alert('Mnemonic is required')
        } else {
          restoreAccount(mnemonic, password, nick)
        }
      } else {
        createAccount(password, nick)
      }
      setShowAddWallet(undefined)
      setShowCreate(false)
      clearForm()
    }
  }, [mnemonic, password, nick, showAddWallet, createAccount, restoreAccount, clearForm])

  const doImport = useCallback(() => {
    if (!nick) {
      alert('Nickname is required')
    } else {
      if (importType) {
        importAccount(importType, nick)
      }
      setShowCreate(false)
      setShowAddWallet(undefined)
      setShowImport(false)
      setImportType(null)
      clearForm()
    }
  }, [setShowCreate, setShowAddWallet, setShowImport, importAccount, clearForm, nick, importType])

  const addAddress = (e: any) => {
    e.preventDefault()
    if (addHardwareAddress) {
      if (!hdpath) {
        return alert('You must supply an HD path')
      }
      deriveNewAddress(hdpath, nick, addAddressType)
    } else if (addAddressType) {
      deriveNewAddress(hdpath, nick)
    }
    clearForm()
  }

  const hardwareWalletTypes: HardwareWalletType[] =
    importedAccounts.reduce((acc, { type }) => !acc.includes(type) ? acc.concat([type]) : acc, [] as HardwareWalletType[])

  hardwareWalletTypes.push('trezor')

  return (
    <Container className='accounts-view'>
      <h3>Hot Wallets</h3>
      {accounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      {accounts.length > 0 && (
        <>
          <Button onClick={showSeed} style={{ marginBottom: 16, width: 200 }}>
            Display Seed Phrase
          </Button>
          <Button onClick={() => setAddAddressType('hot')} style={{ marginBottom: 16, width: 200 }}>
            Derive New Address
          </Button>
        </>
      )}
      <Button onClick={() => setShowCreate(true)} style={{ width: 200 }}>
        + New Wallet
      </Button>
      <Divider style={{ margin: '40px 0 16px' }} />
      <h3>Hardware Wallets</h3>
      {importedAccounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      {importedAccounts.length > 0 && (
        <Button onClick={() => setAddAddressType(hardwareWalletTypes[0])} style={{ marginBottom: 16, width: 200 }}>
          Derive New Address
        </Button>
      )}
      <Button onClick={() => setShowImport(true)} style={{ width: 200 }}>
        + Connect
      </Button>
      <Modal show={Boolean(seedData)} hide={() => setSeed(null)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', height: '100%', width: '300px' }}>
          <h4 style={{ margin: '0 0 8px' }}>Seed:</h4>
          <Text mono>{seedData?.mnemonic}</Text>
          {seedData?.password && (
            <>
              <h4>Password:</h4>
              <Text mono>{seedData?.password}</Text>
            </>
          )}
        </Col>
      </Modal>
      <Modal show={showCreate} hide={() => setShowCreate(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Button  style={{ minWidth: 280, marginBottom: 24 }} onClick={() => setShowAddWallet('create')}>Create New Wallet</Button>
          <Button  style={{ minWidth: 280 }} onClick={() => setShowAddWallet('restore')}>Restore Wallet From Seed</Button>
        </Col>
      </Modal>
      <Modal show={Boolean(showAddWallet)} hide={() => setShowAddWallet(undefined)} style={{ minHeight: 160, minWidth: 300 }}>
        <Form style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: 'calc(100% - 32px)', background: 'white' }} onSubmit={create}>
          <h3 style={{ marginTop: 0 }}>{showAddWallet === 'create' ? 'Create' : 'Restore'} Wallet</h3>
          <Input
            onChange={(e: any) => setNick(e.target.value)}
            placeholder="Nickname"
            style={{ width: 'calc(100% - 20px)' }}
            containerStyle={{ width: '100%', marginBottom: 16 }}
            value={nick}
            minLength={3}
            required
            autoFocus
          />
          {showAddWallet === 'restore' && (<TextArea
            onChange={(e: any) => setMnemonic(e.target.value)}
            placeholder="Enter seed phrase"
            containerStyle={{ width: '100%', marginBottom: 16 }}
            style={{ width: 'calc(100% - 8px)', height: 80 }}
          />)}
          <Input
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{ width: 'calc(100% - 20px)', marginBottom: 16 }}
            containerStyle={{ width: '100%' }}
            type="password"
            value={password}
            minLength={8}
            required
          />
          <Button style={{ minWidth: 120 }} type="submit" variant='dark'>
            {showAddWallet === 'create' ? 'Create' : 'Restore'}
          </Button>
        </Form>
      </Modal>
      <Modal show={showImport} hide={() => setShowImport(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Button style={{ minWidth: 120 }} onClick={() => {
            setShowImport(false)
            setImportType('ledger')
          }}>
            Connect Ledger
          </Button>
        </Col>
      </Modal>
      <Modal show={Boolean(importType)}
        hide={() => {
          setShowImport(true)
          setImportType(null)
        }}
        style={{ minHeight: 160, minWidth: 300 }}
      >
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <h4 style={{ marginTop: 0 }}>Set Nickname</h4>
          <Input
            onChange={(e: any) => setNick(e.target.value)}
            placeholder={`Nickname, i.e. ${capitalize(importType || '')} primary`}
            style={{ width: 'calc(100% - 16px)' }}
            containerStyle={{ width: '100%', marginBottom: 24 }}
            value={nick}
          />
          <Button style={{ minWidth: 120 }} onClick={doImport} variant="dark">
            Connect
          </Button>
        </Col>
      </Modal>
      <Modal show={Boolean(addAddressType)} hide={clearForm}>
        <Form style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: 300, maxWidth: '100%', background: 'white' }} onSubmit={addAddress}>
          <h3 style={{ margin: '0 0 12px' }}>Derive New Address</h3>
          {(addHardwareAddress) && (
            <select className='hardware-type' value={addAddressType} onChange={(e) => setAddAddressType(e.target.value as HardwareWalletType)}>
              {hardwareWalletTypes.map(hwt => (
                <option value={hwt}>
                  {capitalize(hwt)}
                </option>
              ))}
            </select>
          )}
          <Input
            onChange={(e: any) => setNick(e.target.value)}
            placeholder="Nickname"
            style={{ width: 'calc(100% - 20px)' }}
            containerStyle={{ width: '100%', marginBottom: 16 }}
            value={nick}
            minLength={3}
            required
          />
          <Input
            onChange={(e: any) => setHdpath(e.target.value)}
            placeholder={`HD Path ${addHardwareAddress ? '(m/44\'/60\'/0\'/0/0)' : '(optional)'}`}
            style={{ width: 'calc(100% - 20px)' }}
            containerStyle={{ width: '100%', marginBottom: 16 }}
            value={hdpath}
            required={Boolean(addHardwareAddress)}
          />
          <Button type="submit" variant="dark" style={{ minWidth: 120 }}>Derive</Button>
        </Form>
      </Modal>
    </Container>
  )
}

export default AccountsView
