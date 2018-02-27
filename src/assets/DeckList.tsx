import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, Right, CardItem, Body, Text, H2, Icon } from 'native-base/src/index'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

import SyncButton from '../generics/sync-button'

import * as Papi from './papi'
import IssueModes from './issueModes'

namespace Deck {
  export type Data = Papi.Deck 
}

function Deck({ item: deck, sync,...props }: { item: Deck.Data, sync?: SyncButton.Logic } & any) {
  return (
    <Card {...props}>
      <CardItem styleNames='header'>
        <Body style={{justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'row'}}>
          <Text>{deck.name}</Text>
        </Body>
        {sync ? <SyncButton {...sync}/> : null}
      </CardItem>
      <CardItem styleNames='footer' style={{alignItems: 'flex-start', flexDirection: 'column', width: '100%'}}>
        <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
          id: {deck.id}
        </Text>
        <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
          issuer: {deck.issuer}
        </Text>
        <Text styleNames='note'>mode: {IssueModes.decode(deck.issueMode)}</Text>
      </CardItem>
    </Card>
  )
}

namespace DeckList {
  export type Data = { decks: Array<Deck.Data> }
  export type Props = Data & {
    sync: SyncButton.Logic
  }
}

function DeckList({ decks, sync }: DeckList.Props) {
  return (
    <View style={styles.container}>
      <Text>
        <H2>All Assets</H2>
        <Text styleNames='note'> {decks.length} total </Text>
        <SyncButton {...sync} styleNames='small'/>
      </Text>
      <FlatList
        enableEmptySections // silence error, shouldn't be necessary when react-native-web implements FlatList
        data={decks}
        renderItem={Deck} />
    </View>
  )
}

let styles = {
  container: {
    flex: 2,
    minWidth: 200,
    margin: 7.5,
  },
  main: {
    paddingLeft: 10,
    flex: 9,
  }
}

export { Deck }

export default DeckList
