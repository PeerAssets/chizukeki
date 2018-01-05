import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import * as Redux from './redux'
import Wallet from './Wallet'

type GlobalState = { wallet: Redux.State }

function Container({ action, routines, ...props }: Redux.State & { routines: typeof Redux.routines }){
  return props.privateKey ?
    <Wallet {...props}/> :
    <PrivateKey action={action.latest} loadPrivateKey={routines.sync.trigger} />
}

export default connect(
  ({ wallet }: GlobalState) => wallet,
  (dispatch: Dispatch<any>) => ({ routines: {
    sync: bindActionCreators({ trigger: Redux.routines.sync.trigger }, dispatch)
  } })
)(Container)
