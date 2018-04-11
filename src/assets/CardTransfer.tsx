import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon } from 'native-base'

import FlatList from '../generics/FlatList'
import moment from 'moment'

import { Secondary } from '../generics/Layout'
import RoutineButton from '../generics/routine-button'

import { CardTransfer as CardTransferData } from './papi'

namespace CardTransfer {
  export type Data = CardTransferData
}

import Transaction from '../generics/transaction-like'

function CardTransfer({
  item: { amount, deck_name = '', receiver, sender, transaction: { timestamp, id } }
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

function CardTransferList({ cardTransfers, loadMore, canLoadMore, style = {}, stage }: {
  style?: any,
  cardTransfers: CardTransferList.Data,
  loadMore: () => any,
  stage: string | undefined,
  canLoadMore: boolean
}) {
  return (
    <Secondary style={style}>
      <Text>
        <H2>Card Transfers</H2>
        <Text styleNames='note'> {cardTransfers.length} total </Text>
      </Text>
      <FlatList
        enableEmptySections // silence error, shouldn't be necessary when react-native-web implements FlatList
        data={cardTransfers}
        keyExtractor={t => t.transaction.id + t.cardseq}
        renderItem={CardTransfer}/>
      <RoutineButton
        onPress={canLoadMore ? loadMore : () => { }}
        DEFAULT={canLoadMore ? 'Load More' : 'All Card Transfers Loaded'}
        STARTED='Loading'
        dismiss={[{ stage: 'DONE', auto: true, onPressDismiss: canLoadMore ? loadMore : () => { } } ]}
        styleNames={canLoadMore ? 'bordered block' : 'bordered block disabled'}
        stage={stage} />
    </Secondary>
  )
}

export { CardTransfer }
export default CardTransferList
