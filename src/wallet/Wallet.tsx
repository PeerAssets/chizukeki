import * as React from 'react'
import { Dimensions, View, Text } from 'react-native'
import { Button, RkCard, RkText, RkButton, RkStyleSheet } from 'react-native-ui-kitten'
import PrivateKey from './LoadPrivateKey'
import TransactionList from './Transaction'

namespace Wallet { export type Transaction = {
    script: string,
    tx_hash: string,
    tx_output_n: number,
    value: number,
  }
  export type Transactions = {
    unspentOutputs: Array<Transaction>,
    balance: number
  }
  export type Data = PrivateKey.Data & Transactions
}

let RkView = (View as any)


function Balance({ balance }) {
  return (
    <RkView style={styles.column}>
      <RkText rkType='header4'>Balance: ¤{balance.toLocaleString('en')}</RkText>
    </RkView>
  )
}

function TransactionCount({ unspentOutputs }) {
  return (
    <RkView style={styles.column}>
      <RkText rkType='header4'>{unspentOutputs.length} transactions</RkText>
    </RkView>
  )
}

function Wallet({ address, unspentOutputs = [], balance = 0 }: Partial<Wallet.Data>) {
  return (
    <RkCard style={styles.card}>
      <RkView rkCardHeader style={styles.row}>
        <RkText rkType='header4'>Address: {address}</RkText>
      </RkView>
      <RkView rkCardContent style={styles.row}>
        <Balance balance={balance}/>
        <View style={styles.separator}/>
        <TransactionCount unspentOutputs={unspentOutputs}/>
      </RkView>
      <RkView rkCardContent style={[styles.row, { paddingVertical: 8 }]}>
        <RkButton rkType='clear link' style={styles.leftButton}
            color={styles.leftButtonText.color} >
          Export
        </RkButton>
      </RkView>
      <TransactionList />
    </RkCard>
  )
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.screen.scroll,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  card: {
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    borderColor: theme.colors.border.base,
    borderBottomWidth: 1,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  separator: {
    backgroundColor: theme.colors.border.base,
    alignSelf: 'center',
    flexDirection: 'row',
    flex: 0,
    width: 1,
    height: 42
  },
  leftButton: {
    flex: 1,
    alignSelf: 'center',
  },
  leftButtonText: {
    color: theme => theme.colors.primary,
  },

}))


export default Wallet
