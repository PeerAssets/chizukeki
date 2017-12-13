import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Redux from './redux'

type GlobalState = { wallet: Redux.State } & any

function DataVis({ address, unspentOutputs =[] }: Redux.State){
  return (
    <View>
      <Text>Address: {address}</Text>
      <Text> txos: </Text>
      <Text>
      { unspentOutputs.map((utxo, i) => <Text key={i}>{JSON.stringify(utxo)}</Text>) }
      </Text>
    </View>
  )

}

function Wallet({ actions, ...props }: Redux.State & { actions: typeof Redux.actionCreators }){
  return props.privateKey ?
    <DataVis {...props}/> :
    <PrivateKey loadPrivateKey={actions.loadPrivateKey} />
}

export default connect(
  ({ wallet }: GlobalState) => wallet,
  (dispatch: Dispatch<any>) =>
    ({ actions: bindActionCreators(Redux.actionCreators, dispatch) })
)(Wallet)
