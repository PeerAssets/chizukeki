import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { match } from 'react-router'

import Router, { Redirect } from '../routing/router'
import ActionHistory from '../generics/action-history'
import { routineStages, Diff, Omit } from '../generics/utils'

import Wallet from '../wallet/Wallet'

import * as Redux from './redux'
import Asset from './Asset' 

let { getDeckDetails, sendAssets } = Redux.routines

type WrapProps = Asset.Props | { redirect: true }
function Container(props: WrapProps){
  // TODO WHY DOESN'T props.asset === false work ;n;
  return (((p: any): p is {redirect: true} => Boolean(p.redirect))(props)) ?
    <Redirect to='/assets' /> : 
    <Asset {...props} />
}

type RootState = { assets: Redux.State,  wallet: { wallet: Wallet.Data } }

export default connect(
  ({ wallet: { wallet }, assets: { decks, balances } }: RootState, { match }: { match: match<{ id : string }> }): Omit<Asset.Props, 'actions'> | { redirect: true } => {
    let balance = (balances || []).filter(b => b.deck.id === match.params.id)[0]
    if(balance){
      return { asset: balance, wallet }
    }
    let deck = (decks || []).filter(deck => deck.id === match.params.id)[0]
    if(deck){
      return { asset: { deck }, wallet  }
    }
    return { redirect: true as true }
  },
  (dispatch: Dispatch<any>) => ({
    actions: bindActionCreators({
      send: sendAssets.trigger
    },
    dispatch
  )})
)(Container)


type Or = { one: true } | { two: true }
let f = (): Or => (Math.random() > 0.5 ? { one: true }: { two: true })