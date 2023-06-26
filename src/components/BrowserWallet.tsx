import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Web3ModalSign, useConnect, useDisconnect, useSession, useOnSessionDelete } from '@web3modal/sign-react'
import { getSdkError } from '@walletconnect/utils'

import Row from '../components/spacing/Row'
import NetworkSelector from './NetworkSelector'
import { FaEthereum, FaExclamationTriangle } from 'react-icons/fa'
import Text from '../components/text/Text'
import Button from '../components/form/Button'
import Modal from '../components/popups/Modal'
import Col from '../components/spacing/Col'
import Input from '../components/form/Input'
import { BROWSER_WALLET_TYPES, UQBAR_NETWORK_HEX, WALLETCONNECT_CONNECT_PARAMS, WALLETCONNECT_METADATA, WALLETCONNECT_PROJECT_ID } from '../utils/constants'
import { useWalletStore } from '../store/walletStore'
import { WalletType } from '../types/Accounts'
import { getWalletIcon } from '../utils/account'
import Dropdown from './popups/Dropdown'
import { addHexDots } from '../utils/format'

interface BrowserWalletProps extends React.HTMLAttributes<HTMLDivElement> {
  showNetwork?: boolean
  showWalletConnect?: boolean
}

export default function BrowserWallet ({ showNetwork = false, showWalletConnect = false, ...props }: BrowserWalletProps) {
  const { connectedAddress, currentChainId, importedAccounts, connectBrowserWallet, set, importAccount, connectUqbarNetwork } = useWalletStore()
  const { connect, data, error: wcError, loading } = useConnect(WALLETCONNECT_CONNECT_PARAMS)
  const wcSession = useSession()
  const { disconnect } = useDisconnect({ topic: wcSession?.pairingTopic || '', reason: getSdkError('USER_DISCONNECTED') })
  useOnSessionDelete(() => set({ connectedAddress: undefined, connectedType: undefined, currentChainId: undefined }))

  const [showConnect, setShowConnect] = useState(window.location.search.includes('import'))
  const [importType, setImportType] = useState<WalletType | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showDisconnect, setShowDisconnect] = useState(false)
  const [nick, setNick] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (wcSession) {
      const connectedAddress = wcSession.namespaces.eip155.accounts[0].slice(9).toLowerCase()
      set({
        selectedAccount: importedAccounts.find(a => a.rawAddress === addHexDots(connectedAddress)),
        connectedAddress,
        connectedType: 'walletconnect'
      })
    }
  }, [wcSession])

  useEffect(() => {
    if (importType) {
      if (BROWSER_WALLET_TYPES.includes(importType)) {
        setShowConnect(false)
        connectBrowserWallet(importType).then(address => {
          const existingAccount = importedAccounts.find(a => a.address === address?.toLowerCase())
          if (address && existingAccount) {
            setImportType(null)
            setShowImport(false)
            set({ selectedAccount: existingAccount })
          } else if (address) {
            setShowImport(true)
          }
        })
      } else if (importType === 'walletconnect') {
        connect()
          .then(data => {
            // console.log('WALLETCONNECT: ', data)
            // TODO: give user the option to select one of these addresses rather than just using the first one
            const address = data.namespaces.eip155.accounts[0].replace(/eip155\:[0-9]+?\:/, '').toLowerCase()
            set({ connectedAddress: address, connectedType: importType })
            const existingAccount = importedAccounts.find(a => a.address === address?.toLowerCase())
            if (existingAccount) {
              setImportType(null)
              setShowImport(false)
              set({ selectedAccount: existingAccount })
            } else if (address) {
              setShowImport(true)
            }
          })
          .catch(err => {
            console.error(err)
            setImportType(null)
            setShowImport(false)
          })
      }
    }
  }, [importType])

  const setChainId = useCallback(async (chainId: string) => {
    if (window.ethereum) {
      if (chainId === UQBAR_NETWORK_HEX) {
        try {
          await connectUqbarNetwork()
          set({ currentChainId: chainId })
        } catch (err) { console.error(err) }
      } else {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId }]
          })
          set({ currentChainId: chainId })
        } catch (error) {
          console.error(error);
        }
      }
    }
  }, [set, connectUqbarNetwork])

  const doImport = useCallback(async () => {
    if (!nick) {
      return setError('Please enter a nickname')
    }
    if (importType) {
      await importAccount({ address: connectedAddress ? connectedAddress : undefined, nick, type: importType })
      setNick('')
      setImportType(null)
      setShowConnect(false)
      setShowImport(false)
    }
  }, [connectedAddress, nick, importType, importAccount])

  const disconnectWallet = useCallback(async () => {
    if (connectedAddress) {
      if (wcSession) {
        disconnect({ topic: wcSession.pairingTopic, reason: getSdkError('USER_DISCONNECTED') })
          .then(() => set({ connectedAddress: undefined, connectedType: undefined, currentChainId: undefined }))
      } else {
        set({ connectedAddress: undefined, connectedType: undefined, currentChainId: undefined })
      }
    }
    setShowDisconnect(false)
  }, [disconnect, wcSession, connectedAddress])

  const disableImport = useMemo(() => BROWSER_WALLET_TYPES.includes(importType || '') && !connectedAddress, [importType, connectedAddress])

  return (
    <Row {...props} style={{marginLeft: 'auto', ...props.style}}>
      {Boolean(connectedAddress) && showNetwork && <NetworkSelector currentChainId={currentChainId} setChainId={setChainId} style={{ marginRight: 16 }} />}

      {connectedAddress ? (
        <Dropdown open={showDisconnect} toggleOpen={() => setShowDisconnect(!showDisconnect)} value={
          <Button style={{ height: 37, display: 'flex', alignItems: 'center' }} onClick={() => setShowDisconnect(true)}>
            <div style={{ height: 12, width: 12, borderRadius: 10, background: 'rgb(50, 255, 50)' }} />
            <Text style={{ margin: '-2px 0 -2px 8px' }}>{connectedAddress.slice(0, 6)}...{connectedAddress.slice(-6)}</Text>
          </Button>
        }>
          <Row onClick={disconnectWallet} style={{ padding: 10, cursor: 'pointer', borderRadius: 4 }}>
            Disconnect
          </Row>
        </Dropdown>
      ) : (
        <Button onClick={() => setShowConnect(true)}>Connect Wallet</Button>
      )}

      <Modal title='Connect Account' show={showConnect}  hide={() => setShowConnect(false)} style={{ minWidth: 300, maxWidth: 500 }}>
        <Col style={{ justifyContent: 'space-evenly', alignItems: 'center', height: '100%', width: '100%' }}>
          <Text style={{ marginBottom: '1em' }}>Please connect to hardware wallets through a browser wallet such as Metamask or Brave</Text>
          <Text style={{ marginBottom: '1em' }}>Select your account type to continue:</Text>
          <Button mb1 style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} onClick={() => {
            setShowConnect(false)
            setImportType('metamask')
          }}>
            Metamask
            {getWalletIcon('metamask')}
          </Button>
          <Button mb1 style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} onClick={() => {
            setShowConnect(false)
            setImportType('brave')
          }}>
            Brave
            {getWalletIcon('brave')}
          </Button>
          <Button mb1 style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} onClick={() => {
            setShowConnect(false)
            setImportType('other-browser')
          }}>
            Other Browser Wallet
            {getWalletIcon('other-browser')}
          </Button>
          <Button mb1 style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} onClick={() => {
            setShowConnect(false)
            setImportType('walletconnect')
          }}>
            WalletConnect
            {getWalletIcon('walletconnect')}
          </Button>
        </Col>
      </Modal>

      <Modal
        title='Import Account'
        show={showImport}
        hide={() => { setImportType(null); setShowImport(false) }}
        style={{ minWidth: 300, maxWidth: 450 }}
      >
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          {Boolean(connectedAddress) && 
          <>
            <Text style={{ marginBottom: 4, wordBreak: 'break-all' }}>Please enter a nickname for</Text>
            <Text style={{ marginBottom: 16, wordBreak: 'break-all' }} mono>{connectedAddress}</Text>
          </>}
          <Input
            label='Nickname'
            onChange={(e: any) => { setNick(e.target.value) ; setError('') }}
            placeholder={`i.e. Browser primary`}
            style={{ width: '100%' }}
            containerStyle={{ width: '100%', marginBottom: '1em' }}
            value={nick}
            required
          />
          {Boolean(error) && <Text style={{ color: 'red', marginBottom: 16 }}>{error}</Text>}
          <Button onClick={doImport} disabled={disableImport} dark fullWidth style={{ width: '100%', marginBottom: '1em' }}>
            Import
          </Button>
          <Button onClick={() => { setImportType(null); setShowImport(false) }} dark fullWidth style={{ width: '100%' }}>
            No Thanks
          </Button>
        </Col>
      </Modal>

      {showWalletConnect && <Web3ModalSign projectId={WALLETCONNECT_PROJECT_ID} metadata={WALLETCONNECT_METADATA} />}
    </Row>
  )
}
