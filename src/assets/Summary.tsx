import * as React from 'react'
import { View } from 'react-native'
import { Button, Right, CardItem, Body, Text, Card, connectStyle, H2, H3, Icon, Badge } from 'native-base'


import { Link } from '../routing/router'
import Wrapper from '../generics/Wrapper'
import SyncButton from '../generics/sync-button'
import Modal from '../generics/modal.web'
import Wallet from '../wallet/Wallet'

import { Deck } from './papi'
import Send from './SendAsset'

namespace Summary {
  export type BalanceType = 'UNISSUED' | 'ISSUED' | 'RECEIVED'
  export type Balance = {
    type: BalanceType
    value?: number
    account?: string
    _raw?: any // store list of raw balances
  }
  export type Asset = {
    balance: Balance,
    deck: Deck
  }
  export type ActionableBalance = Balance & { deck: Deck.Full }
  export type Props = {
    assets: Array<Asset>
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


function divideByOwnership(assets: Array<Summary.Asset>){
  let divided: Record<Summary.BalanceType, Array<Summary.Asset>> = {
    UNISSUED: [],
    ISSUED: [],
    RECEIVED: [],
  }
  for (let asset of assets){
    divided[asset.balance.type].push(asset)
  }
  return divided
}

function Balance({ balance: { type, value }, deck: { id, name }, styleNames = '' }: Summary.Asset & { styleNames?: string }) {
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
    let { assets, sync } = this.props
    let { UNISSUED, ISSUED, RECEIVED } = divideByOwnership(assets)
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
            ...UNISSUED.map(o => <Balance key={o.deck.id} {...o} />),
            ...ISSUED.map(o => <Balance key={o.deck.id} {...o} />)
          ] : null}
          {RECEIVED.length ? [
            <CardItem key='balances' styleNames='header'>
              <Text>Balances</Text>
            </CardItem>,
            ...RECEIVED.map(o => <Balance key={o.deck.id} {...o} />)
          ] : null}
        </Card>
        {this.props.children}
      </View>
    )
  }
}


export { Balance }

export default Summary
