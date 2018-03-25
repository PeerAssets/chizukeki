import * as React from 'react'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base'

import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import { Omit } from '../generics/utils'
import Modal from '../generics/modal.web'
import Wallet from '../wallet/Wallet'

import Summary from './Summary'
import SpawnDeck from './SpawnDeck'
import DeckList from './DeckList'


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
}

@connectStyle('PeerKeeper.Assets', styles)
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
          <SpawnDeck wallet={wallet} spawn={actions.spawnDeck} stage={stages.spawnDeck} />
        </Summary>
        <DeckList decks={(assets || []).map(a => a.deck)} />
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
