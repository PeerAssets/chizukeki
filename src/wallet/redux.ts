import PrivateKey from './LoadPrivateKey'
import Wallet from './Wallet'

import { ActionAware } from '../store/actions'
import Saga, { routine } from './saga'
import { AnyAction } from 'typescript-fsa';


export type State = Partial<Wallet.Data> & ActionAware.Bind

function walletReducer(state: State = ActionAware.initialState(routine.allTypes), action: AnyAction): State {
  return routine.switch<State>(action, {
    started: (payload): State => ({
      transactions: Array<Wallet.Transaction>(),
      balance: 0,
      ...state,
      ...payload
    }),
    done: (payload) => Object.assign({}, state, payload),
    failed: () => state
  }) || state
}

export const reducer = ActionAware.bind(walletReducer)
export const saga = Saga
export const routines = { sync: routine }