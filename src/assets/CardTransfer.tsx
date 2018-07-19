import * as React from 'react'
import { sortWith, descend, propOr } from 'ramda'
import { View } from 'react-native'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon } from 'native-base'

import FlatList from '../generics/FlatList'
import moment from 'moment'

import { Secondary } from '../generics/Layout'
import RoutineButton from '../generics/routine-button'

import { CardTransfer as CardTransferData } from './papi'
import TransactionLike from '../generics/transaction-like'

import { TransactionDetails } from '../wallet/Transaction'
import { Wallet } from '../explorer/common'

namespace CardTransfer {
  export type Data = CardTransferData
  export type Pending = Pick<Data,
    | 'amount'
    | 'txid'
    | 'deck_id'
    | 'deck_name'
    | 'sender'
    | 'receiver'
    | 'asset_specific_data'
    > & {
      transaction: Pick<Wallet.PendingTransaction, 'id' | 'timestamp' | 'raw'>
    }
}

// default infinity to put pending transactions first
const sortDesc = sortWith([
  'blocknum', 'blockseq', 'cardseq'
].map(key => descend(propOr(Infinity, key))))


function CardTransfer({
  item: { amount, deck_name = '', receiver, sender, txid, ...transfer }
}: { item: CardTransfer.Data | CardTransfer.Pending }) {
  // TODO selfSend should be more flexible to allow for sending to both self and others... I guess

  let transaction = ('transaction' in transfer) && transfer.transaction
  let selfSend = sender === receiver
  let timestamp = transaction
    ? transaction.timestamp
    : 'pending'
  return (
    <TransactionLike 
      amount={selfSend ? 0 : amount}
      type={selfSend ? 'SELF_SEND' : amount > 0 ? 'CREDIT' : 'DEBIT'}
      timestamp={timestamp}
      asset={deck_name}
      addresses={[amount > 0 ? sender : receiver]}>
      {transaction && (
        <TransactionDetails asset {...transaction}>
          {transfer.asset_specific_data &&
            <Text styleNames='bounded note' ellipsizeMode='middle' numberOfLines={1}>
              Asset Specific Data: {transfer.asset_specific_data}
            </Text>
          }
        </TransactionDetails>
      )}
    </TransactionLike>
  )
}

namespace CardTransferList {
  export type Data = Array<CardTransfer.Data>
  export type Pending = Array<CardTransfer.Pending>
}

interface CardTransferListProps {
  style?: any,
  cardTransfers: Array<CardTransfer.Data | CardTransfer.Pending>,
  loadMore: () => any,
  stage: string | undefined,
  canLoadMore: boolean
}

function CardTransferList({
  cardTransfers,
  loadMore,
  canLoadMore,
  style = {},
  stage
}: CardTransferListProps) {
  return (
    <Secondary style={style}>
      <Text>
        <H2>Card Transfers</H2>
        <Text styleNames='note'> {cardTransfers.length} total </Text>
      </Text>
      <FlatList
        enableEmptySections // silence error, shouldn't be necessary when react-native-web implements FlatList
        data={sortDesc(cardTransfers)}
        keyExtractor={t => t.transaction.id + (t.cardseq || t.receiver)}
        renderItem={CardTransfer} />
      <RoutineButton
        onPress={canLoadMore ? loadMore : () => { }}
        DEFAULT={canLoadMore ? 'Load More' : 'All Card Transfers Loaded'}
        STARTED='Loading'
        dismiss={[{ stage: 'DONE', auto: true, onPressDismiss: canLoadMore ? loadMore : () => { } }]}
        styleNames={canLoadMore ? 'bordered block' : 'bordered block disabled'}
        stage={stage} />
    </Secondary>
  )
}

export { CardTransfer }
export default CardTransferList
