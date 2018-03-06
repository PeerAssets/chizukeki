import * as React from 'react'
import { View } from 'react-native'
import RoutineButton from '../generics/routine-button'
import {
  Container,
  Segment,
  Header,
  Content,
  Card,
  CardItem,
  Text,
  H2,
  H3,
  Body,
  Input,
  Button,
  Item,
  Right,
  Icon,
  Label,
  variables
} from 'native-base'

import bitcore from '../lib/bitcore'
import Wrapper from '../generics/Wrapper'

import { WrapActionable } from '../wallet/UnlockModal'
import Wallet from '../wallet/Wallet'

import Summary from './Summary'
import { Deck } from './papi'

type Recipient = { address: string, amount: number }

namespace SendAsset {
  export type Data = {
    amountsMap: {
      [address: string]: number
    }
  }
  // todo proper deckSpawn typing
  export type Payload = Data & { wallet: Wallet.Unlocked, deckSpawn: any }
  export type Props = {
    stage?: string | undefined,
    send: (data: Payload) => any,
    wallet: Wallet.Data,
    asset: Summary.Balance
  }
}

let smallTextStyle = {
  lineHeight: 14,
  fontSize: 12,
  textOverflow: 'ellipsis',
}

function isFilled(s: SendAsset.Data): s is SendAsset.Data {
  return Boolean(Object.keys(s.amountsMap).length)
}

function Recipient(
  { address, amount, decimals, remove }:
  Recipient & { decimals: number, remove: () => void }
) {
  return (
    <CardItem styleNames='recipient'>
      <Body styleNames='row underlined'>
        <Text style={smallTextStyle} styleNames='recipient column'>{address}</Text>
        <Text style={smallTextStyle} styleNames='amount column'>{amount.toFixed(decimals)}</Text>
        <Button style={{ height: 30 }} styleNames='warning transparent' onPress={remove}>
          <Icon name='minus' />
        </Button>
      </Body>
    </CardItem>
  )
}

class AddRecipient extends React.Component<{ decimals: number, add: (r: Recipient) => any }, Recipient> {
  state = {
    address: '',
    amount: 0,
  }
  setAmount = (num: string) => {
    this.setState({
      amount: Number(num)
    })
  }
  normalizedState = () => {
    let { amount, address } = this.state
    let decimals = this.props.decimals
    return {
      address,
      amount: Math.round(Number(amount) * Math.pow(10, decimals)) / Math.pow(10, decimals)
    }
  }
  ok = () => {
    let { address, amount } = this.normalizedState()
    return address && amount
  }
  add = () => {
    let { address, amount } = this.normalizedState()
    if (address && amount) {
      this.props.add({ address, amount })
      this.setState({
        address: '',
        amount: 0,
      })
    }
  }
  render() {
    let { address, amount } = this.state
    let ok = this.ok()
    return (
      <CardItem>
        <Body styleNames='row'>
          <Item styleNames='stacked column collapsing'>
            <Label>To address</Label>
            <Input
              style={smallTextStyle}
              value={address}
              placeholder='...'
              onChangeText={address => this.setState({ address })} />
          </Item>
          <Item styleNames='stacked column collapsing'>
            <Label>Amount</Label>
            <Input
              keyboardType='numeric'
              placeholder='0.00'
              style={smallTextStyle}
              value={`${this.state.amount || ''}`}
              onChangeText={this.setAmount} />
          </Item>
          <Button style={{ height: 63, paddingTop: 20 }}
            styleNames={`${ok ? 'success' : 'dark'} transparent`} onPress={this.add}>
            <Icon name='plus' style={{ opacity: ok ? 1 : 0.5 }}/>
          </Button>
        </Body>
      </CardItem>
    )

  }
}

class SendAsset extends React.Component<SendAsset.Props, SendAsset.Data> {
  state: SendAsset.Data = {
    amountsMap: {},
  }
  send = (privateKey: string) => {
    let { wallet, asset, send } = this.props
    if(isFilled(this.state) && Deck.isFull(asset.deck)){
      let wallet = Object.assign({ privateKey }, this.props.wallet)
      send({ wallet, ...this.state, deckSpawn: asset.deck.spawnTransaction })
    }
  }
  render() {
    let {
      asset: { deck: { name, decimals }, type },
      wallet: { keys, balance }
    } = this.props

    let amountsMap = this.state.amountsMap
    let totalAmount = Object.values(this.state.amountsMap).reduce((s, v) => s + v, 0)
    let transactionType = type === 'RECIEVED' ? 'Send' : 'Issue'
    let canSendAmount = (transactionType === 'Issue' || (totalAmount > balance))

    let SendButton = (props: { onPress: () => any }) =>
      <RoutineButton styleNames='block'
        disabled={(!isFilled(this.state)) || (!canSendAmount) || !Deck.isFull(this.props.asset.deck)}
        icons={{ DEFAULT: 'send' }}
        stage={this.props.stage}
        DEFAULT={!canSendAmount ? 'Insufficient Funds!' : `${transactionType} Asset`}
        STARTED='Sending'
        DONE='Sent!'
        FAILED='Invalid Transaction'
        {...props} />


    let remove = (address: string) => () => {
      let { [address]: _, ...amountsMap } = this.state.amountsMap
      this.setState({ amountsMap })
    }

    let recipientCount = Object.keys(amountsMap).length 
    let headers = { address: 'Add recipents to send a transaction',  }

    return (
      <Card style={{width: '100%'}}>
        <CardItem styleNames='header'>
          <Body styleNames='row'>
            <H2 style={{ flexBasis: 200, paddingBottom: 15 }}>{transactionType} {name}</H2>
          </Body>
        </CardItem>
        <CardItem>
          <Body styleNames='row'>
            <Text styleNames='recipient column'>Recipient Addresses</Text>
            <Text styleNames='amount column'>Amounts</Text>
            <View style={{ justifyContent: 'space-between', paddingRight: 17, paddingTop: 8 }}>
              <Icon name='send' style={{ fontSize: 18 }} />
            </View>
          </Body>
        </CardItem>
        {Object.entries(amountsMap).map(([ address, amount ]) =>
          <Recipient key={address} {...{ decimals, address, amount, remove: remove(address) }} />)}
        <AddRecipient decimals={decimals} add={({ address, amount }: Recipient) =>
            this.setState({ amountsMap: { ...amountsMap, [address]: amount } })} />
        <CardItem styleNames='footer'>
          <Body>
            <WrapActionable.IfLocked
              keys={keys}
              actionProp='onPress'
              action={this.send}
              Component={SendButton}
            />
          </Body>
        </CardItem>
      </Card>
    )
  }
}


export default SendAsset
