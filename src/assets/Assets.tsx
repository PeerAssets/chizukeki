import * as React from 'react'
import { Dimensions, View, ViewStyle, Clipboard } from 'react-native'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base/src/index'

import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import Modal from '../generics/modal.web'

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
class Assets extends React.Component<
  Assets.Data & {
    style?: any,
  }
> {
  render() {
    return (
      <Wrapper>
        <DeckList decks={this.props.decks} />
      </Wrapper>
    )
  }
}

namespace Assets {
  export type Data = DeckList.Data
}

export default Assets
