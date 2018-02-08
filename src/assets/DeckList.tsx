import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, Right, CardItem, Body, Text, H2, Icon } from 'native-base/src/index'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

namespace Deck {
  export type Data = {
    id: string
    name: string
    issuer: string
    issueMode: string
    precision: number
    subscribed: boolean
  }
}

let dummyDecks = [{
  name: 'Some Stupid Deck',
  id: 'aaabbbcccdddeeeFFFXXXDDD',
  issuer: 'Benjahman Frankfurt',
  issueMode: 'BIG',
  precision: 2,
  subscribed: false,
}, {
  name: 'Money 2.0',
  id: 'bbbaaadddcccFFFeeeDDDXXX',
  issuer: 'Benfurt Frankjahman',
  issueMode: 'smol',
  precision: 0,
  subscribed: true,
}]

function Deck({ item: deck }: { item: Deck.Data }) {
  return (
    <Card>
      <CardItem header>
        <Body style={{justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'row'}}>
          <Text>{deck.name}</Text>
          <View>
            <Text note style={{alignSelf: 'flex-end'}}>{deck.issuer}</Text>
            <Text note style={{alignSelf: 'flex-end'}}>mode: {deck.issueMode}</Text>
          </View>
        </Body>
      </CardItem>
      <CardItem footer style={{justifyContent: 'space-between'}}>
        <Text note style={{maxWidth: '50%', overflow: 'hidden', ellipsizeMode: 'middle', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{deck.id}</Text>
        <Button iconLeft transparent {...{ [deck.subscribed ? 'success' : 'dark']: true }}>
          <Icon {...deck.subscribed ? { active: true } : {}} name='eye' size={30} color={'black'} />
          <Text>{deck.subscribed ? 'subscribed' : 'subscribe'} </Text>
        </Button>
      </CardItem>
    </Card>
  )
}

namespace DeckList {
  export type Data = Array<Deck.Data>
}

function DeckList({ decks = dummyDecks }: { decks: DeckList.Data }) {
  return (
    <View style={styles.container}>
      <H2>
        Decks
        <Text note> {decks.length} total </Text>
      </H2>
      <FlatList
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

export default DeckList
