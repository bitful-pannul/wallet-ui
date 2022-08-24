import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../form/Button'
import Form from '../form/Form'
import Input from '../form/Input'
import Row from '../spacing/Row'
import Text from '../text/Text'
import useWalletStore from '../../store/walletStore'
import { Token } from '../../types/Token'
import { addHexDots } from '../../utils/number'
import { displayPubKey } from '../../utils/account'
import { signLedgerTransaction } from '../../utils/ledger'
import { removeDots } from '../../utils/format'

import './SendTokenForm.scss'
import Col from '../spacing/Col'

interface SendTokenFormProps {
  formType: 'tokens' | 'nft'
  setSubmitted: (submitted: boolean) => void
  id: string
  nftId?: number
}

const SendTokenForm = ({
  formType,
  setSubmitted,
  id,
  nftId
}: SendTokenFormProps) => {
  const selectRef = useRef<HTMLSelectElement>(null)
  const { assets, metadata, importedAccounts, setLoading, getPendingHash, sendTokens, sendNft, submitSignedHash } = useWalletStore()
  const [currentFormType, setCurrentFormType] = useState(formType)

  const isNft = currentFormType === 'nft'
  // TODO: base this on whether isNft or not
  const assetsList = useMemo(() => Object.values(assets)
    .reduce((acc: Token[], cur) => acc.concat(Object.values(cur)), [])
    .filter(t => isNft ? t.token_type === 'nft' : t.token_type === 'token'),
    [assets, isNft]
  )

  console.log(assetsList)

  const [selected, setSelected] =
    useState<Token | undefined>(assetsList.find(a => a.id === id && (!isNft || a.data.id === Number(nftId))))
  const [destination, setDestination] = useState('')
  const [rate, setGasPrice] = useState('')
  const [bud, setBudget] = useState('')
  const [amount, setAmount] = useState('')
  
  const clearForm = () => {
    setSelected(undefined)
    setDestination('')
    setGasPrice('')
    setBudget('')
    setAmount('')
  }

  useEffect(() => {
    console.log(1, assetsList, selected, id)
    if (selected === undefined && id) {
      console.log(2, selected, id)
      setSelected(assetsList.find(a => a.id === id && (nftId === undefined || Number(nftId) === a.data.id)))
    }
  }, [assetsList, id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentFormType !== formType) {
      setCurrentFormType(formType)
      setAmount('')
      setSelected(undefined)
      if (selectRef.current) {
        selectRef.current.value = 'Select an asset'
      }
    }
  }, [formType, currentFormType, setCurrentFormType])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isNft && (!amount || !Number(amount))) {
      alert('You must enter an amount')
    } else if (selected?.data?.balance && Number(amount) > selected?.data?.balance) {
      alert(`You do not have that many tokens. You have ${selected.data?.balance} tokens.`)
    } else if (!selected) {
      alert('You must select a \'from\' account')
    } else if (!destination) {
      // TODO: validate the destination address
      alert('You must specify a destination address')
    // } else if (removeDots(destination) === removeDots(selected.holder)) {
    //   alert('Destination cannot be the same as the origin')
    } else if (Number(rate) < 1 || Number(bud) < Number(rate)) {
      alert('You must specify a gas price and budget')
    // } else if (!accounts.find(a => a.rawAddress === selected.holder) && !importedAccounts.find(a => a.rawAddress === selected.holder)) {
    //   alert('You do not have this account, did you remove a hardware wallet account?')
    } else {
      const payload = {
        from: selected.holder,
        to: selected.contract,
        town: selected.town,
        destination: addHexDots(destination),
        rate: Number(rate),
        bud: Number(bud),
        grain: selected.id,
      }
      
      if (isNft && selected.data.id) {
        await sendNft(payload)
      } else if (!isNft) {
        await sendTokens({ ...payload, amount: Number(amount) })
      }

      clearForm()

      if (importedAccounts.find(a => a.rawAddress === selected.holder)) {
        const { hash, egg } = await getPendingHash()
        console.log('egg', 2, egg)
        setLoading('Please sign the transaction on your Ledger')
        const { ethHash, sig } = await signLedgerTransaction(removeDots(selected.holder), hash, egg)
        setLoading(null)
        if (sig) {
          console.log('sig', 3, sig)
          await submitSignedHash(hash, ethHash, sig)
        } else {
          alert('There was an error signing the transaction with Ledger.')
        }
      }

      setSubmitted(true)
    }
  }

  const tokenMetadata = selected && metadata[selected.contract]

  return (
    <Form className="send-token-form" onSubmit={submit}>
      {!isNft && (
        <Col>
          <Text style={{ margin: '8px 12px 0px 0px', fontSize: 14 }}>Token: </Text>
          <Text mono style={{ marginTop: 10 }}>{tokenMetadata?.data?.symbol || displayPubKey(selected?.contract || '')} - {selected?.data?.balance}</Text>
        </Col>
      )}

      {isNft && (
        <Col>
          <Text style={{ margin: '8px 12px 0px 0px', fontSize: 14 }}>NFT: </Text>
          <Text mono style={{ marginTop: 10 }}>{`${tokenMetadata?.data?.symbol || displayPubKey(selected?.contract || '')} - # ${selected?.data?.id || ''}`}</Text>
        </Col>
      )}
      <Input
        label="To:"
        placeholder='Destination address'
        style={{ width: 'calc(100% - 24px)' }}
        containerStyle={{ marginTop: 12, width: '100%' }}
        value={destination}
        onChange={(e: any) => setDestination(e.target.value)}
        required //delete line 81 & 83
      />
      {!isNft && <Input
        label="Amount:"
        placeholder="Amount"
        style={{ width: 'calc(100% - 24px)' }}
        containerStyle={{ marginTop: 12, width: '100%' }}
        value={amount}
        onChange={(e: any) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
        required //delete line 75 & 76
      />}
      <Row style={{ justifyContent: 'space-between' }}>
        <Input
          label="Gas Price:"
          placeholder="Gas price"
          style={{ width: 'calc(100% - 22px)' }}
          value={rate}
          onChange={(e: any) => setGasPrice(e.target.value.replace(/[^0-9.]/g, ''))}
          required // delete line 86 & 87
        />
        <Input
          label="Budget:"
          placeholder="Budget"
          style={{ width: 'calc(100% - 22px)' }}
          value={bud}
          onChange={(e: any) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
          required // delete line 86 & 87
        />
      </Row>
      <Button style={{ width: '100%', margin: '16px 0px 8px' }} type="submit" variant='dark' onClick={submit}>
        Send
      </Button>
    </Form>
  )
}

export default SendTokenForm