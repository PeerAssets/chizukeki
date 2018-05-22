import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Redirect } from '../routing/router'

import * as Redux from './redux'
import Wallet from './Wallet' 

let { sendTransaction, sync } = Redux.routines

type Props = {
  wallet: Wallet.Data,
  routineStages: Redux.State['routineStages'],
  actions: {
    triggerSync: typeof sync.trigger
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
        trigger: () => actions.triggerSync({
          address: wallet.address,
          cachedTransactionIds: wallet.transactions ? 
            wallet.transactions
              .filter(t => t.confirmations > 10)
              .map(t => t.id) : 
            undefined
        }),
        stop: actions.stopSync
      }} />
  )
}

export default connect(
  ({ wallet: { routineStages, wallet } }: { wallet: Redux.State }) => {
    return {
      routineStages,
      wallet
    }
  },
  (dispatch: Dispatch<any>) => ({ actions: bindActionCreators({
    triggerSync: sync.trigger,
    stopSync: sync.stop,
    sendTransaction: Redux.routines.sendTransaction.trigger
  }, dispatch) })
)(Container)

