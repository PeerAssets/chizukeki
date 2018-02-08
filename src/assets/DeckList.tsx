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

let smallNoteStyle = {maxWidth: '50%', overflow: 'hidden', ellipsizeMode: 'middle', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}
function Deck({ item: deck }: { item: Deck.Data }) {
  return (
    <Card>
      <CardItem header>
        <Body style={{justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'row'}}>
          <Text>{deck.name}</Text>
          <Button iconLeft transparent {...{ [deck.subscribed ? 'success' : 'dark']: true }} style={{ marginRight: -30, marginTop: -20 }}>
            <Icon {...deck.subscribed ? { active: true } : {}} name='eye' size={30} color={'black'} />
            <Text style={{ paddingLeft: 5, paddingRight: 0 }}>{deck.subscribed ? 'subscribed' : 'subscribe'} </Text>
          </Button>
        </Body>
      </CardItem>
      <CardItem footer style={{alignItems: 'flex-start', flexDirection: 'column'}}>
        <Text note style={smallNoteStyle}>
          id: {deck.id}
        </Text>
        <Text note style={smallNoteStyle}>issuer: {deck.issuer}</Text>
        <Text note>mode: {deck.issueMode}</Text>
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
