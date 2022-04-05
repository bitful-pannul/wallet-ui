import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/form/Button'
import Form from '../components/form/Form'
import Input from '../components/form/Input'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'
import { TokenBalance } from '../types/TokenBalance'

import './SendView.scss'

const SendView = () => {
  const { lord } = useParams()
  const { assets, sendTransaction } = useWalletStore()

  const assetsList = Object.values(assets).reduce((acc, cur) => acc.concat(cur), [])

  const [selected, setSelected] = useState<TokenBalance | undefined>(assetsList.find(a => a.lord === lord))
  const [destination, setDestination] = useState('')
  const [gasPrice, setGasPrice] = useState('')
  const [budget, setBudget] = useState('')
  const [amount, setAmount] = useState('')

  const submit = () => {
    // validate the destination, gas price, and budget
    if (!amount || !Number(amount)) {
      alert('You must enter an amount')
    } else if (!selected) {
      alert('You must select a \'from\' account')
    } else {
      sendTransaction({
        from: selected.holder,
        to: selected.lord,
        town: selected.town,
        amount: Number(amount),
        destination,
        token: "0xbeef", // this will come from selected.whatever-token-address
        gasPrice: Number(gasPrice),
        budget: Number(budget),
      })
    }
  }

  return (
    <Container className='send-view'>
      <h2>Send</h2>
      <Form style={{ width: 360 }} onSubmit={submit}>
        <Text style={{ fontSize: 14 }}>From:</Text>
        <select name="assets" value={selected?.riceId} onChange={(e: any) => setSelected(e.target.value)} style={{ width: 360, height: 28, marginTop: 4, fontSize: 16 }}>
          <option>Select an asset</option>
          {assetsList.map(a => (
            <option key={a.riceId} value={a.riceId} style={{ fontFamily: 'monospace monospace' }}>
              {a.riceId}
            </option>
          ))}
        </select>
        <Input
          label="To:"
          containerStyle={{ marginTop: 12, width: '100%' }}
          placeholder='Destination address'
          value={destination}
          onChange={(e: any) => setDestination(e.target.value)}
          style={{ width: 348 }}
        />
        <Input
          label="Amount:"
          containerStyle={{ marginTop: 12, width: '100%' }}
          style={{ width: 348 }}
          value={amount}
          placeholder="Amount"
          onChange={(e: any) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
        />
        <Row style={{ justifyContent: 'space-between' }}>
          <Input
            label="Gas Price:"
            containerStyle={{ marginTop: 12 }}
            style={{ width: 160 }}
            value={gasPrice}
            placeholder="Gas price"
            onChange={(e: any) => setGasPrice(e.target.value.replace(/[^0-9.]/g, ''))}
          />
          <Input
            label="Budget:"
            containerStyle={{ marginTop: 12 }}
            style={{ width: 160 }}
            value={budget}
            placeholder="Budget"
            onChange={(e: any) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </Row>
        <Button style={{ width: '100%', margin: '16px 0px 8px' }} type="submit" onClick={submit}>
          Send
        </Button>
      </Form>
    </Container>
  )
}

export default SendView
