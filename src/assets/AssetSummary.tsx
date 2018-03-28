import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, Right, CardItem, Body, Text, H2, Icon } from 'native-base'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

import { Link } from '../routing/router'

import SyncButton from '../generics/sync-button'

import * as Papi from './papi'
import IssueModes from './issueModes'

import CardTransferList from './CardTransfer'

namespace AssetSummary {
  export type BalanceType = 'UNISSUED' | 'ISSUED' | 'RECEIVED'
  export type Balance = {
    type: BalanceType
    value?: number
    account?: string
    _raw?: any // store list of raw balances
  }
  export type Asset = {
    balance: Balance,
    deck: Papi.Deck,
    cardTransfers: CardTransferList.Data
  }
  export type Props = {
    sync?: SyncButton.Logic
  } & ({
    asset: Asset
  } | {
    asset: { deck: Papi.Deck },
  })
}


function Balance({
  balance: { type, value }, deck: { id, name }, style, styleNames = ''
}: AssetSummary.Asset & { styleNames?: string, style?: any }) {
  return (
    <CardItem style={style} styleNames={`balance ${type.toLowerCase()} ${styleNames}`}>
      <Text styleNames='name'>{name}</Text>
      <Text styleNames='value'>
        {value !== undefined ? Math.abs(value).toLocaleString('en') : '-'}
      </Text>
      <Text styleNames='type'>
        {type.toLowerCase()}
      </Text>
    </CardItem>
  )
}

let styles = {
  card: {
    width: '100%',
    padding: 0,
    paddingTop: 5,
    display: 'flex' as 'flex',
    flexDirection: 'row' as 'row',
    flexWrap: 'wrap' as 'wrap',
    justifyContent: 'space-between' as 'space-between'
  },
}


// todo entangled with Asset
function FocusedHead({ asset, sync }: AssetSummary.Props){
  return sync ? (
    <CardItem styleNames='header' style={{ width: '100%' }}>
      <Body style={{ justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'row' }}>
        <H2>{asset.deck.name}</H2>
        <Right>
          {sync ? <SyncButton whenMounted {...sync} /> : null}
        </Right>
      </Body>
    </CardItem>
  ) : null 
}

function DeckDetails({ deck }: { deck: Papi.Deck }){
  return (
    <CardItem styleNames='footer' style={{ alignItems: 'flex-start', flexDirection: 'column', width: '100%' }}>
      <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
        id: {deck.id}
      </Text>
      <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
        issuer: {deck.issuer}
      </Text>
      <Text styleNames='note'>mode: {IssueModes.decode(deck.issueMode)}</Text>
    </CardItem>
  )
}


class AssetSummary extends React.Component<
  AssetSummary.Props,
  { showDetails: boolean }
> {
  toggleDetails = () => this.setState({ showDetails: !this.state.showDetails })
  constructor(props){
    super(props)
    this.state = { showDetails: Boolean(props.sync) }
  }
  render(){
    let { asset, sync, ...props } = this.props
    let deck = asset.deck
    return (
      <Body style={styles.card} {...props}>
        <FocusedHead asset={asset} sync={sync}/>
        { ('balance' in asset) ?
          <Link to={`/assets/${deck.id}`} style={{ flex: 8 }} >
            <Balance {...asset} />
          </Link> : null
        }
        { !sync ? (
          <Button styleNames='transparent small dark' style={{ flex: 1 }}
            onPress={this.toggleDetails} >
            <Icon name={this.state.showDetails ? 'minus' : 'plus'} />
          </Button>
        ) : null}
        {this.state.showDetails && <DeckDetails deck={deck}/> }
      </Body>
    )
  }
}


export default AssetSummary
