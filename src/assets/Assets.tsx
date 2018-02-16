import * as React from 'react'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base/src/index'

import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import Modal from '../generics/modal.web'
import Wallet from '../wallet/Wallet'

import Summary from './Summary'
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


function Routes({ decks, balances }: Assets.Props,){
  return  [
  ]
}

@connectStyle('PeerKeeper.Assets', styles)
class Assets extends React.Component<Assets.Props, {}> {
  componentWillReceiveProps(nextProps: Assets.Props){
    let { actions, decks, balances, wallet } = this.props
    if((!decks) && wallet){
      actions.syncDecks({ address: wallet.address })
    }
    if(decks && (!balances)){
      actions.syncBalances({ address: wallet.address, decks })
    }
  }
  render() {
    let { decks, balances } = this.props
    return (
      <Wrapper>
        <Summary balances={balances || []} />
        <DeckList decks={decks || []} />
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
    actions: {
      // TODO strange type errors when properly typed
      syncDecks: any
      syncBalances: any
    }
    style?: any
  }
}

export default Assets
