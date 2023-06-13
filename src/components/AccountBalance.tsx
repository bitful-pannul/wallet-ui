import React from 'react'
import { Token } from '../types/Token'
import TokenDisplay from './TokenDisplay'
import { displayPubKey } from '../utils/account'
import Row from './spacing/Row'
import CopyIcon from './text/CopyIcon'
import { addHexDots, removeDots } from '../utils/format'
import Text from './text/Text'
import Col from './spacing/Col'
import Button from './form/Button'
import HexNum from './text/HexNum'
import { useWalletStore } from '../store/walletStore'

interface AccountBalanceProps extends React.HTMLAttributes<HTMLDivElement> {
  pubKey: string
  balances: Token[]
  selectToken: (tokenId: string, nftIndex?: number) => void
  setCustomFrom: (customFrom: string) => void
  selectPubkey: (pubKey: string) => void
}

const AccountBalance: React.FC<AccountBalanceProps> = ({
  balances,
  pubKey,
  selectToken,
  setCustomFrom,
  selectPubkey,
  ...props
}) => {
  const connectedAddress = useWalletStore(state => state.connectedAddress)

  return (
    <div {...props} className={`account-balance ${props.className || ''}`} style={{ ...props.style, marginBottom: balances.length ? 8 : 16 }}>
      <Row between style={{  }}>
        <Col>
          <Row style={{ alignItems: 'center' }}>
            <h4 style={{ fontFamily: 'monospace, monospace', margin: 0, cursor: 'pointer', lineHeight: 1.5, whiteSpace: 'nowrap', textOverflow: 'ellipsis', flexDirection: 'row', display: 'flex', alignItems: 'center' }}
              onClick={() => selectPubkey(pubKey)}>
            {removeDots(pubKey) === connectedAddress && <div style={{ height: 12, width: 14, borderRadius: 8, background: 'rgb(0, 205, 0)', marginRight: '0.5em' }} />}
              <HexNum num={pubKey} displayNum={displayPubKey(pubKey)} />
            </h4>
            <CopyIcon text={addHexDots(pubKey)} />
            <CopyIcon text={pubKey} style={{ marginLeft: 6 }} eth />
          </Row>
        </Col>
        <Button dark small style={{ marginTop: 8 }} onClick={() => setCustomFrom(pubKey)}>
          Custom Txn
        </Button>
      </Row>
      {balances.length ? (
        balances.map(b => (
          <TokenDisplay token={b} key={b.id} selectToken={selectToken} />
        ))
      ) : (
        <Text>There are no assets under this account.</Text>
      )}
    </div>
  )
}

export default AccountBalance
