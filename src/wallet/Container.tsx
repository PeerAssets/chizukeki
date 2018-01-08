import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import * as Redux from './redux'
import Wallet from './Wallet'

type Routine = {
  syncStage: typeof Redux.routines.sync.currentStage 
  actions: { sync: typeof Redux.routines.sync.trigger } 
}

function Container({ syncStage, actions, ...props }: Redux.State & Routine){
  return props.privateKey ?
    <Wallet {...props}/> :
    <PrivateKey syncStage={syncStage} loadPrivateKey={actions.sync} />
}

export default connect(
  ({ wallet }: { wallet: Redux.State }) => {
    return Object.assign({
      syncStage: Redux.routines.sync.stage(wallet.action.latest), 
      wallet
    })
  },
  (dispatch: Dispatch<any>) => ({ actions: bindActionCreators({
    sync: Redux.routines.sync.trigger
  }, dispatch) })
)(Container)
