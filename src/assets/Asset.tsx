import * as React from 'react'
import { View } from 'react-native'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, H3, Icon, Badge } from 'native-base'

import { Wrapper, Main } from '../generics/Layout'
import SyncButton from '../generics/sync-button'
import Modal from '../generics/modal/modal'

import Summary from './AssetSummary'
import SendAsset from './SendAsset'

import { Deck } from './papi'

import CardTransferList from './CardTransfer'

let styles = {
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

@connectStyle('PeerKeeper.Asset', styles)
class Asset extends React.Component<Asset.Props, {}> {
  render() {
    let { asset, sync, wallet, actions, stages: { sendAssets, loadMoreCards } } = this.props
    return (
      <Wrapper>
        <Main>
          <Card styleNames='asset summary' style={{ width: '100%', padding: 10 }}>
            <Summary asset={asset} sync={sync} />
          </Card>
            {'balance' in asset &&
              <SendAsset key='send' {...{ asset, wallet, send: actions.send, stage: sendAssets }} />
            }
        </Main>
        { ('cardTransfers' in asset) &&
          <CardTransferList style={{ width: '100%' }}
            cardTransfers={asset.cardTransfers}
            canLoadMore={'_canLoadMoreCards' in asset ? Boolean(asset._canLoadMoreCards) : true}
            stage={loadMoreCards}
            loadMore={() => actions.loadMoreCards({
              address: wallet.address,
              deckId: asset.deck.id,
              currentlyLoaded: 'cardTransfers' in asset ? asset.cardTransfers.length : 0
            })}
          />
        }
      </Wrapper>
    )
  }
}

namespace Asset {
  export type Props = {
    asset: Summary.Asset | { deck: Deck }
    sync: SyncButton.Logic
    stages: Record<'sendAssets' | 'loadMoreCards', string | undefined>,
    actions: {
      send: SendAsset.Props['send']
      loadMoreCards: any
    }
    wallet: SendAsset.Props['wallet']
    style?: any
  }
}

export default Asset
