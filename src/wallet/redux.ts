import PrivateKey from './LoadPrivateKey'
import Wallet from './Wallet'

import { ActionAware } from '../store/actions'
import Saga, { routine } from './saga'


export type State = Partial<Wallet.Data> & ActionAware.Bind

function reducer(state: State = ActionAware.initialState(routine.allTypes), action): State {
  return routine.switch<any>(action, {
    started: (payload) =>
      Object.assign({ unspentOutputs: Array<Wallet.Transaction>(), balance: 0 }, payload),
    done: (payload) => Object.assign({}, state, payload),
    failed: () => state
  }) || state
}

export default ActionAware.bind(reducer)

export const saga = Saga
export const routines = { sync: routine }