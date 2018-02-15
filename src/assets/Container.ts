import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Redirect } from '../routing/router'
import ActionHistory from '../generics/action-history'
import { routineStages } from '../generics/utils'
import Wallet from '../wallet/Wallet'

import * as Redux from './redux'
import Assets from './Assets' 

let { syncDecks, getDeckDetails, syncBalances } = Redux.routines

let selectStages = routineStages({
  syncDecks,
  //getDeckDetails
})

type RootState = { assets: Redux.State,  wallet: { wallet: Wallet.Data } }
export default connect(
  ({ assets: { decks, balances }, wallet: { wallet } }: RootState) => {
    return { decks, balances, wallet }
  },
  (dispatch: Dispatch<any>) => ({
    actions: bindActionCreators({
      syncDecks: syncDecks.trigger,
      syncBalances: syncBalances.trigger,
    },
    dispatch
  )})
)(Assets)
