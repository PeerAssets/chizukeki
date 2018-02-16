import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, Right, CardItem, Body, Text, H2, Icon } from 'native-base/src/index'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

import * as Papi from './papi'

namespace Deck {
  export type Data = Papi.Deck 
}

function Deck({ item: deck, ...props }: { item: Deck.Data } & any) {
  return (
    <Card {...props}>
      <CardItem styleNames='header'>
        <Body style={{justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'row'}}>
          <Text>{deck.name}</Text>
          <Button styleNames={`iconLeft transparent ${deck.subscribed ? 'success' : 'dark'}`}
              style={{ marginRight: -30, marginTop: -20 }}>
            <Icon styleNames={deck.subscribed ? 'active' : ''} name='eye' size={30} color='black' />
            <Text style={{ paddingLeft: 5, paddingRight: 0 }}>{deck.subscribed ? 'subscribed' : 'subscribe'} </Text>
          </Button>
        </Body>
      </CardItem>
      <CardItem styleNames='footer' style={{alignItems: 'flex-start', flexDirection: 'column', width: '100%'}}>
        <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
          id: {deck.id}
        </Text>
        <Text styleNames='note bounded' ellipsizeMode='middle' numberOfLines={1} >
          issuer: {deck.issuer}
        </Text>
        <Text styleNames='note'>mode: {deck.issueMode}</Text>
      </CardItem>
    </Card>
  )
}

namespace DeckList {
  export type Data = { decks: Array<Deck.Data> }
}

function DeckList({ decks }: DeckList.Data) {
  return (
    <View style={styles.container}>
      <Text>
        <H2>Decks</H2>
        <Text styleNames='note'> {decks.length} total </Text>
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
