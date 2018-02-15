import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { Redirect } from '../routing/router'
import ActionHistory from '../generics/action-history'
import { routineStages } from '../generics/utils'
import Wallet from '../wallet/Wallet'

import * as Redux from './redux'
import Assets from './Assets' 

let { syncDecks, getDeckDetails } = Redux.routines

let selectStages = routineStages({
  syncDecks,
  //getDeckDetails
})

export default connect(
  ({ assets: { decks, balances }, wallet }: { assets: Redux.State } & { wallet: Wallet.Data }) => {
    return { decks, balances, wallet }
  },
  (dispatch: Dispatch<any>) => ({
    actions: bindActionCreators({
      syncDecks: syncDecks.trigger,
    },
    dispatch
  )})
)(Assets)
