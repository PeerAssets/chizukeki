import * as React from 'react'
import { View } from 'react-native'
import { Button, Right, CardItem, Body, Text, Card, connectStyle, H2, H3, Icon, Badge } from 'native-base/src/index'


import { Link } from '../routing/router'
import Wrapper from '../generics/Wrapper'
import SyncButton from '../generics/sync-button'
import Modal from '../generics/modal.web'
import Wallet from '../wallet/wallet'

import { Deck } from './papi'
import Send from './SendAsset'

namespace Summary {
  export type BalanceType = 'UNISSUED' | 'ISSUED' | 'RECIEVED'
  export type Balance = {
    type: BalanceType
    value?: number
    account?: string
    deck: Deck
    styleNames?: string
  }
  export type ActionableBalance = Balance & { deck: Deck.Full }
  export type Props = {
    balances: Array<Balance>
    style?: any,
    sync: SyncButton.Logic
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
  let divided: Record<Summary.BalanceType, Array<Summary.Balance>> = {
    UNISSUED: [],
    ISSUED: [],
    RECIEVED: [],
  }
  for (let balance of balances){
    divided[balance.type].push(balance)
  }
  return divided
}

function Balance({ type, value, deck: { id, name }, styleNames = '' }: Summary.Balance) {
  return (
    <Link to={`/assets/${id}`}>
      <CardItem styleNames={`balance ${type.toLowerCase()} ${styleNames}`}>
        <Text styleNames='name'>{name}</Text>
        <Text styleNames='value'>
          {value !== undefined ? Math.abs(value).toLocaleString('en') : '-'}
        </Text>
        <Text styleNames='type'>
          {type.toLowerCase()}
        </Text>
      </CardItem>
    </Link>
  )
}


class Summary extends React.Component<Summary.Props, {}> {
  render() {
    let { balances, sync } = this.props
    let { UNISSUED, ISSUED, RECIEVED } = divideByOwnership(balances)
    return (
      <View style={styles.main as any}>
        <Card styleNames='asset summary' style={{ width: '100%' }}>
          <CardItem styleNames='header'>
            <Body style={{justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'row'}}>
              <H2>Your Assets</H2>
              <Right>
                <SyncButton {...sync} whenMounted />
              </Right>
            </Body>
          </CardItem>
          {(UNISSUED.length || ISSUED.length) ? [
            <CardItem key='decks' styleNames='header'>
              <Text>Decks</Text>
            </CardItem>,
            ...UNISSUED.map((o, key) => <Balance key={key} {...o} />),
            ...ISSUED.map((o, key) => <Balance key={-key + 1} {...o} />)
          ] : null}
          {RECIEVED.length ? [
            <CardItem key='balances' styleNames='header'>
              <Text>Balances</Text>
            </CardItem>,
            ...RECIEVED.map((o, key) => <Balance key={key} {...o} />)
          ] : null}
        </Card>
        {this.props.children}
      </View>
    )
  }
}


export { Balance }

export default Summary