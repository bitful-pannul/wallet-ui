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

interface TransactionShortProps extends React.HTMLAttributes<HTMLDivElement> {
  txn: Transaction
  selectHash: (hash: string) => void
  isUnsigned?: boolean
}

const TransactionShort: React.FC<TransactionShortProps> = ({
  txn,
  selectHash,
  isUnsigned = false,
  ...props
}) => {
  const { deleteUnsignedTransaction } = useWalletStore()

  return (
      <Col {...props} className={`transaction-short ${props.className || ''}`}>
        <Row between>
          <Row>
            <Link href={`/transactions/${txn.hash}`}>
              <HexNum mono num={txn.hash} displayNum={abbreviateHex(txn.hash)} />
            </Link>
            <CopyIcon text={txn.hash} />
            <Pill label={'Nonce'} value={''+txn.nonce} />
            <Pill label={'Status'} value={getStatus(txn.status)} />
            {txn.created ? <Pill label='Created' 
              value={(typeof txn.created === 'string') ? txn.created
              : moment(txn.created).format()} /> 
            : <></>}
          </Row>
          <Row>
            {isUnsigned && (
              <Button style={{ marginLeft: 8, justifySelf: 'flex-end' }} small 
                onClick={() => selectHash(txn.hash)} dark
              >
                Sign & Submit
              </Button>
            )}
            {isUnsigned && (
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
