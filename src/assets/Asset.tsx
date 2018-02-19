import * as React from 'react'
import { View } from 'react-native'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, H3, Icon, Badge } from 'native-base/src/index'

import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import Modal from '../generics/modal.web'

import Summary, { Balance } from './Summary'
import SendAsset from './SendAsset'

import { Deck as DeckCard } from './DeckList'
import { Deck } from './papi'

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

function isBalance(asset: Summary.Balance | { deck: Deck }): asset is Summary.Balance {
  return asset.hasOwnProperty('type')
}


@connectStyle('PeerKeeper.Asset', styles)
class Asset extends React.Component<Asset.Props, {}> {
  render() {
    let { asset, wallet, actions: { send } } = this.props
    return (
      <Wrapper>
        <View style={this.props.style.main}>
          { isBalance(asset) && [
            <Card styleNames='asset' style={{ width: '100%' }}>
              <Balance styleNames='focused header' {...asset} />
            </Card>,
            <SendAsset {...{ asset, wallet, send }} />
          ]}
          <DeckCard style={{ width: '100%' }} item={asset.deck} />
        </View>
      </Wrapper>
    )
  }
}

namespace Asset {
  export type Props = {
    asset: Summary.Balance | { deck: Deck }
    actions: {
      send: SendAsset.Props['send']
    }
    wallet: SendAsset.Props['wallet']
    style?: any
  }
}

export default Asset
