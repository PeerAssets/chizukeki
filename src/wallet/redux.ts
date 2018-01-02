import PrivateKey from './LoadPrivateKey'
import Wallet from './Wallet'

import { ActionAware } from '../store/actions'
import Saga, { routine } from './saga'


type Creator<T extends string, P> = (payload: P) => { type: T, payload: P }

function Creator<T extends string, P>(name: T): Creator<T, P> {
  return (payload: P) => ({ type: name, payload })
}

namespace Redux {


  export type State = Partial<Wallet.Data>

  export function reducer(state: State = {}, a): State {
    return routine.switch<any>({
      started: (payload) => 
        Object.assign({ unspentOutputs: Array<Wallet.Transaction>(), balance: 0 }, payload),
      done: (payload) => Object.assign({}, state, payload),
      error: () => state
    })(a.type)
  }
  export const saga = Saga
  export const routines = { sync: routine }
}

export default Redux