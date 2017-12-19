import * as React from 'react'
import { Dimensions, View, TouchableOpacity } from 'react-native'
import { Button, RkCard, RkText, RkButton, RkStyleSheet } from 'react-native-ui-kitten'

import FlatList from 'react-native-web-lists/src/FlatList'
import Icon from 'react-native-vector-icons/dist/FontAwesome';


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

    blockhash:string,
    blockindex: number,
    txid: string,
    time: Date
  }
}

let RkView = (View as any)

let testTransactions  = [
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


function Received(){
  return (
    <RkText>
      <Icon name="rocket" size={30} color="blue" /> Received from
    </RkText>
  )
}

function WalletTransaction({ item: { amount, address, time, category } }: { item: WalletTransaction.Data }) {
  return (
    <RkView style={styles.transaction}>
      <RkText rkType='header4'>{amount.toString()} PPC</RkText>
      <RkText rkType='secondary2 hintColor'>{time.toString()}</RkText>
      <RkText rkType='secondary2 hintColor'>
        {category === 'receive' ? <Received/> : 'sent to'} {address}
      </RkText>
    </RkView>
  )
}

namespace TransactionList {
  export type Data = Array<WalletTransaction.Data>
}

function TransactionList({ transactions = testTransactions }: { transactions?: TransactionList.Data }) {
  return (
    <FlatList 
      data={transactions}
      renderItem={WalletTransaction}/>
  )
}

let styles = RkStyleSheet.create(theme => ({
  transaction: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  }
}))


export default TransactionList
