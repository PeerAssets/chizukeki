import { pick } from 'ramda'
import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { match } from 'react-router'

import Router, { Redirect } from '../routing/router'
import {  Diff, Omit } from '../generics/utils'

import Wallet from '../wallet/Wallet'

import * as Redux from './redux'
import Asset from './Asset' 

let { sendAssets, syncAsset } = Redux.routines

type RootState = { assets: Redux.State,  wallet: { wallet: Wallet.Data } }
type RouterProps = { match: match<{ id : string }> }
type MappedProps = { redirect: true } | (
  Omit<Asset.Props, 'actions' | 'sync'> & { stage: string | undefined }
)

function Container(_props: MappedProps & { actions: Record<'send' | 'triggerSyncAsset' | 'stopSyncAsset', any> }){
  if(((p: any): p is {redirect: true} => Boolean(p.redirect))(_props)){
    return <Redirect to='/assets' />
  }
  let { stage, actions: { send, triggerSyncAsset, stopSyncAsset }, ...props } = _props
  return <Asset
    sync={{ stage, trigger: () => triggerSyncAsset({ asset: props.asset, address: props.wallet.address }), stop: stopSyncAsset }}
    actions={{ send }}
    {...props} />
}

export default connect(
  ({ wallet: { wallet }, assets: { routineStages, assets } }: RootState, { match }: RouterProps): MappedProps => {

    // todo right not unowned assets aren't synced
    let asset = (assets || []).filter(a => a.deck.id === match.params.id)[0]
    if(asset){
      return { asset, wallet, stage: routineStages.syncAsset, sendAssetsStage: routineStages.sendAssets }
    }
    return { redirect: true as true }
  },
  (dispatch: Dispatch<any>) => ({
    actions: bindActionCreators({
      triggerSyncAsset: syncAsset.trigger,
      stopSyncAsset: syncAsset.stop,
      send: sendAssets.trigger,
    },
    dispatch
  )})
)(Container)
