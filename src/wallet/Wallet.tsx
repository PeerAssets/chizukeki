import * as React from 'react'
import { Dimensions, View, ViewStyle, Clipboard } from 'react-native'
import PrivateKey from './LoadPrivateKey'
import TransactionList from './Transaction'
import SendTransaction from './SendTransaction'
import { Button, CardItem, Body, Text, Card, connectStyle, H2 } from 'native-base/src/index'
import Wrapper from './Wrapper'

import RoutineButton from '../generics/routine-button'

import { Wallet as WalletData } from './explorerApi/common'

import { WrapActionable } from './UnlockModal'

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
  Wallet.Data & {
    style?: any,
    sendTransaction: SendTransaction.Props
    sync: {
      stage: string | undefined,
      enabled: boolean,
      start: () => any,
      stop: () => any,
    }
  },
  { transactions: boolean }
> {
  state = {
    transactions: Dimensions.get('window').width > 600
  }
  componentDidMount() {
    let sync = this.props.sync
    if(sync.enabled){
      sync.start()
    }
  }
  render() {
    let { address, transactions = [], balance = 0, style, keys, sync, sendTransaction } = this.props
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
                <WrapActionable.IfLocked
                  keys={keys}
                  actionProp='onPress'
                  action={() => Clipboard.setString(_Keys.areLocked(keys) ? keys.locked : keys.private)}
                  Component={({ onPress }) => 
                    <Button light style={style.column} onPress={onPress}>
                      <Text> Export </Text>
                    </Button>
                  }
                />
                <RoutineButton style={style.column}
                  icons={{ DEFAULT: 'refresh', DONE: 'refresh' }}
                  warning={!sync.enabled}
                  onPress={sync.enabled ? sync.stop : sync.start}
                  stage={sync.stage}
                  DEFAULT={ sync.enabled ? 'Syncing Enabled' : 'Syncing Disabled' }
                  FAILED='Recent Sync Failed' />
              </Body>
            </CardItem>
          </Card>
          <SendTransaction style={style.card} {...sendTransaction} />
        </View>
        {this.state.transactions && <TransactionList transactions={transactions} />}
      </Wrapper>
    )
  }
}

type _Keys = _Keys.Locked | _Keys.Unlocked
namespace _Keys {
  type WithFormat = {
    format: PrivateKey.Data['format'],
  }
  export type Locked = WithFormat & { locked: string }
  export type Unlocked = WithFormat & { private: string }
  export function areLocked(keys: _Keys): keys is Locked {
    return keys.hasOwnProperty('locked')
  }
}

namespace Wallet {
  export type Transaction = WalletData.Transaction
  export type PendingTransaction = WalletData.PendingTransaction

  export type Keys = _Keys
  export const Keys = _Keys
  export type Loading = {
    address: string,
    keys: Keys
  }

  export type Synced = WalletData
  export type Data = Loading & Synced
  export type Unlocked = Data & { privateKey: string }
  export function isLoaded(wallet: Loading | Data | undefined): wallet is Data {
    return Boolean(wallet && wallet.hasOwnProperty('_meta'))
  }
}

export default Wallet
