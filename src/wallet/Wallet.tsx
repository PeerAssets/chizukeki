import * as React from 'react'
import moment from 'moment'
import { View, Clipboard } from 'react-native'
import TransactionList from './Transaction'
import SendTransaction from './SendTransaction'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon, Left, Right } from 'native-base'

import { Wrapper, Main } from '../generics/Layout'
import SyncButton from '../generics/sync-button'

import { Wallet as WalletData } from '../explorer'

import WalletKeys, { UnlockThenCopy } from './Keys'

function Balance({ balance, ...props }) {
  return (
    <View {...props}>
      <H2>{balance.toLocaleString('en')} PPC</H2>
      <Text styleNames='note'>balance</Text>
    </View>
  )
}

function Address({ address, ...props }) {
  return (
    <View {...props}>
      <Button styleNames='iconLeft dark transparent' style={styles.column} onPress={() => Clipboard.setString(address)}>
        <Icon name='clipboard' />
        <Text styleNames='note'>{address}</Text>
      </Button>
    </View>
  )
}

let styles = {
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
  column: {
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    margin: 7.5,
    flex: 1,
  }
}

@connectStyle('PeerKeeper.Wallet', styles)
class Wallet extends React.Component<
  Wallet.Data & {
    style?: any,
    sendTransaction: SendTransaction.Props
    sync: SyncButton.Logic
  }
> {
  render() {
    let { 
      _meta,
      address,
      transactions = [],
      balance = 0,
      style,
      keys,
      sync,
      sendTransaction
    } = this.props
    return (
      <Wrapper>
        <Main>
          <Card style={{ width: '100%', flex: 1, maxHeight: 265 }}>
            <CardItem styleNames='header'>
              <Balance balance={balance} style={style.column} />
            </CardItem>
            <CardItem>
              <Body style={style.body}>
                <UnlockThenCopy keys={keys}/>
                <SyncButton style={style.column} {...sync} />
              </Body>
            </CardItem>
            <Text styleNames='note' style={{ textAlign: 'center' }}>
              Block {_meta.lastSeenBlock} seen {moment(_meta.updated).fromNow()}
            </Text>
            <CardItem styleNames='footer' style={{ paddingTop: 5 }}>
              <Address address={address} style={style.body} />
            </CardItem>
          </Card>
          <SendTransaction {...sendTransaction} style={{ width: '100%', maxHeight: 265, }} />
        </Main>
        <TransactionList address={address} transactions={transactions} />
      </Wrapper>
    )
  }
}

namespace Wallet {
  export type Transaction = WalletData.Transaction
  export type PendingTransaction = WalletData.PendingTransaction

  export type Keys = WalletKeys
  export const Keys = WalletKeys
  export type Loading = {
    address: string,
    keys: Keys
  }

  export type Synced = WalletData
  export type Data = Loading & Synced
  export type Unlocked = Data & { privateKey: string }
  export function isLoaded(wallet: Loading | Data | null): wallet is Data {
    return Boolean(wallet && wallet.hasOwnProperty('_meta'))
  }
}

export default Wallet
