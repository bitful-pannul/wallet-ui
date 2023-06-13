import React, { useState } from 'react'
import { FaCaretDown, FaCoins, FaPortrait } from 'react-icons/fa';
import { useWalletStore } from '../store/walletStore';
import { Token } from '../types/Token'
import { displayTokenAmount } from '../utils/number';
import Button from './form/Button';
import Col from './spacing/Col';
import Row from './spacing/Row'
import Text from './text/Text';
import Field from './spacing/Field';
import NftImage from './NftImage';
import Divider from './spacing/Divider';
import Entry from './spacing/Entry';
import HexNum from './text/HexNum';
import { removeDots } from '../utils/format';

import './TokenDisplay.css'

interface TokenDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  token: Token
  selectToken: (tokenId: string, nftIndex?: number) => void
  small?: boolean
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({
  token,
  selectToken,
  small = false,
  ...props
}) => {
  const { metadata } = useWalletStore()
  const tokenMetadata = metadata[token.data.metadata]
  const { contract, id, data } = token
  const balance = +removeDots(String(data.balance!))
  const [open, setOpen] = useState(false)
  const isToken = token.token_type === 'token'

  return (
    <Col {...props} onClick={() => !open && setOpen(true)} className={`token-display ${props.className || ''} ${open ? 'open' : ''} ${small ? 'small' : ''}`}>
      <Row className='token-display-header' onClick={() => setOpen(!open)}>
        <Row style={{  flexBasis: '70%', maxWidth: '70%' }}>
          <Row style={{ padding: '2px 4px' }}>
            <FaCaretDown className='arrow' /> 
            {isToken? <FaCoins /> : <FaPortrait /> }
          </Row>
          <Text bold className='token-name'>
            {(isToken ? tokenMetadata?.data?.symbol : tokenMetadata?.data?.name) || <HexNum num={contract} />} -
            {isToken ? (
              <Text style={{ marginLeft: 4 }}>{displayTokenAmount(balance, tokenMetadata?.data?.decimals || 1, open ? tokenMetadata?.data?.decimals || 12 : 12)}</Text>
              ) : (
              <Text style={{ marginLeft: 4 }}># {data.id || ''}</Text>
            )}
          </Text>
        </Row>
        <Button onClick={(e: any) => {e.stopPropagation();selectToken(id, data.id)}} style={{ marginLeft: 16 }} dark small>
          Send
        </Button>
      </Row>
      <Col className='details'>
        <Divider />
        {isToken && tokenMetadata?.data?.name && (
          <Entry>
            <Field name='Name:'>
              <Text mono>{tokenMetadata?.data?.name}</Text>
            </Field>
          </Entry>
        )}
        {isToken && tokenMetadata?.data?.decimals && (
          <Entry>
            <Field name='Decimals:'>
              <Text breakWord mono>{tokenMetadata?.data?.decimals}</Text>
            </Field>
          </Entry>
        )}
        <Entry>
          <Field name='Contract:' style={small ? { flexDirection: 'column' } : {}}>
            <HexNum copy mono num={contract} />
          </Field>
        </Entry>
        <Entry>
          <Field name='Item:' style={small ? { flexDirection: 'column' } : {}}>
            <HexNum copy mono num={id} />
          </Field>
        </Entry>
        {!isToken && token.data.properties && (
          <Entry>
            <Field name='Properties:' style={small ? { flexDirection: 'column' } : {}}>
              <Row style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <Col style={{ marginRight: 16 }}>
                  {Object.keys(token.data.properties).map((prop) => (
                    <Text key={prop} breakWord mono>{prop}: {token.data.properties ? token.data.properties[prop] : 'unknown'}</Text>
                  ))}
                </Col>
                {token.data.uri && <NftImage nftInfo={data} />}
              </Row>
            </Field>
          </Entry>
        )}
      </Col>
    </Col>
  )
}

export default TokenDisplay
