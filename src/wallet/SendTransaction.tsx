import * as React from 'react';
import { Dimensions, View, TouchableOpacity, ActivityIndicator, StyleProp } from 'react-native';
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
} from 'native-base'
import Field from '../generics/Field'

import bitcore from '../lib/bitcore'
import { Wrapper } from '../generics/Layout'

import { WrapActionable } from './UnlockModal'
import Wallet from './Wallet';

namespace SendTransaction {
  export type Data = {
    toAddress: string,
    amount: number,
  }
  export type Props = {
    stage?: string | undefined,
    style?: StyleProp<any>,
    send: (data: Data & { wallet: Wallet.Unlocked }) => void,
    wallet: Wallet.Data,
  }
}

type State = Partial<SendTransaction.Data>

function isFilled(s: SendTransaction.Data | State): s is SendTransaction.Data {
  return Boolean(s.toAddress && s.amount)
}

function SendButton(props: { onPress: () => any, disabled: boolean, DEFAULT: string, stage: string | undefined }) {
  return <RoutineButton styleNames='block'
    icons={{ DEFAULT: 'send' }}
    STARTED='Sending'
    DONE='Sent!'
    FAILED='Invalid Transaction'
    {...props} />
}

class SendTransaction extends React.Component<SendTransaction.Props, State> {
  state = {
    toAddress: '',
    amount: undefined,
  }
  send = (privateKey: string) => {
    if (isFilled(this.state)) {
      let wallet = Object.assign({ privateKey }, this.props.wallet)
      this.props.send({ wallet, ...this.state })
    }
  }
  render() {
    let { wallet: { keys, balance } } = this.props

    return (
      <Card style={this.props.style}>
        <CardItem styleNames='header'>
          <Body style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <H2 style={{ flexBasis: 200, paddingBottom: 15 }}>Send a Transaction</H2>
          </Body>
        </CardItem>
        <CardItem>
          <Body style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap' }}>
            <Field styleNames='fixedLabel' style={{ marginLeft: 15, minWidth: 300 }}>
              {ref => [
                <Label key={0}>To address</Label>,
                <Input
                  key={1}
                  ref={ref}
                  style={{ lineHeight: 14 }}
                  value={this.state.toAddress}
                  onChangeText={toAddress => this.setState({ toAddress })} />
              ]}
            </Field>
            <Field styleNames='fixedLabel' style={{ marginLeft: 15, minWidth: 300 }}>
              {ref => [
                <Label key={0}>PPC</Label>,
                <Input
                  key={1}
                  ref={ref}
                  keyboardType='numeric'
                  placeholder='0.00'
                  style={{ lineHeight: 14 }}
                  value={this.state.amount}
                  onChangeText={amount => this.setState({ amount: Number(amount) || undefined })} />
              ]}
            </Field>
          </Body>
        </CardItem>
        <CardItem styleNames='footer'>
          <Body>
            <WrapActionable.IfLocked
              keys={keys}
              actionProp='onPress'
              action={this.send}
              Component={SendButton}
              componentProps={{
                disabled: false, //(!isFilled(this.state)) || (this.state.amount > balance),
                stage: this.props.stage,
                DEFAULT: (this.state.amount || -1) > balance ? 'Insufficient Funds!' : 'Send Transaction'
              }}
            />
          </Body>
        </CardItem>
      </Card>
    )
  }
}


export default SendTransaction
