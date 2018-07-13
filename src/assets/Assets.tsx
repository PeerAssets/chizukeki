import * as React from 'react'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base'

import { Wrapper, Main } from '../generics/Layout'
import RoutineButton from '../generics/routine-button'
import { Omit } from '../generics/utils'
import Modal from '../generics/modal/modal'
import Wallet from '../wallet/Wallet'

import Summary from './Summary'
import SpawnDeck from './SpawnDeck'
import CardTransferList, { CardTransfer } from './CardTransfer'

function mergePendingCardTransfers(assets: Summary.Props['assets']){
  return assets.reduce(
    (transfers, a) => transfers.concat(a.pendingCardTransfers),
    [] as CardTransfer.Pending[]
  )
}

function mergeCardTransfers(assets: Summary.Props['assets']){
  return assets.reduce(
    (transfers, a) => transfers.concat(a.cardTransfers),
    mergePendingCardTransfers(assets) as Array<
      CardTransfer.Pending | CardTransfer.Data
    >
  )
}

@connectStyle('PeerKeeper.Assets', {})
class Assets extends React.Component<Assets.Props, {}> {
  render() {
    let { assets, wallet, actions, stages } = this.props
    let syncAssets = {
      stage: stages.syncAssets,
      trigger: () => actions.syncAssets.trigger({ address: wallet.address }),
      stop: actions.syncAssets.stop
    }
    let cardTransfers = mergeCardTransfers(assets || [])
    let loadMoreCards = {
      canLoadMore: (assets || []).reduce(
        (b, { _canLoadMoreCards = true }) => b || _canLoadMoreCards, false),
      stage: stages.loadMoreCards,
      loadMore: () => actions.loadMoreCards({
        address: wallet.address,
        currentlyLoaded: cardTransfers.length
      })
    }
    return (
      <Wrapper>
        <Summary sync={syncAssets} assets={assets || []}>
          <SpawnDeck style={{ width: '100%', flex: 0 }} wallet={wallet} spawn={actions.spawnDeck} stage={stages.spawnDeck} />
        </Summary>
        <CardTransferList cardTransfers={cardTransfers} {...loadMoreCards} />
      </Wrapper>
    )
  }
}

namespace Assets {
  interface AssetData {
    assets: Summary.Props['assets'] | null
  }
  export type Data = AssetData

  interface AssetProps extends Data {
    wallet: Wallet.Data
    stages: any
    actions: {
      // TODO strange type errors when properly typed
      syncDecks: any //Omit<DeckList.Props['sync'], 'stage'>
      syncAssets: any //Omit<Summary.Props['sync'], 'stage'>
      spawnDeck: any
      loadMoreCards: any
    }
    style?: any
  }
  export type Props = AssetProps
}

export default Assets
