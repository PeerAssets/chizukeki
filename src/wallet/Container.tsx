import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import * as Redux from './redux'
import Wallet from './Wallet'

type Props = {
  syncStage: typeof Redux.routines.sync.currentStage 
  actions: { sync: typeof Redux.routines.sync.trigger } 
  wallet: Wallet.Data
}

function Container({ syncStage, actions, wallet }: Props){
  return Wallet.isLoaded(wallet) ?
    <Wallet {...wallet}/> :
    <PrivateKey syncStage={syncStage} loadPrivateKey={actions.sync} />
}

export default connect(
  ({ wallet: { actionHistory, wallet } }: { wallet: Redux.State }) => {
    return {
      syncStage: Redux.routines.sync.stage(actionHistory.latest), 
      wallet
    }
  },
  (dispatch: Dispatch<any>) => ({ actions: bindActionCreators({
    sync: Redux.routines.sync.trigger
  }, dispatch) })
)(Container)
