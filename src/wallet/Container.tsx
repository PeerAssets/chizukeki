import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Redux from './redux'
import Wallet from './Wallet'

type GlobalState = { wallet: Redux.State } & any

function Container({ routines, ...props }: Redux.State & { routines: typeof Redux.routines }){
  return props.privateKey ?
    <Wallet {...props}/> :
    <PrivateKey loadPrivateKey={routines.sync.trigger} />
}

export default connect(
  ({ wallet }: GlobalState) => wallet,
  (dispatch: Dispatch<any>) => ({ routines: {
    sync: bindActionCreators(Redux.routines.sync, dispatch)
  } })
)(Container)
