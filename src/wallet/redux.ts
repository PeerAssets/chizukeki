import PrivateKey from './LoadPrivateKey'
import Wallet from './Wallet'

import Saga, { routine } from './saga'


type Creator<T extends string, P> = (payload: P) => { type: T, payload: P }

function Creator<T extends string, P>(name: T): Creator<T, P> {
  return (payload: P) => ({ type: name, payload })
}

type BindActionHistory = {
  lastAction: 'TRIGGER' | 'REQUEST' | 'SUCCESS' | 'FAILURE'
}

namespace Redux {

  export type State = Partial<Wallet.Data>

  export type ActionType = typeof routine._Actions

  export type Action = typeof routine._Actions

  export function reducer(state: State = {}, a: typeof routine._Actions): State {
    return routine.switch<State>({
      TRIGGER: () => 
        Object.assign({ unspentOutputs: Array<Wallet.Transaction>(), balance: 0 }, a.payload),
      SUCCESS: () => Object.assign({}, state, a.payload),
      DEFAULT: state
    })(a)
  }
  export const saga = Saga
  export const routines = { sync: routine }
}

export default Redux