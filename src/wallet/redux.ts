import PrivateKey from './LoadPrivateKey'
import Wallet from './Wallet'

import Saga, { routine } from './saga'


type Creator<T extends string, P> = (payload: P) => { type: T, payload: P }

function Creator<T extends string, P>(name: T): Creator<T, P> {
  return (payload: P) => ({ type: name, payload })
}

namespace Redux {

  export type State = Partial<Wallet.Data>

  export enum ActionType {
    LoadKey = 'LOAD_PRIVATE_KEY',
    SyncUTXO = 'SYNC_UTXO/SUCCESS',
  }

  export type Action = 
    | { type: ActionType.LoadKey, payload: PrivateKey.Data }
    | { type: ActionType.SyncUTXO, payload: Wallet.Transaction }

  export const actionCreators = {
    loadPrivateKey: Creator<ActionType.LoadKey, PrivateKey.Data>(ActionType.LoadKey)
  }

  export function reducer(state: State, a: Action): State {
    switch (a.type) {
      case ActionType.LoadKey:
        return Object.assign({ unspentOutputs: Array<Wallet.Transaction>(), balance: 0 }, a.payload)
      case ActionType.SyncUTXO:
        return Object.assign({}, state, a.payload)
      default:
        return state || {}
    }
  }
  export const saga = Saga
}

export default Redux