import React, { useState } from 'react'
import { FaCaretRight, FaCaretDown } from 'react-icons/fa';
import useWalletStore from '../../store/walletStore';
import { Token } from '../../types/Token'
import { abbreviateHex } from '../../utils/format';
import { formatAmount } from '../../utils/number';
import Button from '../form/Button';
import Col from '../spacing/Col';
import Row from '../spacing/Row'
import Text from '../text/Text';
import NftImage from './NftImage';
import './TokenDisplay.scss'

interface TokenDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  token: Token
  setId: (id: string) => void
  setNftIndex: (nftId?: number) => void
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({
  token,
  setId,
  setNftIndex,
  ...props
}) => {
  const { metadata } = useWalletStore()
  const tokenMetadata = metadata[token.contract]
  const { contract, id, data } = token
  const [open, setOpen] = useState(false)
  const isToken = data.balance !== undefined
  const selectToken = () => {
    setId(id)
    setNftIndex(data.id)
  }

  return (
    <Col {...props} className={`token-display ${props.className || ''}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row>
          <Row onClick={() => setOpen(!open)} style={{ padding: '2px 4px', cursor: 'pointer' }}>
            {open ? <FaCaretDown /> : <FaCaretRight />}
          </Row>
          <Text mono>{(isToken ? tokenMetadata?.data?.symbol : tokenMetadata?.data?.name) || abbreviateHex(contract)}</Text>
        </Row>
        <Row>
          {isToken ? (
            <Text>{formatAmount(data.balance! / Math.pow(10, tokenMetadata?.data?.decimals || 1))}</Text>
            ) : (
            <Text># {data.id || ''}</Text>
          )}
          <Button onClick={selectToken} style={{ marginLeft: 16 }} variant="dark small">
            Transfer
          </Button>
        </Row>
      </Row>
      {open && (
        <Col style={{ paddingLeft: 24, paddingTop: 8 }}>
          {isToken && tokenMetadata?.data?.name && (
            <Row>
              <Text mono>{tokenMetadata?.data?.name}</Text>
            </Row>
          )}
          <Col style={{ marginBottom: 6 }}>
            <Text>Contract ID:</Text>
            <Text style={{ wordBreak: 'break-all', display: 'block' }} mono>{' ' + contract}</Text>
          </Col>
          <Col style={{ marginBottom: 6 }}>
            <Text>Grain ID:</Text>
            <Text style={{ wordBreak: 'break-all', display: 'block' }} mono>{' ' + id}</Text>
          </Col>
          {!isToken && <NftImage nftInfo={data} />}
        </Col>
      )}
    </Col>
  )
}

export default TokenDisplay
