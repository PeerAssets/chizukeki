import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Redirect } from '../routing/router'
import { lockKey } from '../lib/encrypt-key'

import PrivateKey from './LoadPrivateKey'
import * as Redux from './redux'
import { routines as assetRoutines } from '../assets/redux'
import Wallet from './Wallet' 
import LoadPrivateKey from './LoadPrivateKey';

let { sync } = Redux.routines
let syncAssets = assetRoutines.syncAssets

type Props = {
  wallet: Wallet.Data
  stages: {
    sync: typeof sync.currentStage
  }
  actions: {
    sync: typeof sync.trigger
    syncAssets: typeof syncAssets.trigger
  } 
}

function lockPrivateKey(sync: Props['actions']['sync'], syncAssets: Props['actions']['syncAssets']){
  return async ({ privateKey, password, format, address }: LoadPrivateKey.Data, syncNeeded: boolean = true) => {
    if(password){
      let locked = await lockKey(privateKey, password)
      sync({ keys: { format, locked }, address })
    } else {
      sync({ keys: { format, private: privateKey }, address })
    }
    syncAssets({ address })
  }
}

// TODO the LoadPrivateKey should maybe be broken into a seperate login subapp, but it's kinda entangled
function Container({ stages, actions, wallet }: Props){
  if(Wallet.isLoaded(wallet)){
    return <Redirect to='/wallet'/>
  }
  return <PrivateKey
    syncStage={stages.sync}
    loadPrivateKey={lockPrivateKey(actions.sync, actions.syncAssets)} />
}

export default connect(
  ({ wallet: { routineStages: { sync }, wallet } }: { wallet: Redux.State }) => {
    return {
      stages: { sync },
      wallet
    }
  },
  (dispatch: Dispatch<any>) => ({ actions: bindActionCreators({
    sync: sync.trigger,
    syncAssets: syncAssets.trigger,
  }, dispatch) })
)(Container)
