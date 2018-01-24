import * as React from 'react'
import { Dimensions, View, ViewStyle, Clipboard } from 'react-native'
import PrivateKey from './LoadPrivateKey'
import TransactionList from './Transaction'
import SendTransaction from './SendTransaction'
import { Button, CardItem, Body, Text, Card, connectStyle, H2 } from 'native-base/src/index'
import Wrapper from './Wrapper'

import RoutineButton from '../generics/routine-button'

import { Wallet as WalletData } from './explorerApi/common'

class Toggleable extends React.Component<any> {
  render() {
    let { toggle = () => { }, active = false, children, ...props } = this.props
    return (
      <Button {...active ? { primary: true } : { light: true }} {...props} onClick={toggle}>
        {children}
      </Button>
    )
  }
}

function Balance({ balance, ...props }) {
  return (
    <View {...props}>
      <H2>{balance.toLocaleString('en')} PPC</H2>
      <Text note>balance</Text>
    </View>
  )
}

function TransactionCount({ unspentOutputs, ...props }) {
  return (
    <Toggleable {...props}>
      <Text>{unspentOutputs.length} transactions</Text>
    </Toggleable>
  )
}


let styles = {
  main: {
    flex: 3,
    minWidth: 350,
    margin: 7.5,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: 'hidden',
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: '350px'
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 7.5,
    flex: 1,
  }, }

@connectStyle('PeerKeeper.Wallet', styles)
class Wallet extends React.Component<
  Partial<Wallet.Data> & {
    style?: any,
    isSyncing: boolean,
    syncStage: string | undefined,
    toggleSync: () => void,
    sendTransaction: (s: SendTransaction.Data) => void
  },
  { transactions: boolean }
> {
  state = {
    transactions: Dimensions.get('window').width > 600
  }
  render() {
    let { address, transactions = [], balance = 0, style, privateKey, isSyncing, sendTransaction } = this.props
    return (
      <Wrapper>
        <View style={style.main}>
          <Card>
            <CardItem header>
              <Balance balance={balance} style={style.column} />
            </CardItem>
            <CardItem>
              <Body style={style.body}>
                <TransactionCount active={this.state.transactions}
                  unspentOutputs={transactions}
                  style={style.column}
                  toggle={() => this.setState({ transactions: !this.state.transactions })} />
                <Button light disabled={!privateKey} style={style.column} onClick={() => privateKey && Clipboard.setString(privateKey)}>
                  <Text> Export </Text>
                </Button>
                <RoutineButton style={style.column}
                  warning={!isSyncing}
                  onPress={this.props.toggleSync}
                  stage={this.props.syncStage}
                  DEFAULT={ isSyncing ? 'Syncing Enabled' : 'Syncing Disabled' }
                  FAILED='Recent Sync Failed' />
              </Body>
            </CardItem>
          </Card>
          <SendTransaction style={style.card} send={sendTransaction} syncStage='' />
        </View>
        {this.state.transactions && <TransactionList transactions={transactions} />}
      </Wrapper>
    )
  }
}

namespace Wallet {
  export type Transaction = WalletData.Transaction
  export type PendingTransaction = WalletData.PendingTransaction
  export type Loading = PrivateKey.Data
  export type Data = Loading & WalletData
  export function isLoaded(wallet: Loading | Data | undefined): wallet is Data {
    return Boolean(wallet && wallet.hasOwnProperty('_meta'))
  }
}

export default Wallet
