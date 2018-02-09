import * as React from 'react'
import { View } from 'react-native'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon } from 'native-base/src/index'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

import { Wallet } from '../explorer'

namespace WalletTransaction {
  export type Data = Wallet.Transaction
}

function WalletTransaction({ item: { amount, timestamp, confirmations } }: { item: WalletTransaction.Data }) {
  let io = (inbound, outbound) => amount > 0 ? inbound : outbound
  let textProps = io({ success: true }, { dark: true })
  return (
    <Card>
      <CardItem header>
        <Left>
          <Icon {...textProps} name={`arrow-circle-o-${io('down', 'up')}`} size={30} color={'black'} />
          <Body>
            <Text {...textProps}>
              {io('+', '-')}
              {amount.toString()} PPC
            </Text>
            <Text note>{moment(timestamp).fromNow()}</Text>
          </Body>
        </Left>
      </CardItem>
      <CardItem footer style={{maxWidth: '100%'}}>
        <Text bounded note>
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

namespace TransactionList {
  export type Data = Array<WalletTransaction.Data>
}

function TransactionList({ transactions }: { transactions: TransactionList.Data }) {
  return (
    <View style={styles.container}>
      <H2>
        Transactions 
        <Text note> {transactions.length} total </Text>
      </H2>
      <FlatList
        data={transactions}
        renderItem={WalletTransaction} />
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


export default TransactionList
