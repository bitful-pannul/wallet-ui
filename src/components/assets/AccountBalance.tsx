import React, { useState } from 'react'
import { Token } from '../../types/Token'
import TokenDisplay from './TokenDisplay'
import './AccountBalance.scss'
import Line from '../spacing/Line'
import { displayPubKey } from '../../utils/account'
import { useNavigate } from 'react-router-dom'
import Row from '../spacing/Row'
import CopyIcon from '../transactions/CopyIcon'
import { removeDots } from '../../utils/format'
import Text from '../text/Text'
import Col from '../spacing/Col'
import SendModal from '../popups/SendModal'
import Button from '../form/Button'

interface AccountBalanceProps extends React.HTMLAttributes<HTMLDivElement> {
  pubKey: string
  balances: Token[]
  showAddress: boolean
  setId: (id: string) => void
  setNftIndex: (nftId?: number) => void
}

const AccountBalance: React.FC<AccountBalanceProps> = ({
  balances,
  pubKey,
  showAddress,
  setId,
  setNftIndex,
  ...props
}) => {
  const navigate = useNavigate()
  const [showCustomModal, setShowCustomModal] = useState(false)

  return (
    <div {...props} className={`account-balance ${props.className || ''}`}>
      {showAddress && (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col>
            <Row style={{ alignItems: 'center' }}>
              <h4 style={{ fontFamily: 'monospace, monospace', margin: 0, cursor: 'pointer' }} onClick={() => navigate(`/accounts/${pubKey}`)}>
                {displayPubKey(pubKey)}
              </h4>
              <CopyIcon text={removeDots(pubKey)} />
            </Row>
          </Col>
          <Button variant='dark small' style={{ marginTop: 8 }} onClick={() => setShowCustomModal(true)}>
            Custom Txn
          </Button>
        </Row>
      )}
      {balances.length ? (
        balances.map(b => (
          <TokenDisplay token={b} key={b.id} setId={setId} setNftIndex={setNftIndex} />
        ))
      ) : (
        <Text>There are no assets under this account.</Text>
      )}
      <SendModal from={pubKey} formType='custom' show={showCustomModal} hide={() => setShowCustomModal(false)} children={null}/>
    </div>
  )
}

export default AccountBalance
