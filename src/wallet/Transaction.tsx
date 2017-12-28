import * as React from 'react'
import { Dimensions, View, TouchableOpacity, ViewStyle } from 'react-native'
import { Button, Card, Left, CardItem, Body, Text, H2 } from 'native-base/src/index'
import EStyleSheet from 'react-native-extended-stylesheet';

import FlatList from 'react-native-web-lists/src/FlatList'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import moment from 'moment'


namespace BlockchainTransaction {
  export type Input = {
    amount: number,
    txid: string,
    n: number,
    addresses: string
  }
  export type Output = {
    script: string,
    amount: number,
    n: number,
    addresses: string,
  }
  export type Data = {
    hash: string,
    block: number,
    timestamp: Date,
    total: number,
    inputs: Array<Input>,
    outputs: Array<Output>,
  }
}

namespace WalletTransaction {
  export type Data = {
    account: string,
    address: string,
    category: "send" | "receive",
    amount: number,
    confirmations: number,

    blockhash: string,
    blockindex: number,
    txid: string,
    time: Date
  }
}

let RkView = (View as any)

let testTransactions = [
  {
    "account": "PACLI",
    "address": "n4KuTR5CzyQTbrpwbAKEdTfJERKmtHWWgr",
    "category": "receive",
    "amount": 10,
    "confirmations": 21689,
    "blockhash": "05b527fc23e47001984d43b0c7b9b9e173e971cf458c1175794d396697f344d3",
    "blockindex": 3,
    "txid": "6c578275df1eb9cb59e2bd933a7b7c5a0c7869f3044f8fd4e089fdb98204571e",
    "time": new Date(1502835418)
  }
]


function WalletTransaction({ item: { amount, address, time, category } }: { item: WalletTransaction.Data }) {
  return (
    <Card>
      <CardItem header>
        <Left>
          <Icon name="arrow-circle-o-down" size={30} color={'black'} />
          <Body>
            <Text>
              {category === 'receive' ? '+' : '-'}
              {amount.toString()} PPC
            </Text>
            <Text note>{moment(time).fromNow()}</Text>
          </Body>
        </Left>
      </CardItem>
      <CardItem footer style={{maxWidth: '100%'}}>
        <Text note style={{ellipsizeMode: 'middle', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {category === 'receive' ? 'from' : 'to'} {address}
        </Text>
      </CardItem>
    </Card>
  )
}

namespace TransactionList {
  export type Data = Array<WalletTransaction.Data>
}

function TransactionList({ transactions = testTransactions }: { transactions?: TransactionList.Data }) {
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
