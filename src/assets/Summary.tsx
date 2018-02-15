import * as React from 'react'
import { View } from 'react-native'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, H3, Icon, Badge } from 'native-base/src/index'

import Send from './SendAsset'
import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import Modal from '../generics/modal.web'

import Wallet from '../wallet/wallet'

import { Deck } from './papi'

namespace Summary {
  export type Balance = {
    value: number,
    deck: Deck,
    account: string
  }
  export type Props = {
    balances: Array<Balance>
    style?: any,
  }
}

let styles = {
  main: {
    flex: 3,
    minWidth: 325,
    marginTop: -5,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: 'hidden',
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 7.5,
    flex: 1,
  }
}


function divideByOwnership(balances: Array<Summary.Balance>){
  let divided: Record<'owned' | 'recieved', Array<Summary.Balance>> = {
    owned: [],
    recieved: [],
  }
  for (let balance of balances){
    if(balance.value >= 0){
      divided.recieved.push(balance)
    } else {
      divided.owned.push(balance)
    }
  }
  return divided
}

function Balance({ value, deck: { name }, ...props }: Summary.Balance) {
  let io = (inbound, outbound) => value >= 0 ? inbound : outbound
  return (
    <CardItem styleName={`asset ${io('recieved', 'issued')}`}>
      <Text styleName='name'>{name}</Text>
      <Text styleName='balance'>{Math.abs(value).toLocaleString('en')}</Text>
      {io(false, <Badge><Text>Your Issuance</Text></Badge>)}
    </CardItem>
  )
}


@connectStyle('PeerKeeper.assets.Summary', styles)
class Summary extends React.Component<Summary.Props, {}> {
  render() {
    let { owned, recieved } = divideByOwnership(this.props.balances)
    return (
      <View style={this.props.style.main}>
        <Card style={{ width: '100%' }}>
          <CardItem styleNames='header'>
            <H2>Assets</H2>
          </CardItem>
          {owned.map((o, key) => <Balance key={key} {...o} />)}
          {recieved.map((o, key) => <Balance key={key} {...o} />)}
        </Card>
      </View>
    )
  }
}


export default Summary