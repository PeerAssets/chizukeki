import * as React from 'react'
import { View, Clipboard } from 'react-native'
import PrivateKey from './LoadPrivateKey'
import TransactionList from './Transaction'
import SendTransaction from './SendTransaction'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base'

import { Wrapper, Main } from '../generics/Layout'
import SyncButton from '../generics/sync-button'
import Modal from '../generics/modal.web'

import { Wallet as WalletData } from '../explorer'

import { WrapActionable } from './UnlockModal'

class UnlockThenCopy extends React.Component<{ keys: Wallet.Keys }, { privateKey: string, alerting: boolean }> {
  state = { privateKey: '', alerting: false }
  cache = (privateKey: string) => 
    this.setState({ privateKey })
  copy = () => {
    let keys = this.props.keys
    let privateKey = Wallet.Keys.areLocked(keys) ? 
      this.state.privateKey :
      keys.private
    let success = Clipboard.setString(PrivateKey.toString(privateKey, keys.format))
    this.setState({ privateKey: '' })
    this.setState({ alerting: true })
    setTimeout(() => {
      this.setState({ alerting: false })
    }, 2500)
    return success
  }
  render() {
    let alerting = this.state.alerting
    return [
      <Modal key='modal' open={Boolean(this.state.privateKey)} onClose={this.copy}>
        <Text> Unlocked! </Text>
        <Button styleNames='iconLeft success' style={styles.column} onPress={this.copy}>
          <Text> Copy Key to Clipboard </Text>
        </Button>
      </Modal>,
      <WrapActionable.IfLocked
        key='button'
        keys={this.props.keys}
        actionProp='onPress'
        action={Wallet.Keys.areLocked(this.props.keys) ? this.cache : this.copy}
        Component={alerting ? 
          ({ onPress }) => (
            <Button styleNames='iconLeft success' style={styles.column}
                onPress={() => this.setState({ alerting: false })}>
              <Icon name='check' />
              <Text>Key Copied!</Text>
            </Button>
          ) :
          ({ onPress }) => (
            <Button styleNames='iconLeft light' style={styles.column} onPress={onPress}>
              <Icon name='eject' />
              <Text>Export Key</Text>
            </Button>
          )
        }
      />
    ]
  }
}

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
    let { address, transactions = [], balance = 0, style, keys, sync, sendTransaction } = this.props
    return (
      <Wrapper>
        <Main>
          <Card style={{ width: '100%' }}>
            <CardItem styleNames='header'>
              <Balance balance={balance} style={style.column} />
            </CardItem>
            <CardItem>
              <Body style={style.body}>
                <UnlockThenCopy keys={keys}/>
                <SyncButton style={style.column} {...sync} />
              </Body>
            </CardItem>
            <CardItem styleNames='footer'>
              <Address address={address} style={style.body} />
            </CardItem>
          </Card>
          <SendTransaction {...sendTransaction} />
        </Main>
        <TransactionList transactions={transactions} />
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
  export function isLoaded(wallet: Loading | Data | null): wallet is Data {
    return Boolean(wallet && wallet.hasOwnProperty('_meta'))
  }
}

export default Wallet
