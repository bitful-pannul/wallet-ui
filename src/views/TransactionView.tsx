import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Entry from '../components/form/Entry'
import Field from '../components/form/Field'
import BackLink from '../components/nav/BackLink'
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

  const renderField = (title: string, value: string) => (
    <Field name={title}>
      <Text mono breakWord>{value}</Text>
    </Field>
  )

  if (!txn) {
    return (
      <Container className='transaction-view'>
        <h3>Transaction not found</h3>
        <BackLink />
      </Container>
    )
  }

  return (
    <Container className='transaction-view'>
      <h2>Transaction</h2>
      <Col className='transaction'>
        <Entry>
          <Field name='Hash:'>
            <Link target='_blank' urlPrefix='/apps/uqbar-explorer' href={`/tx/${removeDots(txn.hash)}`}>
              <Text style={{ overflowWrap: 'break-word' }} mono>{removeDots(txn.hash)}</Text>
            </Link>
            <CopyIcon text={txn.hash} />
          </Field>
        </Entry>
        <Entry>
          {renderField('From:', removeDots(txn.from))}
          {renderField('To:', removeDots(txn.to))}
        </Entry>
        <Entry>
          <Field name='Status:'>
            <Text mono>{getStatus(txn.status)}</Text>
            {txn.created && <Text mono style={{ marginLeft:'auto'}}>{txn.created.toDateString()}</Text>}
          </Field>
        </Entry>
        <Entry>
          {renderField('Town:', removeDots(txn.town))}
        </Entry>
        <Entry>
        {renderField('Nonce:', txn.nonce.toString())}
        </Entry>
        <Entry>
          {renderField('Rate:', txn.rate.toString())}
          {renderField('Budget:', txn.budget.toString())}
        </Entry>
        <Entry>
          <Field name='Args:'>
            <Col style={{ marginBottom: 12 }}>
              <Text style={{ overflowWrap: 'break-word' }} mono breakWord>{JSON.stringify(txn.args)}</Text>
            </Col>
          </Field>
        </Entry>
      </Col>
      <BackLink/> 
    </Container>
  )
}

export default TransactionView
