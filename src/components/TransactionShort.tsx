import React from 'react'
import moment from 'moment';
import { Transaction } from '../types/Transaction';
import { getStatus } from '../utils/constants';
import { abbreviateHex } from '../utils/format';
import Link from './nav/Link';
import Col from './spacing/Col';
import CopyIcon from './text/CopyIcon';
import './TransactionShort.scss'
import Button from './form/Button';
import { useWalletStore } from '../store/walletStore';
import HexNum from './text/HexNum';
import Row from './spacing/Row';
import Pill from './text/Pill';
import CustomLink from './nav/Link';

interface TransactionShortProps extends React.HTMLAttributes<HTMLDivElement> {
  txn: Transaction
  selectHash: (hash: string) => void
  vertical?: boolean
  external?: boolean
}

const TransactionShort: React.FC<TransactionShortProps> = ({
  txn,
  selectHash,
  vertical = false,
  external = false,
  ...props
}) => {
  const { deleteUnsignedTransaction } = useWalletStore()

  const unsigned = Number(txn.status) === 100

  return (
      <Col {...props} className={`transaction-short ${props.className || ''} ${vertical ? 'vertical' : ''}`}>
        <Row between style={{ flexDirection: vertical ? 'column' : undefined }}>
          <Row style={vertical ? { flexDirection: 'column', alignItems: 'flex-start' } : {}}>
            <Row>
              <CustomLink external={external} href={`${external ? '/apps/ziggurat/wallet' : ''}/transactions/${txn.hash}`}>
                <HexNum mono num={txn.hash} displayNum={abbreviateHex(txn.hash)} />
              </CustomLink>
              <CopyIcon text={txn.hash} />
            </Row>
            {vertical && <div style={{ height: 8 }} />}
            <Pill label={'Nonce'} value={''+txn.nonce} />
            {vertical && <div style={{ height: 8 }} />}
            <Pill label={'Status'} value={getStatus(txn.status)} />
            {Boolean(txn.created) && <>
              {vertical && <div style={{ height: 8 }} />}
              <Pill label='Created'  value={(typeof txn.created === 'string') ? txn.created : moment(txn.created).format()} /> 
            </>}
          </Row>
          {vertical && unsigned && <div style={{ height: 8 }} />}
          <Row>
            {unsigned && (
              <Button style={{ marginLeft: unsigned ? 0 : 8, justifySelf: 'flex-end' }} small 
                onClick={() => selectHash(txn.hash)} dark
              >
                Sign & Submit
              </Button>
            )}
            {unsigned && (
              <Button style={{ marginLeft: 8, justifySelf: 'flex-end' }} small 
                onClick={() => window.confirm('Are you sure you want to delete this transaction?') 
                  && deleteUnsignedTransaction(txn.from, txn.hash)}
              >
                Delete
              </Button>
            )}
          </Row>
        </Row>
      </Col>
  )
}

export default TransactionShort
