import * as React from 'react';
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
  Body,
  Input,
  Button,
  Item,
  Right,
  Icon,
  Label,
  variables
} from 'native-base/src/index'

import bitcore from '../lib/bitcore'
import Wrapper from '../generics/Wrapper'

import { WrapActionable } from '../wallet/UnlockModal'
import Wallet from '../wallet/wallet'

type Recipient = { address: string, amount: number }

namespace SendAsset {
  export type Data = {
    amountsMap: {
      [address: string]: number
    }
    //deckSpawn: any, // deck spawn transaction
  }
  export type Props = {
    stage?: string | undefined,
    send: (data: Data & { wallet: Wallet.Unlocked }) => void,
    wallet: Wallet.Data,
    asset: any, // will be Asset type
  }
}

function isFilled(s: SendAsset.Data): s is SendAsset.Data {
  return Boolean(Object.keys(s.amountsMap).length)
}

function Recipient({ address, amount }: Recipient) {
  return (
    <CardItem>
      <Text>${address}: ${amount}</Text>
    </CardItem>
  )
}

class AddRecipient extends React.Component<{ add: (r: Recipient) => any }, Recipient> {
  state = {
    address: '',
    amount: 0,
  }
  render() {
    let { address, amount } = this.state
    return (
      <CardItem>
        <Body style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap' }}>
          <Item styleNames='fixedLabel' style={{ marginLeft: 15, minWidth: 300 }}>
            <Label>To address</Label>
            <Input
              style={{ lineHeight: 14, textOverflow: 'ellipsis' }}
              value={address}
              onChangeText={address => this.setState({ address })} />
          </Item>
          <Item styleNames='fixedLabel' style={{ marginLeft: 15, minWidth: 300 }}>
            <Label>Asset</Label>
            <Input
              keyboardType='numeric'
              placeholder='0.00'
              style={{ lineHeight: 14, textOverflow: 'ellipsis' }}
              value={this.state.amount || undefined}
              onChangeText={amount => this.setState({ amount: Number(amount) || 0 })} />
          </Item>
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
    if(isFilled(this.state)){
      let wallet = Object.assign({ privateKey }, this.props.wallet)
      this.props.send({ wallet, ...this.state })
    }
  }
  render() {
    let { wallet: { keys, balance } } = this.props
    let amountsMap = this.state.amountsMap
    let totalAmount = Object.values(this.state.amountsMap).reduce((s, v) => s + v, 0)
    let SendButton = (props: { onPress: () => any }) =>
      <RoutineButton styleNames='block'
        disabled={(!isFilled(this.state)) || (totalAmount > balance)}
        icons={{ DEFAULT: 'send' }}
        stage={this.props.stage}
        DEFAULT={totalAmount > balance ? 'Insufficient Funds!' : 'Send Transaction'}
        STARTED='Sending'
        DONE='Sent!'
        FAILED='Invalid Transaction'
        {...props} />


    return (
      <Card>
        <CardItem styleNames='header'>
          <Body style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <H2 style={{ flexBasis: 200, paddingBottom: 15 }}>Send a Transaction</H2>
          </Body>
        </CardItem>
        {Object.entries(amountsMap).map(([ address, amount ]) => <Recipient {...{ address, amount }} />)}
        <AddRecipient add={({ address, amount }: Recipient) =>
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
