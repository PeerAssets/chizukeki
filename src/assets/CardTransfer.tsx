import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon } from 'native-base'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

import { Secondary } from '../generics/Layout'

import { CardTransfer as CardTransferData } from './papi'

namespace CardTransfer {
  export type Data = CardTransferData
}

import Transaction from '../generics/transaction-like'

function CardTransfer({
  item: { amount, deck_name = '', receiver, sender, transaction: { timestamp } }
}: { item: CardTransfer.Data }) {
  return (
    <Transaction {...{ amount, timestamp }}
      asset={deck_name}
      addresses={[ amount > 0 ? sender : receiver ]} />
  )
}

namespace CardTransferList {
  export type Data = Array<CardTransfer.Data>
}

function CardTransferList({ cardTransfers, style = {} }: { style?: any, cardTransfers: CardTransferList.Data }) {
  return (
    <Secondary style={style}>
      <Text>
        <H2>Card Transfers</H2>
        <Text styleNames='note'> {cardTransfers.length} total </Text>
      </Text>
      <FlatList
        enableEmptySections // silence error, shouldn't be necessary when react-native-web implements FlatList
        data={cardTransfers}
        renderItem={CardTransfer} />
    </Secondary>
  )
}

export { CardTransfer }
export default CardTransferList
