import * as React from 'react'
import { View, Platform } from 'react-native'
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
  Left,
  Icon,
  Label,
  variables
} from 'native-base'

import bitcore from '../lib/bitcore'
import { Wrapper } from '../generics/Layout'

import { WrapActionable } from '../wallet/UnlockModal'
import Wallet from '../wallet/Wallet'

import Summary from './Summary'
import { Deck } from './papi'

import Field from '../generics/Field'

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
    asset: Summary.Asset
  }
}

let smallTextStyle = {
  lineHeight: 14,
  fontSize: 12,
  flex: 0,
  ...(Platform.OS === 'web' ? { textOverflow: 'ellipsis' } : {}),
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
        <Text ellipsizeMode='middle' numberOfLines={1}
          style={[smallTextStyle, { flex: 2 }]} styleNames='recipient column'>{address}</Text>
        <Text style={[smallTextStyle, { flex: 1 }]} styleNames='amount column'>{amount.toFixed(decimals)}</Text>
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
          <Field styleNames='stacked column collapsing'>
            {ref => [
              <Label key={0}>To address</Label>,
              <Input
                key={1}
                ref={ref}
                style={smallTextStyle}
                value={address}
                placeholder='...'
                onChangeText={address => this.setState({ address })} />
            ]}
          </Field>
          <Field styleNames='stacked column collapsing'>
            {ref => [
              <Label key={0}>Amount</Label>,
              <Input
                key={1}
                ref={ref}
                keyboardType='numeric'
                placeholder='0.00'
                style={smallTextStyle}
                value={`${this.state.amount || ''}`}
                onChangeText={this.setAmount} />
            ]}
          </Field>
          <Button style={{ height: 63, paddingTop: 20 }}
            styleNames={`${ok ? 'success' : 'dark'} transparent`} onPress={this.add}>
            <Icon name='plus' style={{ opacity: ok ? 1 : 0.5 }}/>
          </Button>
        </Body>
      </CardItem>
    )

  }
}

function SendButton(props: { stage: undefined | string, DEFAULT: string, disabled: boolean, onPress: () => any }){
  return (
    <RoutineButton styleNames='block'
      icons={{ DEFAULT: 'send' }}
      STARTED='Sending'
      DONE='Sent!'
      FAILED='Invalid Transaction'
      {...props} />
  )
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
      asset: { deck: { name, decimals }, balance: { type } },
      wallet: { keys, balance }
    } = this.props

    let amountsMap = this.state.amountsMap
    let totalAmount = Object.values(this.state.amountsMap).reduce((s, v) => s + v, 0)
    let transactionType = type === 'RECEIVED' ? 'Send' : 'Issue'
    let canSendAmount = (transactionType === 'Issue' || (totalAmount < balance))

    let remove = (address: string) => () => {
      let { [address]: _, ...amountsMap } = this.state.amountsMap
      this.setState({ amountsMap })
    }

    let recipientCount = Object.keys(amountsMap).length 
    let headers = { address: 'Add recipents to send a transaction',  }

    return (
      <Card style={{width: '100%', flex: 0 }}>
        <CardItem styleNames='header'>
          <Left>
            <H2 style={{ flexBasis: 200, paddingBottom: 0 }}>{transactionType} {name}</H2>
          </Left>
        </CardItem>
        <CardItem>
          <Body styleNames='row'>
            <Text style={{ flex: 2 }} styleNames='recipient column'>Recipient Addresses</Text>
            <Text style={{ flex: 1 }} styleNames='amount column'>Amounts</Text>
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
              componentProps={{
                disabled: (!isFilled(this.state)) || (!canSendAmount) || !Deck.isFull(this.props.asset.deck),
                stage: this.props.stage,
                DEFAULT: !canSendAmount ? 'Insufficient Funds!' : `${transactionType} Asset`,
              }}
            />
          </Body>
        </CardItem>
      </Card>
    )
  }
}


export default SendAsset
