import { pick } from 'ramda'
import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Redirect } from '../routing/router'
import Wallet from '../wallet/Wallet'

import * as Redux from './redux'
import Assets from './Assets' 

let { syncAssets, spawnDeck, loadMoreCards } = Redux.routines

type RootState = { assets: Redux.State,  wallet: { wallet: Wallet.Data } }
export default connect(
  ({ assets: { routineStages, assets }, wallet: { wallet } }: RootState) => {
    return { assets, wallet, stages: routineStages }
  },
  (dispatch: Dispatch<any>) => ({
    actions: {
      syncAssets: bindActionCreators(pick(['trigger', 'stop'], syncAssets), dispatch),
      // todo ugly
      spawnDeck: bindActionCreators(pick(['trigger'], spawnDeck), dispatch).trigger,
      loadMoreCards: bindActionCreators(pick(['trigger'], loadMoreCards), dispatch).trigger
    }
  })
)(Assets)
