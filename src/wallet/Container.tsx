import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Redux from './redux'

type GlobalState = { wallet: Redux.State } & any

function Wallet({ privateKey, actions }: Redux.State & { actions: typeof Redux.actionCreators }){
  return privateKey ? <Text>{privateKey}</Text> : <PrivateKey loadPrivateKey={actions.loadPrivateKey} />
}

export default connect(
  ({ wallet }: GlobalState) => wallet,
  (dispatch: Dispatch<any>) =>
    ({ actions: bindActionCreators(Redux.actionCreators, dispatch) })
)(Wallet)
