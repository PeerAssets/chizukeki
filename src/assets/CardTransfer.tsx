import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon } from 'native-base'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

import { CardTransfer as CardTransferData } from './papi'

namespace CardTransfer {
  export type Data = CardTransferData
}

function CardTransfer({
  item: { amount, deck_name = '', transaction: { confirmations, timestamp } }
}: { item: CardTransfer.Data }) {
  let io = (inbound, outbound) => amount > 0 ? inbound : outbound
  let textProps = { styleNames: io('success', 'dark') }
  return (
    <Card>
      <CardItem styleNames='header'>
        <Left>
          <Icon {...textProps} name={`arrow-circle-o-${io('down', 'up')}`} size={30} color={'black'} />
          <Body>
            <Text {...textProps}>
              {io('+', '-')}
              {amount.toString()} {deck_name}
            </Text>
            <Text styleNames='note'>{moment(timestamp).fromNow()}</Text>
          </Body>
        </Left>
      </CardItem>
      <CardItem styleNames='footer' style={{maxWidth: '100%'}}>
        <Text styleNames='bounded note'>
          {confirmations} confirmations
        </Text>
      {/*
        <Text bounded note  ellipsizeMode='middle' numberOfLines={1}>
          {io('from', 'to')} {address}
        </Text>
      */}
      </CardItem>
    </Card>
  )
}

namespace CardTransferList {
  export type Data = Array<CardTransfer.Data>
}

function CardTransferList({ cardTransfers, style = {} }: { style?: any, cardTransfers: CardTransferList.Data }) {
  return (
    <View style={[styles.container, style]}>
      <Text>
        <H2>Card Transfers</H2>
        <Text styleNames='note'> {cardTransfers.length} total </Text>
      </Text>
      <FlatList
        enableEmptySections // silence error, shouldn't be necessary when react-native-web implements FlatList
        data={cardTransfers}
        renderItem={CardTransfer} />
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


export { CardTransfer }
export default CardTransferList
