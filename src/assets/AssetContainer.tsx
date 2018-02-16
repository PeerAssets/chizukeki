import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { match } from 'react-router'

import Router, { Redirect } from '../routing/router'
import ActionHistory from '../generics/action-history'
import { routineStages } from '../generics/utils'

import * as Redux from './redux'
import Asset from './Asset' 

let { syncDecks, getDeckDetails, syncBalances } = Redux.routines

function Container(props: Asset.Props | { asset: false }){
  // TODO WHY DOESN'T props.asset === false work ;n;
  return (((p: any): p is {asset: false} => !p.asset)(props)) ?
    <Redirect to='/assets' /> : 
    <Asset {...props} />
}

type RootState = { assets: Redux.State }
export default connect(
  ({ assets: { decks, balances } }: RootState, { match }: { match: match<{ id : string }> }) => {
    let balance = (balances || []).filter(b => b.deck.id === match.params.id)[0]
    if(balance){
      return { asset: balance }
    }
    let deck = (decks || []).filter(deck => deck.id === match.params.id)[0]
    if(deck){
      return { asset: { deck } }
    }
    return { asset: false as false }
  },
  (dispatch: Dispatch<any>) => ({
    actions: bindActionCreators({
    },
    dispatch
  )})
)(Container)