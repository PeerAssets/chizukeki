import * as React from 'react'
import { Dimensions, View, Text } from 'react-native'
import PrivateKey from './LoadPrivateKey'
import TransactionList from './Transaction'
import { Button, Card, connectStyle } from 'native-base/src/index'
import EStyleSheet from 'react-native-extended-stylesheet';

namespace Wallet {
  export type Transaction = {
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

function Balance({ balance }) {
  return (
    <View style={styles.column}>
      <Text>Balance: ¤{balance.toLocaleString('en')}</Text>
    </View>
  )
}

function TransactionCount({ unspentOutputs }) {
  return (
    <View style={styles.column}>
      <Text>{unspentOutputs.length} transactions</Text>
    </View>
  )
}


let styles = {
  container: {
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  card: {
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  column: {
    //alignItems: 'center',
    //flex: 1,
  },
  separator: {
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
    color: 'blue'
  },
}

const Wallet = connectStyle('PeerKeeper.Wallet', styles)(
  class Wallet extends React.Component< Partial<Wallet.Data> & { style: any }> {
    render() {
      let { address, unspentOutputs = [], balance = 0, style } = this.props
      return (
        <Card style={style.card}>
          <View style={style.header}>
            <Text>Address: {address}</Text>
          </View>
          <View style={style.body}>
            <Balance balance={balance} />
            <View style={style.separator} />
            <TransactionCount unspentOutputs={unspentOutputs} />
          </View>
          <View style={[style.row, { paddingVertical: 8 }]}>
            {/*<Button> <Text> Export </Text> </Button>*/}
          </View>
          <TransactionList />
        </Card>
      )
    }
  }
)

export default Wallet
