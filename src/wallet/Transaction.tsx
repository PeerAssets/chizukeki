import * as React from 'react'
import { Dimensions, View, TouchableOpacity, ViewStyle } from 'react-native'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon } from 'native-base/src/index'

import FlatList from 'react-native-web-lists/src/FlatList'
import moment from 'moment'

import { Wallet } from './api/cryptoid'

namespace WalletTransaction {
  export type Data = Wallet.Transaction
}

function WalletTransaction({ item: { value, timestamp } }: { item: WalletTransaction.Data }) {
  let io = (inbound, outbound) => value > 0 ? inbound : outbound
  let textProps = io({ success: true }, { dark: true })
  return (
    <Card>
      <CardItem header>
        <Left>
          <Icon {...textProps} name={`arrow-circle-o-${io('down', 'up')}`} size={30} color={'black'} />
          <Body>
            <Text {...textProps}>
              {io('+', '-')}
              {value.toString()} PPC
            </Text>
            <Text note>{moment(timestamp).fromNow()}</Text>
          </Body>
        </Left>
      </CardItem>
      <CardItem footer style={{maxWidth: '100%'}}>
      {/*
        <Text note style={{ellipsizeMode: 'middle', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
    <View style={styles.card}>
      <H2>Transactions</H2>
      <FlatList
        data={transactions}
        renderItem={WalletTransaction} />
    </View>
  )
}

let styles = {
  card: {
    flex: 2,
    minWidth: 200,
    margin: 7.5,
  },
  transaction: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  },
  main: {
    paddingLeft: 10,
    flex: 9,
  },
  top: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  timestamp: {
    textAlignVertical: 'top',
  }
}


export default TransactionList
