import React from 'react'
import { useParams } from 'react-router-dom'
import Link from '../components/nav/Link'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import Text from '../components/text/Text'
import CopyIcon from '../components/transactions/CopyIcon'
import useWalletStore from '../store/walletStore'
import { getStatus } from '../utils/constants'
import { removeDots } from '../utils/format'

import './TransactionView.scss'

const TransactionView = () => {
  const { hash } = useParams()
  const { transactions } = useWalletStore()
  const txn = transactions.find(t => t.hash === hash)

  const renderEntry = (title: string, value: string) => (
    <Row style={{ marginBottom: 12 }}>
      <Text style={{ marginRight: 12, fontWeight: 600, width: 60 }}>{title}:</Text>
      <Text style={{ overflowWrap: 'break-word' }} mono>{value}</Text>
    </Row>
  )

  if (!txn) {
    return (
      <Container className='transaction-view'>
        <h3>Transaction not found</h3>
        <Text>Please go back.</Text>
      </Container>
    )
  }

  return (
    <Container className='transaction-view'>
      <h2>Transaction</h2>
      <Col className="transaction">
        <Row style={{ marginBottom: 12 }}>
          <Text style={{ marginRight: 12, fontWeight: 600, width: 60 }}>Hash:</Text>
          <Link target="_blank" urlPrefix="/apps/uqbar-explorer" href={`/tx/${removeDots(txn.hash)}`}>
            <Text style={{ overflowWrap: 'break-word' }} mono>{removeDots(txn.hash)}</Text>
          </Link>
          <CopyIcon text={txn.hash} />
        </Row>
        {renderEntry('From', removeDots(txn.from))}
        {renderEntry('To', removeDots(txn.to))}
        <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <Row>
            <Text style={{ marginRight: 12, fontWeight: 600, width: 60 }}>Status:</Text>
            <Text mono>{getStatus(txn.status)}</Text>
          </Row>
          {txn.created && <Text mono>{txn.created.toDateString()}</Text>}
        </Row>
        {renderEntry('Town', removeDots(txn.town))}
        {renderEntry('Nonce', txn.nonce.toString())}
        {renderEntry('Rate', txn.rate.toString())}
        {renderEntry('Budget', txn.budget.toString())}
        <Col style={{ marginBottom: 12 }}>
          <Text style={{ marginRight: 12, fontWeight: 600, width: 60 }}>Args:</Text>
          <Text style={{ overflowWrap: 'break-word' }} mono>{JSON.stringify(txn.args)}</Text>
        </Col>
      </Col>
    </Container>
  )
}

export default TransactionView
