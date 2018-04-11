import * as React from 'react'
import { View, Button, Card, Left, Right, CardItem, Body, Text, H2, Icon } from 'native-base'

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
    _canLoadMoreCards?: boolean,
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
  balance: { type, value }, deck: { id, name },
  style, styleNames = '', children
}: AssetSummary.Asset & { styleNames?: string, style?: any, children?: any }) {
  return (
    <CardItem style={style} styleNames={`balance ${type.toLowerCase()} ${styleNames}`}>
      <Text styleNames='name'>{name}</Text>
      <Body styleNames='issuance'>
        <Text styleNames='value'>
          {value !== undefined ? Math.abs(value).toLocaleString('en') : '-'}
        </Text>
        <Text styleNames='type'>
          {type === 'RECEIVED' ? 'balance' : type.toLowerCase()}
        </Text>
      </Body>
      { children }
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
    justifyContent: 'flex-start' as 'flex-start',
    alignItems: 'flex-start' as 'flex-start',
  },
}


// todo entangled with Asset
function FocusedHead({ asset, sync }: AssetSummary.Props){
  let headStyle = {
    width: '100%',
    display: 'flex',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    flex: 0,
    justifyContent: 'space-between'
  }
  return sync ? (
    <CardItem styleNames='header' style={headStyle as any}>
      <H2>{asset.deck.name}</H2>
      {sync ? <SyncButton whenMounted {...sync} /> : null}
    </CardItem>
  ) : null 
}

function DeckDetails({ deck }: { deck: Papi.Deck }){
  return (
    <Body styleNames='details' style={{ alignItems: 'flex-start', flexDirection: 'column', width: '100%' }}>
      <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
        id: {deck.id}
      </Text>
      <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
        issuer: {deck.issuer}
      </Text>
      <Text styleNames='note'>mode: {IssueModes.decode(deck.issueMode)}</Text>
    </Body>
  )
}

let actionStyle = {
  position: 'absolute',
  right: 0,
  top: 3,
  height: 40,
  zIndex: 2
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
          <Link to={`/assets/${deck.id}`} style={{ flex: 1, maxWidth: '100%' }} {...sync ? { onPress: ()=>{} } : {}}>
            <Balance {...asset}>
              {this.state.showDetails && <DeckDetails deck={deck}/> }
            </Balance>
          </Link> : null
        }
        { !sync ? (
          <Button styleNames='transparent small dark' style={actionStyle as any}
            onPress={this.toggleDetails} >
            <Icon name={this.state.showDetails ? 'minus' : 'plus'} />
          </Button>
        ) : null}
      </Body>
    )
  }
}


export default AssetSummary
