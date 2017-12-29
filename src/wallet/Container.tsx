import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import Redux from './redux'
import Wallet from './Wallet'
import { bindRoutineActions, extractRoutineActions } from '../store/routine'

type GlobalState = { wallet: Redux.State } & any

let routineActions = extractRoutineActions(Redux.routines)

function Container({ routines, ...props }: Redux.State & { routines: typeof routineActions }){
  return props.privateKey ?
    <Wallet {...props}/> :
    <PrivateKey loadPrivateKey={routines.sync.trigger} />
}

export default connect(
  ({ wallet }: GlobalState) => wallet,
  bindRoutineActions(Redux.routines)
)(Container)
