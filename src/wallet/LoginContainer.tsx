import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Redirect } from '../routing/router'
import { routineStages } from '../generics/utils'
import { lockKey } from '../lib/encrypt-key'

import PrivateKey from './LoadPrivateKey'
import * as Redux from './redux'
import Wallet from './Wallet' 
import LoadPrivateKey from './LoadPrivateKey';

let {  sync } = Redux.routines

type Props = {
  wallet: Wallet.Data,
  stages: {
    sync: typeof sync.currentStage,
  }
  actions: {
    sync: typeof sync.trigger
  }, 
}

function lockPrivateKey(sync: Props['actions']['sync']){
  return async ({ privateKey, password, format, address }: LoadPrivateKey.Data, syncNeeded: boolean = true) => {
    if(password){
      let locked = await lockKey(privateKey, password)
      sync({ keys: { format, locked }, address })
    } else {
      sync({ keys: { format, private: privateKey }, address })
    }
  }
}


// TODO the LoadPrivateKey should maybe be broken into a seperate login subapp, but it's kinda entangled
function Container({ stages, actions, wallet }: Props){
  if(Wallet.isLoaded(wallet)){
    return <Redirect to='/wallet'/>
  }
  return <PrivateKey syncStage={stages.sync} loadPrivateKey={lockPrivateKey(actions.sync)} />
}

let selectStages = routineStages({
  sync
})

export default connect(
  ({ wallet: { actionHistory, wallet } }: { wallet: Redux.State }) => {
    return {
      stages: selectStages(actionHistory),
      wallet
    }
  },
  (dispatch: Dispatch<any>) => ({ actions: bindActionCreators({
    sync: sync.trigger,
  }, dispatch) })
)(Container)
