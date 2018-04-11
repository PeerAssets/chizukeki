import * as React from 'react'
import { View, Platform } from 'react-native'
import { Button, Card, CardItem, Text, H2, Badge, Switch } from 'native-base'

import FlatList from '../generics/FlatList'
import moment from 'moment'

import { Secondary } from '../generics/Layout'
import Transaction from '../generics/transaction-like'
import { Wallet } from '../explorer'

namespace WalletTransaction {
  export type Data = Wallet.Transaction
}

function TransactionDetails({ confirmations, id, assetAction }: WalletTransaction.Data) {
  return (
    <CardItem styleNames='footer' style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Text styleNames='bounded note' ellipsizeMode='middle' numberOfLines={1}>
        id: {id}
      </Text>
      <Text styleNames='bounded note' ellipsizeMode='middle' numberOfLines={1}>
        confirmations: {confirmations}
      </Text>
      { assetAction && <Badge styleNames='info'><Text>{assetAction}</Text></Badge> }
    </CardItem>
  )
}

class WalletTransaction extends React.PureComponent<WalletTransaction.Data & { hide?: boolean }> {
  render() {
    let { hide, ...item } = this.props
    if (hide) {
      return null
    }
    let asset = item.assetAction ? <Text>PPC <Badge styleNames='info'><Text>asset</Text></Badge></Text> : 'PPC'
    return (
      <Transaction asset={asset} {...item}>
        <TransactionDetails {...item} />
      </Transaction>
    )
  }
}

namespace TransactionList {
  export type Data = Array<WalletTransaction.Data>
}

class TransactionList extends React.Component<
  { transactions: TransactionList.Data },
  { showAssets: boolean }
> {
  toggleFilter = (showAssets = !this.state.showAssets) =>
    this.setState({ showAssets })
  constructor(props){
    super(props)
    this.state = { showAssets: true }
  }
  render() {
    let showAssets = this.state.showAssets
    let transactions = this.props.transactions
    let style = {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: 3,
      paddingRight: 3,
    }
    return (
      <Secondary>
        <View style={style as any}>
          <Text>
            <H2>Transactions</H2>
            <Text styleNames='note'> {transactions.length} total </Text>
          </Text>
          <Button styleNames={`${Platform.OS === 'web' ? 'small' : ''} info`} onPress={() => this.toggleFilter()}
            style={{ paddingLeft: 0, paddingRight: 10 }} >
            <Text>Assets</Text>
            <Switch value={showAssets} onValueChange={this.toggleFilter} />
          </Button>
        </View>
        <FlatList
          data={transactions}
          keyExtractor={t => t.id}
          renderItem={({ item }) =>
            <WalletTransaction key={item.id} hide={((!showAssets) && item.assetAction)} {...item} />
          }/>
      </Secondary>
    )
  }
}

export { WalletTransaction }
export default TransactionList
