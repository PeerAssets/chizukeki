import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Dimensions, Text, View } from 'react-native';
import { ActionHistory } from '../store/actions'
import PrivateKey from './LoadPrivateKey'
import * as Redux from './redux'
import Wallet from './Wallet'

let { sendTransaction, sync } = Redux.routines

type Props = {
  syncStage: typeof sync.currentStage 
  actions: {
    sync: typeof sync.trigger
    sendTransaction: typeof sendTransaction.trigger
  } 
  wallet: Wallet.Data
}

function Container({ syncStage, actions, wallet }: Props){
  return Wallet.isLoaded(wallet) ?
    <Wallet {...wallet} sendTransaction={({ amount, toAddress }) => actions.sendTransaction({ amount, toAddress, wallet })}/> :
    <PrivateKey syncStage={syncStage} loadPrivateKey={actions.sync} />
}

export default connect(
  ({ wallet: { actionHistory, wallet } }: { wallet: Redux.State }) => {
    return {
      syncStage: sync.stage(ActionHistory.filterWithPrefix(sync.trigger.type, actionHistory).latest),
      wallet
    }
  },
  (dispatch: Dispatch<any>) => ({ actions: bindActionCreators({
    sync: sync.trigger,
    sendTransaction: Redux.routines.sendTransaction.trigger
  }, dispatch) })
)(Container)

