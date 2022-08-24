import React, { useMemo, useState } from 'react'
import AccountBalance from '../components/assets/AccountBalance'
import SendModal from '../components/popups/SendModal'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'
import { displayPubKey } from '../utils/account';

import './AssetsView.scss'

const PLACEHOLDER = 'All addresses'

const AssetsView = () => {
  const { assets, accounts, loadingText, metadata } = useWalletStore()
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>()
  const [id, setId] = useState<string | undefined>()
  const [nftId, setNftIndex] = useState<number | undefined>()
  const accountsList = useMemo(() => selectedAddress ? [selectedAddress] : Object.keys(assets), [assets, selectedAddress])

  const selectAddress = (e: any) => {
    setSelectedAddress(e.target.value === PLACEHOLDER ? undefined : e.target.value)
  }

  return (
    <Container className='assets-view'>
      <Row style={{ maxWidth: 600, justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Assets</h2>
        <Row>
          <label style={{ marginRight: 8 }}>Address:</label>
          <select className='address-selector' value={selectedAddress} onChange={selectAddress}>
            <option>{PLACEHOLDER}</option>
            {accounts.map(({ address }) => (
              <option value={address} key={address}>
                {displayPubKey(address)}
              </option>
            ))}
          </select>
        </Row>
      </Row>
      <Col>
        {(!accountsList.length && !loadingText) && (
          <Text style={{ marginTop: 16 }}>You do not have any Uqbar accounts yet.</Text>
        )}
        {accountsList.map(a => (
          <AccountBalance
            key={a}
            pubKey={a}
            showAddress={!selectedAddress}
            setId={setId}
            setNftIndex={setNftIndex}
            balances={Object.values(assets[a]).filter(({ contract }) => metadata[contract])}
          />
        ))}
      </Col>
      <SendModal
        show={Boolean(id)}
        id={id}
        nftId={nftId}
        formType={nftId !== undefined ? 'nft' : 'tokens'}
        children={null}
        hide={() => {
          setId(undefined)
          setNftIndex(undefined)
        }}
      />
    </Container>
  )
}

export default AssetsView
