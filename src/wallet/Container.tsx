import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Redirect } from '../routing/router'
import ActionHistory from '../generics/action-history'
import { routineStages } from '../generics/utils'

import * as Redux from './redux'
import Wallet from './Wallet' 

let { sendTransaction, sync } = Redux.routines

type Props = {
  wallet: Wallet.Data,
  routineStages: Redux.State['routineStages'],
  actions: {
    sync: typeof sync.trigger
    stopSync: typeof sync.stop
    sendTransaction: typeof sendTransaction.trigger
  }
}


function Container({ routineStages, actions, wallet }: Props){
  // todo this still isn't very scaleable
  if(!Wallet.isLoaded(wallet)){
    return <Redirect to='/login'/>
  }
  return (
    <Wallet {...wallet}
      sendTransaction={{
        stage: routineStages.sendTransaction,
        send: actions.sendTransaction,
        wallet
      }}
      sync={{
        stage: routineStages.sync,
        start: () => actions.sync({ address: wallet.address }),
        stop: actions.stopSync
      }} />
  )
}

let isSyncing = function isSyncing(routine){
  let selectSyncControls = action => [ routine.stop.type, routine.trigger.type ].includes(action)
  return actionHistory => {
    let latest = ActionHistory.filter(selectSyncControls, actionHistory).latest
    return latest === routine.trigger.type
  }
}(sync)

let selectStages = routineStages({
  sync,
  sendTransaction
})

export default connect(
  ({ wallet: { routineStages, wallet } }: { wallet: Redux.State }) => {
    return {
      routineStages,
      wallet
    }
  },
  (dispatch: Dispatch<any>) => ({ actions: bindActionCreators({
    sync: sync.trigger,
    stopSync: sync.stop,
    sendTransaction: Redux.routines.sendTransaction.trigger
  }, dispatch) })
)(Container)

