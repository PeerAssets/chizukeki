import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon, Right, Badge } from 'native-base'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

import { Secondary } from '../generics/Layout'
import Transaction from '../generics/transaction-like'
import { Wallet } from '../explorer'

namespace WalletTransaction {
  export type Data = Wallet.Transaction
}

function TransactionDetails({ confirmations, id, assetAction }: WalletTransaction.Data) {
  return (
    <CardItem styleNames='footer' style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Text styleNames='bounded note' ellipsizeMode='middle' numberOfLines={1}>
        id: {id}
      </Text>
      <Text styleNames='bounded note' ellipsizeMode='middle' numberOfLines={1}>
        confirmations: {confirmations}
      </Text>
  { assetAction && <Badge><Text>{assetAction}</Text></Badge> }
    </CardItem>
  )
}

function WalletTransaction({ item }: { item: WalletTransaction.Data }) {
  return (
    <Transaction asset='PPC' {...item}>
      <TransactionDetails {...item} />
    </Transaction>
  )
}

namespace TransactionList {
  export type Data = Array<WalletTransaction.Data>
}

function TransactionList({ transactions }: { transactions: TransactionList.Data }) {
  return (
    <Secondary>
      <Text>
        <H2>Transactions</H2>
        <Text styleNames='note'> {transactions.length} total </Text>
      </Text>
      <FlatList
        enableEmptySections // silence error, shouldn't be necessary when react-native-web implements FlatList
        data={transactions}
        renderItem={WalletTransaction} />
    </Secondary>
  )
}

export { WalletTransaction }
export default TransactionList
