import * as React from 'react'
import { Dimensions, View, ViewStyle, Clipboard } from 'react-native'
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

@connectStyle('PeerKeeper.Assets', styles)
class Assets extends React.Component<Assets.Props, {}> {
  componentDidMount(){
    let { actions, decks, wallet } = this.props
    if((!decks.length) && wallet){
      actions.syncDecks({ address: wallet.address })
    }
  }
  render() {
    let { decks, balances } = this.props
    return (
      <Wrapper>
        <Summary balances={balances} />
        <DeckList decks={decks} />
      </Wrapper>
    )
  }
}

namespace Assets {
  export type Data = DeckList.Data & Summary.Props & {
    wallet: Wallet.Data
  }
  export type Props = Data & {
    actions: {
      syncDecks: any // TODO strange type errors when properly typed
    }
    style?: any
  }
}

export default Assets
