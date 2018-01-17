import * as React from 'react';
import { Dimensions, View, TouchableOpacity, ActivityIndicator, StyleProp } from 'react-native';
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
import Wrapper from './Wrapper'

namespace SendTransaction {
  export type Data = {
    toAddress: string,
    amount: number,
  }
}

type State = Partial<SendTransaction.Data>

function isFilled(s: SendTransaction.Data | State): s is SendTransaction.Data {
  return Boolean(s.toAddress && s.amount)
}


// TODO implicit coupling to routine
let buttonText = {
  STARTED: 'sending',
  DONE: 'Successfully synced!',
  FAILED: 'Invalid Transaction'
}
function RoutineButton({ stage, onPress, ...props }){
  let stageBased = stage === 'DONE'
    ? { success: true }
    : stage === 'FAILED'
    ? { danger: true }
    : { info: true, onPress }
  return (
    <Button {...stageBased } {...props}>
      <ActivityIndicator animating={stage === 'STARTED' }/>
      <Text>{buttonText[stage] || 'Send'}</Text>
    </Button>
  )
}

class SendTransaction extends React.Component<
  { 
    syncStage?: string | undefined,
    style: StyleProp<any>,
    send: (data: SendTransaction.Data) => void
  },
  State
  > {
  state = {
    toAddress: '',
    amount: undefined,
  }
  render() {
    return (
      <Card style={this.props.style}>
        <CardItem header>
          <Body style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <H2 style={{ flexBasis: 200, paddingBottom: 15 }}>Send a Transaction</H2>
          </Body>
        </CardItem>
        <CardItem>
          <Body style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap' }}>
            <Item fixedLabel style={{ marginLeft: 15, minWidth: 300 }}>
              <Label>To address</Label>
              <Input
                style={{ lineHeight: 14, textOverflow: 'ellipsis' }}
                value={this.state.toAddress}
                onChangeText={toAddress => this.setState({ toAddress })} />
            </Item>
            <Item fixedLabel style={{ marginLeft: 15, minWidth: 300 }}>
              <Label>PPC</Label>
              <Input
                keyboardType='numeric'
                placeholder='0.00'
                style={{ lineHeight: 14, textOverflow: 'ellipsis' }}
                value={this.state.amount}
                onChangeText={amount => this.setState({ amount: Number(amount) || undefined })} />
            </Item>
          </Body>
        </CardItem>
        <CardItem footer>
          <Body>
            <RoutineButton stage={this.props.syncStage} block disabled={!isFilled(this.state)}
              onPress={() => isFilled(this.state) ? this.props.send(this.state) : null} />
          </Body>
        </CardItem>
      </Card>
    )
  }
}


export default SendTransaction
