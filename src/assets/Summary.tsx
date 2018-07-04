import * as React from 'react'
import { View } from 'react-native'
import { Button, Right, CardItem, Body, Text, Card, connectStyle, H2, H3, Icon, Badge } from 'native-base'


import { Link } from '../routing/router'
import { Wrapper, Main } from '../generics/Layout'
import SyncButton from '../generics/sync-button'
import Modal from '../generics/modal/modal'
import Wallet from '../wallet/Wallet'

import { Deck } from './papi'
import Send from './SendAsset'

import CardTransferList from './CardTransfer'

import AssetSummary from './AssetSummary'

namespace Summary {
  export type Asset = AssetSummary.Asset
  export type Props = {
    assets: Array<Asset>
    style?: any,
    sync: SyncButton.Logic
  }
}


function divideByOwnership(assets: Array<Summary.Asset>) {
  let divided: Record<Summary.Asset['balance']['type'], Array<Summary.Asset>> = {
    UNISSUED: [],
    ISSUED: [],
    RECEIVED: [],
  }
  for (let asset of assets) {
    divided[asset.balance.type].push(asset)
  }
  return divided
}

function pad(padding: number) {
  return {
    paddingTop: padding,
    paddingLeft: padding,
    paddingRight: padding,
    paddingBottom: padding,
  }
}

class Summary extends React.Component<Summary.Props, {}> {
  render() {
    let { assets, sync } = this.props
    let { UNISSUED, ISSUED, RECEIVED } = divideByOwnership(assets)
    return (
      <Main>
        <View style={{ width: '100%', padding: 10, display: 'flex', flexDirection: 'row' }}>
          <Text>
            <H2>Your Assets</H2>
            <Text styleNames='note'> {assets.length} total </Text>
          </Text>
          <Right>
            <SyncButton {...sync} />
          </Right>
        </View>
        {(UNISSUED.length || ISSUED.length) ? (
          <Card styleNames='asset summary' style={{ width: '100%', padding: 10 }}>
            <CardItem styleNames='header' style={pad(10)}>
              <H3>Your Decks</H3>
            </CardItem>
            {...UNISSUED.map(o => <AssetSummary key={o.deck.id} asset={o} />)}
            {...ISSUED.map(o => <AssetSummary key={o.deck.id} asset={o} />)}
          </Card>
        ) : null}
        {RECEIVED.length ? (
          <Card styleNames='asset summary' style={{ width: '100%', padding: 10 }}>
            <CardItem styleNames='header' style={pad(10)}>
              <H3>Your Balances</H3>
            </CardItem>
            {...RECEIVED.map(o => <AssetSummary key={o.deck.id} asset={o} />)}
          </Card>
        ) : null}
        {this.props.children}
      </Main>
    )
  }
}

export default Summary
