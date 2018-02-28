import { pick } from 'ramda'
import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Redirect } from '../routing/router'
import Wallet from '../wallet/Wallet'

import * as Redux from './redux'
import Assets from './Assets' 

let { syncDecks, getDeckDetails, syncBalances, spawnDeck } = Redux.routines

type RootState = { assets: Redux.State,  wallet: { wallet: Wallet.Data } }
export default connect(
  ({ assets: { routineStages, decks, balances }, wallet: { wallet } }: RootState) => {
    return { decks, balances, wallet, stages: routineStages }
  },
  (dispatch: Dispatch<any>) => ({
    actions: {
      syncDecks: bindActionCreators(pick(['trigger', 'stop'], syncDecks), dispatch),
      syncBalances: bindActionCreators(pick(['trigger', 'stop'], syncBalances), dispatch),
      // todo ugly
      spawnDeck: bindActionCreators(pick(['trigger'], spawnDeck), dispatch).trigger
    }
  })
)(Assets)
