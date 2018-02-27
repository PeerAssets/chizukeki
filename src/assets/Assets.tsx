import * as React from 'react'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base/src/index'

import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import { Omit } from '../generics/utils'
import Modal from '../generics/modal.web'
import Wallet from '../wallet/Wallet'

import Summary from './Summary'
import DeckList from './DeckList'
import SpawnDeck from './SpawnDeck'


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
    let { decks, balances, wallet, actions, stages } = this.props
    return (
      <Wrapper>
        <Summary sync={{ stage: stages.syncBalances, ...actions.syncBalances }} balances={balances || []}>
          <SpawnDeck wallet={wallet} spawn={actions.spawnDeck} />
        </Summary>
        <DeckList sync={{ stage: stages.syncDecks, ...actions.syncDecks }} decks={decks || []} />
      </Wrapper>
    )
  }
}

namespace Assets {
  export type Data = {
    decks: DeckList.Data['decks'] | null
    balances: Summary.Props['balances'] | null
  }
  export type Props = Data & {
    wallet: Wallet.Data
    stages: any
    actions: {
      // TODO strange type errors when properly typed
      syncDecks: any //Omit<DeckList.Props['sync'], 'stage'>
      syncBalances: any //Omit<Summary.Props['sync'], 'stage'>
      spawnDeck: any
    }
    style?: any
  }
}

export default Assets
