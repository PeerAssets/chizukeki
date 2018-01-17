import PrivateKey from './LoadPrivateKey'
import Wallet from './Wallet'

import { ActionHistory } from '../store/actions'
import Saga, { syncWallet, sendTransaction } from './saga'
import { AnyAction } from 'typescript-fsa';


export type State = { wallet?: undefined | Wallet.Loading | Wallet.Data } & ActionHistory.Bind

function walletReducer(state: State = ActionHistory.of(syncWallet.routine.allTypes), action: AnyAction): State {
  return syncWallet.routine.switch<State>(action, {
    started: payload => ({
      ...state,
      wallet: payload
    }),
    done: (payload) => ({
      ...state,
      wallet: Object.assign(state.wallet, payload)
    }),
    failed: () => state
  }) || state
}

export const reducer = ActionHistory.bind(walletReducer)
export const saga = Saga
export const routines = {
  sync: syncWallet.routine,
  sendTransaction: sendTransaction.routine
}