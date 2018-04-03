import * as React from 'react'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base'

import { Wrapper, Main } from '../generics/Layout'
import RoutineButton from '../generics/routine-button'
import { Omit } from '../generics/utils'
import Modal from '../generics/modal.web'
import Wallet from '../wallet/Wallet'

import Summary from './Summary'
import SpawnDeck from './SpawnDeck'
import CardTransferList, { CardTransfer } from './CardTransfer'

function byTimestampDesc(a: CardTransfer.Data, b: CardTransfer.Data){
  return new Date(b.transaction.timestamp).getTime() - new Date(a.transaction.timestamp).getTime()
}

function mergeCardTransfers(assets: Summary.Props['assets']){
  return assets.reduce(
    (transfers, a) => transfers.concat(a.cardTransfers),
    [] as CardTransfer.Data[]
  ).sort(byTimestampDesc)
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
    return (
      <Wrapper>
        <Summary sync={syncAssets} assets={assets || []}>
          <SpawnDeck style={{ width: '100%' }} wallet={wallet} spawn={actions.spawnDeck} stage={stages.spawnDeck} />
        </Summary>
        <CardTransferList cardTransfers={mergeCardTransfers(assets || [])} />
      </Wrapper>
    )
  }
}

namespace Assets {
  export type Data = {
    assets: Summary.Props['assets'] | null
  }
  export type Props = Data & {
    wallet: Wallet.Data
    stages: any
    actions: {
      // TODO strange type errors when properly typed
      syncDecks: any //Omit<DeckList.Props['sync'], 'stage'>
      syncAssets: any //Omit<Summary.Props['sync'], 'stage'>
      spawnDeck: any
    }
    style?: any
  }
}

export default Assets
