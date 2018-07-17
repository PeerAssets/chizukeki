import * as React from 'react'
import { View, Button, Card, Left, Right, CardItem, Body, Text, H2, Icon } from 'native-base'

import { Link } from '../routing/router'

import SyncButton from '../generics/sync-button'

import * as Papi from './papi'
import IssueModes from './issueModes'

import CardTransferList from './CardTransfer'

namespace AssetSummary {
  export type BalanceType = 'UNISSUED' | 'ISSUED' | 'RECEIVED'
  export interface Balance {
    type: BalanceType
    value?: number
    account?: string
    _raw?: any // store list of raw balances
  }
  export interface Asset {
    _canLoadMoreCards?: boolean,
    _pending?: boolean,
    balance: Balance,
    deck: Papi.Deck,
    cardTransfers: CardTransferList.Data
    pendingCardTransfers: CardTransferList.Pending
  }
  
  export type Props = {
    sync?: SyncButton.Logic
  } & ({
    asset: Asset
  } | {
    asset: { deck: Papi.Deck },
  })
}

interface BalanceProps extends AssetSummary.Asset {
  styleNames?: string,
  style?: any,
  children?: any,
  currentlyOnPage: boolean,
  pendingCardTransfers: CardTransferList.Pending,
}

function Pending({ style, pending, ...props }) {
  return pending ? (
    <Text style={{ fontSize: 12, opacity: 0.5, ...style }} {...props}> (pending)</Text>
  ) : null
}

function Balance({
  currentlyOnPage = false,
  _pending: deckSpawnPending,
  pendingCardTransfers,
  balance: { type: _type, value }, deck: { id, name },
  style, styleNames = '', children
}: BalanceProps) {
  let pending = pendingCardTransfers.reduce(
    (pending, t) => pending + t.amount, 0
  )
  let balance = pending ? (value || 0) + pending : value
  let type = _type === 'UNISSUED' && pending ? 'ISSUED' : _type 
  return (
    <CardItem style={style} styleNames={`balance ${type.toLowerCase()} ${styleNames}`}>
      <Link
          to={`/assets/${deckSpawnPending ? '' : id}`}
          {...currentlyOnPage ? { onPress: ()=>{} } : {}}
          style={{ width: '100%', display: 'flex', flexDirection: 'column' }} >
        <Text styleNames='name' style={{ width: '100%' }}>
          {name}
          <Pending pending={deckSpawnPending} style={{ position: 'absolute' }}/>
        </Text>
        <Body styleNames='issuance'>
          <Text styleNames='value'>
            {balance !== undefined ? Math.abs(balance).toLocaleString('en') : '-'}
          </Text>
          <Text styleNames='type'>
            {type === 'RECEIVED' ? 'balance' : type.toLowerCase()}
            <Pending pending={pending} style={{ position: 'absolute' }}/>
          </Text>
        </Body>
      </Link>
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
  let modes = IssueModes.decode(deck.issueMode)
  return (
    <Body styleNames='details' style={{ alignItems: 'flex-start', flexDirection: 'column', width: '100%' }}>
      <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
        id: {deck.id}
      </Text>
      <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
        issuer: {deck.issuer}
      </Text>
      <Text styleNames='note'>{
        Array.isArray(modes)
          ? 'modes: ' + modes.join(', ')
          : `mode: ${modes}`
      }</Text>
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
            <Balance {...asset} currentlyOnPage={Boolean(sync)}>
              {this.state.showDetails && <DeckDetails deck={deck}/> }
            </Balance>
          : null
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
