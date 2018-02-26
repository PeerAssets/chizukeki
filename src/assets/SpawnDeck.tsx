import * as React from 'react';
import { Dimensions, View, TouchableOpacity, ActivityIndicator, StyleProp } from 'react-native';
import RoutineButton from '../generics/routine-button'
import {
  Form,
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
import Wallet from '../wallet/Wallet'

import IssueMode from './IssueMode'

type Fillable<T> = {
  [k in keyof T]: null | T[k]
}
namespace Fillable {
  export function isFilled<T>(fillable: T | Fillable<T>): fillable is T {
    for (let v of Object.values(fillable)){
      if(v === null){
        return false
      }
    }
    return true
  }
}

namespace SpawnDeck {
  export type Data = {
    name: string,
    precision: number,
    issueMode: IssueMode.Data
  }
  export type Props = {
    stage?: string | undefined,
    style?: StyleProp<any>,
    spawn: (data: Data & { wallet: Wallet.Unlocked }) => void,
    wallet: Wallet.Data,
  }
  export type Payload = Data & {
    wallet: Wallet.Unlocked
  }
}

type State = SpawnDeck.Data | Fillable<SpawnDeck.Data>

function isFilled(state: State): state is SpawnDeck.Data {
  return Fillable.isFilled<SpawnDeck.Data>(state)
}

class SpawnDeck extends React.Component<SpawnDeck.Props, State> {
  state = {
    name: '',
    issueMode: null,
    precision: null,
  }
  spawn = (privateKey: string) => {
    if(isFilled(this.state)){
      let wallet = Object.assign({ privateKey }, this.props.wallet)
      this.props.spawn({ wallet, ...this.state })
    }
  }
  render() {
    let { wallet: { keys, balance } } = this.props
    let SpawnButton = (props: { onPress: () => any }) =>
      <RoutineButton styleNames='block'
        disabled={(!isFilled(this.state))}
        icons={{ DEFAULT: 'send' }}
        stage={this.props.stage}
        DEFAULT='Spawn Deck'
        STARTED='Spawning'
        DONE='Spawned!'
        FAILED='Invalid Deck'
        {...props} />

    return (
      <Card style={this.props.style}>
        <CardItem styleNames='header'>
          <Body style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <H2 style={{ flexBasis: 200, paddingBottom: 15 }}>Spawn a new Deck</H2>
          </Body>
        </CardItem>
        <CardItem>
          <Body style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap' }}>
          <Form>
            <Item styleNames='fixedLabel' style={{ marginLeft: 15, minWidth: 300 }}>
              <Label>Name</Label>
              <Input
                style={{ lineHeight: 14, textOverflow: 'ellipsis' }}
                value={this.state.name}
                onChangeText={name => this.setState({ name })} />
            </Item>
            <Item styleNames='fixedLabel' style={{ marginLeft: 15, minWidth: 300 }}>
              <Label>Decimal Precision</Label>
              <Input
                keyboardType='numeric'
                placeholder='0'
                style={{ lineHeight: 14, textOverflow: 'ellipsis' }}
                value={this.state.precision}
                onChangeText={precision => {
                  precision = Number(precision)
                  this.setState({ precision: Number.isFinite(precision) ? precision : null })
                }} />
            </Item>
            <Item styleNames='fixedLabel' style={{ marginLeft: 15, minWidth: 300, minHeight: 50  }}>
              <Label>Issue Mode</Label>
              <IssueMode selected={this.state.issueMode}
                select={(issueMode: IssueMode.Data) => this.setState({ issueMode }) } />
            </Item>
          </Form>
          </Body>
        </CardItem>
        <CardItem styleNames='footer'>
          <Body>
            <WrapActionable.IfLocked
              keys={keys}
              actionProp='onPress'
              action={this.spawn}
              Component={SpawnButton}
            />
          </Body>
        </CardItem>
      </Card>
    )
  }
}


export default SpawnDeck

